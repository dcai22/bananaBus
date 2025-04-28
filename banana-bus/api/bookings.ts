import HTTPError from "http-errors";
import { collections, connectToDatabase } from "./mongoUtil";
import { findUserByToken, getRouteById, getStopById, getTripById, getVehicleById } from "./helper";
import { Booking } from "./interface";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { calcCurrentCapacity, calcCurrentLuggageCapacity } from "./trips";

dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Get a list of the user's scheduled trips in a specified timeframe
 * @param {string} token        authentication token of user
 * @param {string} timeFrame    Can be: 'past', 'upcoming', 'ongoing', 'all'
 *                              'past' bookings have arrived at their destination
 *                              'upcoming' bookings are yet to depart from their origin
 *                              'ongoing' bookings have departed but not arrived
 * @returns array of objects containing booking details
 */
export async function searchBookings(token: string, timeFrame: string) {
    await connectToDatabase();

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    
    let bookings = await collections.bookings?.find<Booking>({ userId: user._id }).toArray();
    if (!bookings) {
        throw HTTPError(400, 'user not found');
    }
    console.log("Bookings: ", bookings);

    const curTime = new Date();
    const bookingsWithIncludes = await Promise.all(bookings.map(async (b) => {
        if (timeFrame === 'all') {
            return { include: true, value: b }
        }

        const trip = await getTripById(b.tripId);
        const route = await getRouteById(trip.routeId);
        const originIndex = route.stops.findIndex(s => s.equals(b.originId));
        const destIndex = route.stops.findIndex(s => s.equals(b.destId));

        if (originIndex < 0 || destIndex < 0) {
            throw HTTPError(500, 'route does not contain required stop');
        }

        const originTime = trip.stopTimes[originIndex];
        const destTime = trip.stopTimes[destIndex];

        switch(timeFrame) {
            case 'past':
                return { include: destTime < curTime, value: b };
            case 'upcoming':
                return { include: originTime > curTime, value: b };
            case 'ongoing':
                return { include: originTime <= curTime && curTime <= destTime, value: b };
            default:
                throw HTTPError(400, 'invalid timeframe');
        }
    }))

    bookings = bookingsWithIncludes.filter(b => b.include).map((b) => b.value)

    const userBookings = await Promise.all(bookings.map(async (b) => {
        const trip = await getTripById(b.tripId);
        const route = await getRouteById(trip.routeId);

        const origin = await getStopById(b.originId);
        const dest = await getStopById(b.destId);
        const departureTime = trip.stopTimes[route.stops.findIndex(s => s.equals(b.originId))];

        return {
            _id: b._id,
            userId: b.userId,
            tripId: b.tripId,
            originName: origin.name,
            destName: dest.name,
            departureTime: departureTime,
        };
    }));
    return userBookings;
}

/**
 * Creates a booking submitted by a user
 * @param {string} token        authentication token of user
 * @param {ObjectId} tripId     ID for chosen trip
 * @param {ObjectId} originId   ID for origin stop of the given trip
 * @param {ObjectId} destId     ID for destination stop of the given trip
 * @param {number}numTickets    number of tickets to book
 * @param {number} numLuggage   amount of luggage space to book
 * @returns object containing ID of the inserted booking
 */
export async function createBooking(token: string, tripId: ObjectId, originId: ObjectId, destId: ObjectId, numTickets: number, numLuggage: number) {
    await connectToDatabase();

    // user authentication
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    // error checks
    const trip = await getTripById(tripId);
    await getStopById(originId);
    await getStopById(destId)
    const vehicle = await getVehicleById(trip.vehicleId)

    const curCapacity = await calcCurrentCapacity(trip)
    const curLuggageCapacity = await calcCurrentLuggageCapacity(trip)

    if (curCapacity + numTickets > vehicle.maxCapacity) {
        throw HTTPError(400, 'booking exceeds passenger capacity');
    }
    
    if (curLuggageCapacity + numLuggage > vehicle.maxLuggageCapacity) {
        throw HTTPError(400, 'booking exceeds luggage capacity');
    }

    // updating database
    const dbRes = await collections.bookings?.insertOne({
        _id: new ObjectId(),
        userId: user._id,
        tripId,
        originId,
        destId,
        numTickets,
        numLuggage,
        bookingTime: new Date(),
    });
    await collections.trips?.updateOne(
        { _id: tripId },
        { $push: { bookings: dbRes?.insertedId } } as any
    )
    await collections.users?.updateOne(
        { _id: user._id },
        { $push: { bookings: dbRes?.insertedId } } as any
    )

    return { insertedId: dbRes?.insertedId }
}

/**
 * Creates ephemeral key and payment intent for the user, to initialise their Stripe component
 * @param {string} token        authentication token of user
 * @param {number} price        price of the booking
 * @returns object containing payment intent, ephemeral key, customer ID, and publishable key
 */
export async function createPaymentDetails(token: string, price: number) {
    await connectToDatabase();

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const customerId = user.customerId;
    const customer = await stripe.customers.retrieve(customerId);
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: '2025-03-31.basil' }
    );

    const paymentIntent = await stripe.paymentIntents.create({
        amount: price,
        currency: 'myr',
        customer: customerId,
    });

    return { 
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    }
}

/**
 * Creates a customer key for the user, to initialise their Stripe component
 * @param {string} token        authentication token of user
 * @returns object containing customer ID and ephemeral key
 */
export async function createCustomerKey(token: string) {
    await connectToDatabase();

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const customer = await stripe.customers.retrieve(user.customerId);
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: user.customerId },
        { apiVersion: '2025-03-31.basil' }
    );

    return {
        customer: customer.id,
        ephemeralKey: ephemeralKey.secret,
    }
}

/**
 * Creates a setup intent for the user, to initialise their Stripe component
 * @param {string} token        authentication token of user
 * @returns object containing setup intent
 */
export async function createSetupIntent(token: string) {
    await connectToDatabase();

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const customer = await stripe.customers.retrieve(user.customerId);
    const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
    });
    return {
        setupIntent: setupIntent.client_secret,
    }
}


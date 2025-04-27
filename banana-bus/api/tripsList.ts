import HTTPError from "http-errors";
import { ObjectId } from "mongodb";
import { collections, connectToDatabase } from "./mongoUtil";
import { findUserByToken, getRouteById, getStopById, getTripById, getVehicleById } from "./helper";
import { differenceInCalendarDays } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import { Booking, Trip, TripBox, TripInfo, TripList, User, Vehicle } from "./interface";

const timezone = "Australia/Sydney"

/**
 * Get a list of available trips for a given day
 * @param token User token for verification
 * @param routeId id for chosen route
 * @param departId  id for chosen departure location
 * @param arriveId id for chosen arrival location
 * @param date the date of departure
 * @returns an object containing departure and arrival name with a list of trips for the given day
 */
export async function tripsList(token: string, routeId: ObjectId, departId: ObjectId, arriveId: ObjectId, date: string): Promise<TripList> {
    // connection to database
    await connectToDatabase();
    if (!collections.trips || !collections.routes || !collections.stops) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    // authentication of user
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) throw HTTPError(403, 'invalid token'); 
    
    // get departure and arrival location names
    const route = await getRouteById(routeId);
    
    const departStop = await getStopById(departId);
    const departIndex = route.stops.findIndex(id => id.equals(departId));
    
    const arriveStop = await getStopById(arriveId);
    const arriveIndex = route.stops.findIndex(id => id.equals(arriveId));
    
    const arriveName = arriveStop.name;
    const departName = departStop.name;
    
    // define start and end of date based on timezone
    const dateStart = toZonedTime(date, timezone);
    dateStart.setHours(0,0,0,0);
    const dateEnd = toZonedTime(date, timezone);
    dateEnd.setHours(23,59,59,999);
    
    let trips: Trip[] = []
    // filters trips to the date
    trips = await collections.trips?.find<Trip>({
        routeId: routeId,
        "stopTimes.0": {"$gte": fromZonedTime(dateStart, timezone), "$lte": fromZonedTime(dateEnd, timezone)}
    }).toArray();
    
    // convert dataStore info to tripBox(info needed by frontend)
    const tripBoxes: TripBox[] = await Promise.all(
        trips.map(async (t) => {
            const vehicle = await getVehicleById(t.vehicleId);
            
            const departTime = new Date(t.stopTimes[departIndex]);
            const arriveTime = new Date(t.stopTimes[arriveIndex]);
            const curCapacity = await calcCurrentCapacity(t);

            return {
                tripId: t._id,
                departId: departId,
                arriveId: arriveId,
                departureTime: departTime,
                arrivalTime: arriveTime,
                price: Number(getPrice(vehicle.maxCapacity, curCapacity, departTime)), 
                curCapacity: curCapacity,
                maxCapacity: vehicle.maxCapacity,
                curLuggageCapacity: await calcCurrentLuggageCapacity(t),
                maxLuggageCapacity: vehicle.maxLuggageCapacity,
                luggagePrice: 20,
                hasAssist: vehicle.hasAssist,
            };
        })
    );

    // sorts trips by departure time
    tripBoxes.sort((a, b) => a.departureTime.getTime() - b.departureTime.getTime());
    
    return {
        departName,
        arriveName,
        trips: tripBoxes,
    }
}



/**
 * Used to generate trips for a given day if no fixed trips are on day
 * @param routeId id for the trips to be generated
 * @param dateString date for the generated trip
 * @returns generated trips
 */
export async function generateTrips(token: string, routeId: ObjectId, date: string) {
    // connection to database
    await connectToDatabase();
    if (!collections.trips || !collections.routes) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    // authentication of user
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) throw HTTPError(403, 'invalid token'); 
    
    // define start and end of date based on timezone
    const dateStart = toZonedTime(date, timezone);
    dateStart.setHours(0,0,0,0);
    const dateEnd = toZonedTime(date, timezone);
    dateEnd.setHours(23,59,59,999);
    
    let trips: Trip[] = []
    // filters trips to the date
    trips = await collections.trips?.find<Trip>({
        routeId: routeId,
        "stopTimes.0": {"$gte": fromZonedTime(dateStart, timezone), "$lte": fromZonedTime(dateEnd, timezone)}
    }).toArray();

    const today = toZonedTime(new Date(), timezone);
    const dayDiff = differenceInCalendarDays(dateStart, today);

    // check if trips exist else generate some trips
    if (trips.length !== 0 || dayDiff > 7) {
        return { trips: [] }
    } 
    
    const route = await getRouteById(routeId);
    
    // generate a trip every hr from 8am - 5pm
    for (let hr = 8; hr <= 17; hr++) {
        // define the departure time
        const departDate = toZonedTime(date, timezone);
        departDate.setHours(hr, 0, 0 , 0);

        // TODO replace with actual stopTimes
        const stopTimes = route.stops.map((_, i) => {
            const stopTime = new Date(departDate.getTime() + i * 30 * 60 * 1000);
            return fromZonedTime(stopTime, timezone);
        })
        
        // assignment of vehicles and drivers
        const start = stopTimes[0];
        const end = stopTimes[stopTimes.length - 1];

        const vehicle = await findAvailableVehicle(start, end);
        const driver = await findAvailableDriver(start, end);
        
        // if no vehicle or driver assigned
        if (!vehicle || !driver) {
            // TODO alert manager somehow
            console.log(`no vehicle available for ${hr}`);
            continue;
        }
        
        // create trip
        const trip = {
            _id: new ObjectId(),
            vehicleId: vehicle._id,
            driverId: driver._id,
            routeId: routeId,
            stopTimes: stopTimes,					
            bookings: [],
        }

        await collections.trips.insertOne(trip);
        trips.push(trip);
    }

    // TODO: alert manager
    // checks if no trips are generates i.e no available vehicles
    /* if (trips.length === 0) {
    } */

    // add tripId to route collection
    const tripIds = trips.map(t => t._id);
    await collections.routes.updateOne(
        {_id: routeId},
        { $push: { trips: {$each: tripIds}}}
    )

    return trips;
}

/**
 * Finds any available vehicle given a start and end time
 * @param start start of interval
 * @param end end of interval
 * @returns vehicle or null
 */
async function findAvailableVehicle(start: Date, end: Date): Promise<Vehicle | null> {
    await connectToDatabase();

    if (!collections.trips || !collections.vehicles) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    // buffer time for vehicle (mins)
    const bufferTime = 60;
    
    const bufferedStart = new Date(start.getTime() - bufferTime * 60 * 1000);
    const bufferedEnd = new Date(end.getTime() + bufferTime * 60 * 1000);

    // find trips that overlap within the buffered times
    const overlappingTrips = await collections.trips.find<Trip>({
        $or: [
          { "stopTimes.0": { $lt: bufferedEnd }, "stopTimes": { $elemMatch: { $gt: bufferedStart } } }
        ]
      }).toArray();

    // extract vehicle ids from trips
    const unavailableVehiclesIds = overlappingTrips.map(t => t.vehicleId);

    // get any vehicle not in array
    const availableVehicle = await collections.vehicles.findOne<Vehicle>({
        _id: {$nin: unavailableVehiclesIds }
    })

    return availableVehicle
}

/**
 * Finds any available driver given a start and end time
 * @param start start of interval
 * @param end end of interval
 * @returns driver or null
 */
async function findAvailableDriver(start: Date, end: Date): Promise<User | null> {
    await connectToDatabase();

    if (!collections.trips || !collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    // buffer time for driver (mins)
    const bufferTime = 60;
    
    const bufferedStart = new Date(start.getTime() - bufferTime * 60 * 1000);
    const bufferedEnd = new Date(end.getTime() + bufferTime * 60 * 1000);

    // find trips that overlap within the buffered times
    const overlappingTrips = await collections.trips.find<Trip>({
        $or: [
          { "stopTimes.0": { $lt: bufferedEnd }, "stopTimes": { $elemMatch: { $gt: bufferedStart } } }
        ]
      }).toArray();

    // extract driver ids from trips
    const unavailableDriverIds = overlappingTrips.map(t => t.driverId);

    // get any driver not in array
    const availableDriver = await collections.users.findOne<User>({
        isDriver: true,
        _id: {$nin: unavailableDriverIds }
    })

    return availableDriver
}

/**
 * Calculates price for trip based on capacity and time of departure
 * @param maxCapacity max passenger capacity
 * @param curCapacity current passenger capacity
 * @param timeOfDeparture time of departure of trip
 * @returns price
 */
export function getPrice(maxCapacity: number, curCapacity: number, timeOfDeparture: Date): number {
    const now = new Date();
    const basePrice = 8;

    if ( now > timeOfDeparture ) {
        return 14;
    }

    // // Logistic price - increases with % of capacity used
    const f = curCapacity / maxCapacity;
    const pMin = 8;
    const pMaxSpot = 15;
    const k = 10;
    const pSpot = pMin + (pMaxSpot - pMin) /(1 + Math.exp(-k * (f - 0.5)));
    
    // linear price - increases with time to departure
    const t = Math.max(0, (timeOfDeparture.getTime() - now.getTime()) / 36e5);
    const alpha = 0.75;
    const pTime = alpha*Math.max(0, 24 - t);

    // Time of day pricing - increases smoothly with peak hours
    const peakPrice = 3;
    const peakHours = [9, 12, 5];
    const sigma = 1.5;
    const curTimeHour = now.getHours() + now.getMinutes() / 60;
    const pSurge = peakHours.reduce((sum, mu) => { const delta = curTimeHour - mu; 
                    return sum + peakPrice * Math.exp(- (delta * delta) / (2 * sigma * sigma)); }, 0);
    
    // Round tp nearest 5 cents
    const sum =  basePrice + pTime + pSurge;        
    const rounded = Math.round(sum);
    return Math.min(rounded, 22);
}

/**
 * Gets information about a single trip
 * @param token user token for authentication
 * @param departId id for chosen departure location
 * @param arriveId id for chosen arrival location
 * @param tripId id for trip
 * @returns an object containing departure and arrival and trip info
 */
export async function getTrip(token: string, departId: ObjectId, arriveId: ObjectId, tripId: ObjectId): Promise<TripInfo> {
    await connectToDatabase();
    
    // 
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const trip = await getTripById(tripId);
    const route = await getRouteById(trip.routeId);
    const vehicle = await getVehicleById(trip.vehicleId);

    const departStop = await getStopById(departId)
    const departIndex = route.stops.findIndex(id => id.equals(departId));
    
    const arriveStop = await getStopById(arriveId)
    const arriveIndex = route.stops.findIndex(id => id.equals(arriveId));
    
    const arriveName = arriveStop.name;
    const departName = departStop.name;

    const curCapacity = await calcCurrentCapacity(trip);

    const tripBox = {
        tripId: tripId,
        departId: departId,
        arriveId: arriveId,
        departureTime: trip.stopTimes[departIndex],
        arrivalTime: trip.stopTimes[arriveIndex],
        price: Number(getPrice(vehicle.maxCapacity, curCapacity, trip.stopTimes[departIndex])),
        curCapacity: curCapacity, 
        maxCapacity: vehicle.maxCapacity,
        curLuggageCapacity: await calcCurrentLuggageCapacity(trip),
        maxLuggageCapacity: vehicle.maxLuggageCapacity,
        luggagePrice: 10,
        hasAssist: vehicle.hasAssist,
    }

    return ({
      departName,
      arriveName,
      trip: tripBox,
    })
}

/**
 * Calculates the current number of current passengers
 * @param trip the trip to be calculated
 * @returns number of current passengers
 */
async function calcCurrentCapacity(trip: Trip): Promise<number> {
  const bookings = await collections.bookings?.find<Booking>({ _id: { $in: trip.bookings } }).toArray();
  if (!bookings) throw HTTPError(400, "Cant get bookings");

  return bookings.reduce((sum, b) => sum + b.numTickets, 0)
}

/**
 * Calculates the current number of current luggages
 * @param trip the trip to be calculated
 * @returns number of luggages
 */
async function calcCurrentLuggageCapacity(trip: Trip): Promise<number> {
  const bookings = await collections.bookings?.find<Booking>({ _id: { $in: trip.bookings } }).toArray();
  if (!bookings) throw HTTPError(400, "Cant get bookings");

  return bookings.reduce((sum, b) => sum + b.numLuggage, 0)
}


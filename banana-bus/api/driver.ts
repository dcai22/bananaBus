import HTTPError from "http-errors";
import { findUserByToken, getRouteById, getStopById, getTripById, getVehicleById } from "./helper";
import { Booking, Route, RouteSection, Trip, User } from "./interface";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";

export async function driverGetUpcomingTrips(token: string) {
    await connectToDatabase();

    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isDriver) {
        throw HTTPError(403, "user is not a driver");
    }

    const now = new Date();
    const allTrips = await collections.trips?.find<Trip>({
        driverId: user._id,
    }).toArray();
    const upcomingTrips = allTrips?.filter(t => t.stopTimes[0] > now);
    if (!upcomingTrips) {
        return { upcomingTrips: [] };
    }

    const formattedUpcomingTrips = await Promise.all(
        upcomingTrips.map(async (t) => {
            const route = await getRouteById(t.routeId);
            const origin = await getStopById(route.stops[0]);
            const dest = await getStopById(route.stops[route.stops.length - 1]);
            return {
                _id: t._id.toString(),
                stopTimes: t.stopTimes,
                originName: origin.name,
                destName: dest.name,
            };
        })
    );

    return { upcomingTrips: formattedUpcomingTrips };
}

export async function driverGetTrip(token: string, tripId: ObjectId) {
    await connectToDatabase();
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isDriver) {
        throw HTTPError(403, "user is not a driver");
    }

    const allBookings = await collections.bookings?.find<Booking>({
        tripId: tripId,
    }).toArray() ?? [];

    const trip = await getTripById(tripId);
    const route = await getRouteById(trip.routeId);
    const vehicle = await getVehicleById(trip.vehicleId);

    if (!trip.driverId.equals(user._id)) {
        throw HTTPError(403, "user is not driver of this trip");
    }

    const stops = await Promise.all(
        route.stops.map(async (s, i) => {
            const stop = await getStopById(s);
            return {
                _id: s,
                name: stop.name,
                stopTime: trip.stopTimes[i],
            };
        })
    );

    const passengers = await Promise.all(
        allBookings.map(async (booking) => {
            const user = await collections.users?.findOne<User>({
                _id: booking.userId
            });

            if (!user) {
                throw HTTPError(400, 'User not found');
            }

            return {
                firstName: user.firstName,
                lastName: user.lastName,
                numTickets: booking.numTickets,
            };
        })
    );

    return { vehicle: Object.assign(vehicle, { _id: vehicle._id.toString() }), stops, passengers };
}

export async function driverReportVehicle(token: string, vehicleId: ObjectId, reportText: string) {
    await connectToDatabase();
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isDriver) {
        throw HTTPError(403, "user is not a driver");
    }

    const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) {
        throw HTTPError(400, "vehicle not found");
    }

    const date = new Date();

    await collections.vehicles?.updateOne(
        { _id: vehicleId },
        { $push: { reports: { date, text: reportText } } }
    );

    return { date };
}
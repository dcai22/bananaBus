import bcrypt from "bcryptjs";
import HTTPError from "http-errors";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";
import { Booking, Route, Session, Stop, Trip, User, UserPayload, Vehicle } from "./interface";
import dotenv from "dotenv";
var jwt = require('jsonwebtoken');
dotenv.config();

// Hashes and salts the password
export async function getHash(text: string) {
    return await bcrypt.hash(text, 10);
}

// Compares a string to a hashed string
export async function compareHash(text: string, hash: string) {
    return await bcrypt.compare(text, hash);
}

// Finds the user object by their token
export async function findUserByToken(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const sessionId = (decoded as UserPayload).sessionId;
        const userId = (decoded as UserPayload).userId;
        const user = await collections.users?.findOne({ _id: new ObjectId(userId) });
        const userSession = user?.sessions.find((session: Session) => session.sessionId === sessionId);
        if (!userSession) {
            return;
        }
        if (userSession.expiry < new Date()) {
            return;
        }
        return user;
    } catch {
        return;
    }
}

// Gets the trip object by its ID
export async function getTripById(tripId: ObjectId) {
    const trip = await collections.trips?.findOne<Trip>({ _id: tripId });
    if (!trip) {
        throw HTTPError(400, 'trip not found');
    }
    return trip;
}

// Gets the booking object by its ID
export async function getRouteById(routeId: ObjectId) {
    const route = await collections.routes?.findOne<Route>({ _id: routeId });
    if (!route) {
        throw HTTPError(400, 'route not found');
    }
    return route;
}

// Gets the stop object by its ID
export async function getStopById(stopId: ObjectId) {
    const stop = await collections.stops?.findOne<Stop>({ _id: stopId });
    if (!stop) {
        throw HTTPError(400, 'stop not found');
    }
    return stop;
}

// Gets the vehicle object by its ID
export async function getVehicleById(vehicleId: ObjectId) {
    const vehicle = await collections.vehicles?.findOne<Vehicle>({ _id: vehicleId});
    if (!vehicle) {
        throw HTTPError(400, 'vehicle not found');
    }
    return vehicle;
}

// Finds the user by reset token
export async function findUserByResetToken(token: string) {
    const users = await collections.users?.find({ resetToken: { $ne: [] as any} }).toArray();
    if (!users) {
        return;
    }
    for (const user of users) {
        if (await compareHash(token, user.resetToken.token)) {
            return user;
        }
    }
    return;
}

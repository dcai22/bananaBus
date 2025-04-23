import bcrypt from "bcryptjs";
import HTTPError from "http-errors";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";
import { Route, Session, Stop, Trip, UserPayload, Vehicle } from "./interface";
import dotenv from "dotenv";
var jwt = require('jsonwebtoken');
dotenv.config();

export async function getHash(text: string) {
    return await bcrypt.hash(text, 10);
}

export async function compareHash(text: string, hash: string) {
    return await bcrypt.compare(text, hash);
}

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

export async function getTripById(tripId: ObjectId) {
    const trip = await collections.trips?.findOne<Trip>({ _id: tripId });
    if (!trip) {
        throw HTTPError(400, 'trip not found');
    }
    return trip;
}

export async function getRouteById(routeId: ObjectId) {
    const route = await collections.routes?.findOne<Route>({ _id: routeId });
    if (!route) {
        throw HTTPError(400, 'route not found');
    }
    return route;
}

export async function getStopById(stopId: ObjectId) {
    const stop = await collections.stops?.findOne<Stop>({ _id: stopId });
    if (!stop) {
        throw HTTPError(400, 'stop not found');
    }
    return stop;
}

export async function getVehicleById(vehicleId: ObjectId) {
    const vehicle = await collections.vehicles?.findOne<Vehicle>({ _id: vehicleId});
    if (!vehicle) {
        throw HTTPError(400, 'vehicle not found');
    }
    return vehicle;
}

export async function findUserByResetToken(token: string) {
    const users = await collections.users?.find({ resetToken: { $ne: [] } }).toArray();
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
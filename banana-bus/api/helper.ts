import bcrypt from "bcryptjs";
import HTTPError from "http-errors";
import { collections } from "./mongoUtil";
import { ObjectId } from "mongodb";
import { Route, Stop, Trip } from "./interface";

export function getHash(text: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(text, salt);
}

export function compareHash(text: string, hash: string) {
    return bcrypt.compareSync(text, hash);
}

export async function isValidToken(token: string) {
    const users = await collections.users?.find({ tokens: { $ne: [] } }).toArray();

    if (!users) {
        throw HTTPError(400, 'user not found');
    }

    for (const user of users) {
        for (const userToken of user.tokens) {
            if (compareHash(token, userToken)) {
                return true;
            }
        }
    }
    return false;
}

export async function findUserByToken(token: string) {
    const users = await collections.users?.find({ tokens: { $ne: [] } }).toArray();

    if (!users) {
        throw HTTPError(400, 'user not found');
    }
    for (const user of users) {
        for (const userToken of user.tokens) {
            if (compareHash(token, userToken)) {
                return user;
            }
        }
    }
    return;
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

export async function findUserByResetToken(token: string) {
    const users = await collections.users?.find({ resetToken: { $ne: [] } }).toArray();
    if (!users) {
        return;
    }
    for (const user of users) {
        if (compareHash(token, user.resetToken.token)) {
            return user;
        }
    }
    return;
}
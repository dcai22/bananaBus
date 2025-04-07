import bcrypt from "bcryptjs";
import HTTPError from "http-errors";
import { getData } from "./dataStore";
import { routeToScreen } from "expo-router/build/useScreens";

export function getHash(text: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(text, salt);
}

export function compareHash(text: string, hash: string) {
    return bcrypt.compareSync(text, hash);
}

export function isValidToken(token: string) {
    const data = getData();
    for (const user of data.users) {
        for (const userToken of user.tokens) {
            if (compareHash(token, userToken)) {
                return true;
            }
        }
    }
    return false;
}

export function findUserByToken(token: string) {
    const data = getData();
    for (const user of data.users) {
        for (const userToken of user.tokens) {
            if (compareHash(token, userToken)) {
                return user;
            }
        }
    }
    return;
}

export function getTripById(tripId: number) {
    const data = getData();
    for (const trip of data.trips) {
        if (trip.tripId === tripId) {
            return trip;
        }
    }
    throw HTTPError(400, 'trip not found');
}

export function getRouteById(routeId: number) {
    const data = getData();
    for (const route of data.routes) {
        if (route.routeId === routeId) {
            return route;
        }
    }
    throw HTTPError(400, 'route not found');
}

export function getStopById(stopId: number) {
    const data = getData();
    for (const stop of data.stops) {
        if (stop.stopId === stopId) {
            return stop;
        }
    }
    throw HTTPError(400, 'stop not found');
}

export function findUserByResetToken(token: string) {
    const data = getData();
    for (const user of data.users) {
        if (compareHash(token, user.resetToken.token)) {
            return user;
        }
    }
    return;
}
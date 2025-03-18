import HTTPError from "http-errors";
import { getData } from "./dataStore";
import { getRouteById } from "./helper";

export function saveRoute(userId: number, routeId: number) {
    const data = getData();

    if (!data.routes.some((route) => { route.routeId === routeId })) {
        throw HTTPError(400, 'route does not exist');
    }

    for (const user of data.users) {
        if (user.userId !== userId) {
            continue;
        }

        if (user.savedRoutes.some((savedRouteId) => { savedRouteId === routeId })) {
            throw HTTPError(400, 'route is already saved')
        }

        // User.savedRoutes array is sorted
        user.savedRoutes.push(routeId);
        user.savedRoutes.sort((a, b) => {
            return a - b;
        });
    }

    // userId does not exist
    throw HTTPError(400, 'user not found');
}

export function unsaveRoute(userId: number, routeId: number) {
    const data = getData();

    if (!data.routes.some((route) => { route.routeId === routeId })) {
        throw HTTPError(400, 'route does not exist');
    }

    for (const user of data.users) {
        if (user.userId !== userId) {
            continue;
        }

        if (!user.savedRoutes.some((savedRouteId) => { savedRouteId === routeId })) {
            throw HTTPError(400, 'route was not saved')
        }

        user.savedRoutes = user.savedRoutes.filter((savedRouteId) => {
            savedRouteId !== routeId;
        });
    }

    // userId does not exist
    throw HTTPError(400, 'user not found');
}

export function getSavedRoutes(userId: number) {
    const data = getData();

    for (const user of data.users) {
        if (user.userId !== userId) {
            continue;
        }

        return { savedRoutes: user.savedRoutes.map((savedRouteId) => { return getRouteById(savedRouteId); }) };
    }

    // userId does not exist
    throw HTTPError(400, 'user not found');
}

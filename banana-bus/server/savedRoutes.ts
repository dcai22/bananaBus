import HTTPError from "http-errors";
import { getData, setData } from "./dataStore";
import { getRouteById, getStopById } from "./helper";
import { RouteSection } from "./interface";

export function saveRoute(userId: number, routeId: number, originId: number, destId: number) {
    const data = getData();

    if (!data.routes.some((route) => { return route.routeId === routeId; })) {
        throw HTTPError(400, 'route does not exist');
    }

    for (const user of data.users) {
        if (user.userId !== userId) {
            continue;
        }

        const routeSection = new RouteSection(routeId, originId, destId);
        if (!routeSection.isValid()) {
            throw HTTPError(400, 'route section is invalid');
        }
        if (user.savedRoutes.some((savedRoute) => { return savedRoute === routeSection; })) {
            throw HTTPError(400, 'route is already saved');
        }

        // User.savedRoutes array is sorted in increasing order by routeId, then originId, then destId
        user.savedRoutes.push(routeSection);
        user.savedRoutes.sort((a, b) => {
            if (a.routeId != b.routeId) {
                return a.routeId - b.routeId;
            }
            if (a.originId != b.originId) {
                return a.originId - b.originId;
            }
            return a.destId - b.destId;
        });
        setData(data);

        return {};
    }

    // userId does not exist
    throw HTTPError(400, 'user not found');
}

export function unsaveRoute(userId: number, routeSection: RouteSection) {
    const data = getData();

    if (!data.routes.some((route) => { return route.routeId === routeSection.routeId; })) {
        throw HTTPError(400, 'route does not exist');
    }

    for (const user of data.users) {
        if (user.userId !== userId) {
            continue;
        }

        if (!user.savedRoutes.some((savedRoute) => { return savedRoute.equals(routeSection); })) {
            throw HTTPError(400, 'route was not saved')
        }

        user.savedRoutes = user.savedRoutes.filter((savedRoute) => { return !savedRoute.equals(routeSection); });
        setData(data);

        return {};
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

        return { savedRoutes: user.savedRoutes.map((savedRoute) => { return savedRoute.asDisplayRouteSection() }) };
    }

    // userId does not exist
    throw HTTPError(400, 'user not found');
}

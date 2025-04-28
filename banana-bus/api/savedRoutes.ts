import HTTPError from "http-errors";
import { findUserByToken, getRouteById, getStopById } from "./helper";
import { Route, RouteSection } from "./interface";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";

/**
 * Saves a route, including the start and end points, to the user's saved routes
 * @param {string} token        authentication token of user
 * @param {ObjectId} routeId    id of route to be added
 * @param {ObjectId} originId   id of the origin stop
 * @param {ObjectId} destId     id of the destination stop
 * @returns empty object
 */
export async function saveRoute(token: string, routeId: ObjectId, originId: ObjectId, destId: ObjectId) {
    await connectToDatabase();
    
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const route = await collections.routes?.findOne<Route>({ _id: routeId });
    if (!route) {
        throw HTTPError(400, 'route not found');
    }

    const routeSection = new RouteSection(routeId, originId, destId);
    if (!routeSection.isValid()) {
        throw HTTPError(400, 'route section is invalid');
    }

    if (user.savedRoutes.some((savedRoute: RouteSection) => {
        return savedRoute.routeId.equals(routeSection.routeId) && savedRoute.originId.equals(routeSection.originId) && savedRoute.destId.equals(routeSection.destId);
    })) {
        throw HTTPError(400, 'route is already saved');
    }


    console.log(routeSection);

    await collections.users?.updateOne({ _id: user._id }, { $push : { savedRoutes: routeSection } });

    return {};
}

/**
 * Removes a route, including the start and end points, from the user's saved routes
 * @param {string} token        authentication token of user
 * @param {ObjectId} routeId    id of route to be removed
 * @param {ObjectId} originId   id of the origin stop
 * @param {ObjectId} destId     id of the destination stop
 * @returns empty object
 */
export async function unsaveRoute(token: string, routeId: ObjectId, originId: ObjectId, destId: ObjectId) {
    await connectToDatabase();
    
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const route = await collections.routes?.findOne<Route>({ _id: routeId });
    if (!route) {
        throw HTTPError(400, 'route not found');
    }

    const routeSection = new RouteSection(routeId, originId, destId);
    if (!routeSection.isValid()) {
        throw HTTPError(400, 'route section is invalid');
    }

    if (!user.savedRoutes.some((savedRoute: RouteSection) => {
        return savedRoute.routeId.equals(routeSection.routeId) && savedRoute.originId.equals(routeSection.originId) && savedRoute.destId.equals(routeSection.destId);
    })) {
        throw HTTPError(400, 'route was not saved')
    }
    
    console.log(routeSection);

    await collections.users?.updateOne({ _id: user._id }, { $pull : { savedRoutes: { routeId: routeSection.routeId, originId: routeSection.originId, destId: routeSection.destId } } });

    return {};
}

/**
 * Gets all routes, including start and end points, saved by a user
 * @param {string} token    authentication token of user
 * @returns object containing an array of saved routes, including the start and end points
 */
export async function getSavedRoutes(token: string) {
    await connectToDatabase();
    const strippedToken = token.replace('Bearer ', '');

    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    
    return { savedRoutes: await Promise.all(
        user.savedRoutes.map(async (savedRoute: RouteSection) => {
            const route = await getRouteById(savedRoute.routeId);
            const origin = await getStopById(savedRoute.originId);
            const dest = await getStopById(savedRoute.destId);

            return {
                route: route,
                originIndex: route.stops.findIndex(s => s.equals(savedRoute.originId)),
                originName: origin.name,
                destIndex: route.stops.findIndex(s => s.equals(savedRoute.destId)),
                destName: dest.name,
            };
        })
    )};
}

/**
 * Searches all destination stops reachable (in a single route) from an origin stop
 * @param {string} token    authentication token of the user
 * @param {ObjectId} fromId id of the origin stop
 * @returns object containing an array of destination stop IDs
 */
export async function reachableStops(token: string, fromId: ObjectId) {
    await connectToDatabase();
    const strippedToken = token.replace('Bearer ', '');

    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const routes = await collections.routes
        ?.find<Route>({
            stops: { $elemMatch: { $eq: fromId } },
        })
        .toArray();

    if (typeof routes === "undefined") {
        throw HTTPError(400, "unable to search routes");
    }

    const stops = new Set<ObjectId>();
    for (const route of routes) {
        const fromIndex = route.stops.findIndex(s => s.equals(fromId));
        route.stops.forEach((e, i, a) => {
            if (i > fromIndex) {
                stops.add(e);
            }
        });
    }

    return { stops: Array.from(stops) };
}

/**
 * Gets routes containing a section going from a specified origin to a specified destination
 * @param {string} token        authentication token of user
 * @param {ObjectId} departId   ID of user-specified origin stop
 * @param {ObjectId} arriveId   ID of user-specified destination stop
 * @returns object containing a list of Route objects
 */
export async function getRoutes(token: string, departId: ObjectId, arriveId: ObjectId) {
    await connectToDatabase();
    const strippedToken = token.replace('Bearer ', '');

    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const allRoutes = await collections.routes?.find<Route>({
        $and: [
            { stops: { $elemMatch: { $eq: departId } } },
            { stops: { $elemMatch: { $eq: arriveId } } }
        ]
    }).toArray();

    if (typeof allRoutes === 'undefined') {
        throw HTTPError(400, 'unable to search routes');
    }

    const routes = allRoutes.filter((route) => {
        return route.stops.findIndex(s => s.equals(arriveId)) > route.stops.findIndex(s => s.equals(departId));
    })

    return { routes };
}

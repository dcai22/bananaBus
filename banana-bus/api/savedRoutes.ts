import HTTPError from "http-errors";
import { findUserByToken, getRouteById, getStopById } from "./helper";
import { Route, RouteSection } from "./interface";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";

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

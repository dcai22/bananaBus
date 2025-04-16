import HTTPError from "http-errors";
import { findUserByToken } from "./helper";
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

    const route = await collections.routes?.findOne<Route>({ routeId: routeId });
    if (!route) {
        throw HTTPError(400, 'route not found');
    }

    const routeSection = new RouteSection(routeId, originId, destId);
    if (!routeSection.isValid()) {
        throw HTTPError(400, 'route section is invalid');
    }

    if (user.savedRoutes.some((savedRoute: RouteSection) => { return savedRoute === routeSection; })) {
        throw HTTPError(400, 'route is already saved');
    }

    user.savedRoutes.push(routeSection);

    await collections.users?.replaceOne(
        { userId: user._id },
        user,
    );

    return {};
}

export async function unsaveRoute(token: string, routeSection: RouteSection) {
    await connectToDatabase();
    
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    if (!user.savedRoutes.some((savedRoute: RouteSection) => { return savedRoute.equals(routeSection); })) {
        throw HTTPError(400, 'route was not saved')
    }

    user.savedRoutes = user.savedRoutes.filter((savedRoute: RouteSection) => { return !savedRoute.equals(routeSection); });

    collections.users?.replaceOne(
        { userId: user._id },
        user,
    );

    return {};
}

export async function getSavedRoutes(token: string) {
    await connectToDatabase();
    const strippedToken = token.replace('Bearer ', '');

    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    
    return { savedRoutes: user.savedRoutes.map((savedRoute: RouteSection) => { return savedRoute.asDisplayRouteSection() }) };
}

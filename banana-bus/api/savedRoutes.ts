import HTTPError from "http-errors";
import { getRouteById, getStopById } from "./helper";
import { Route, RouteSection, User } from "./interface";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";

export async function saveRoute(userId: ObjectId, routeId: ObjectId, originId: ObjectId, destId: ObjectId) {
    await connectToDatabase();

    const route = await collections.routes?.findOne<Route>({ routeId: routeId });
    if (!route) {
        throw HTTPError(400, 'route not found');
    }

    let user = await collections.users?.findOne<User>({ userId: userId });
    if (!user) {
        throw HTTPError(400, 'user not found');
    }

    const routeSection = new RouteSection(routeId, originId, destId);
    if (!routeSection.isValid()) {
        throw HTTPError(400, 'route section is invalid');
    }

    if (user.savedRoutes.some((savedRoute) => { return savedRoute === routeSection; })) {
        throw HTTPError(400, 'route is already saved');
    }

    user.savedRoutes.push(routeSection);

    await collections.users?.replaceOne(
        { userId: userId },
        user,
    );

    return {};
}

export async function unsaveRoute(userId: ObjectId, routeSection: RouteSection) {
    let user = await collections.users?.findOne<User>({ userId: userId });
    if (!user) {
        throw HTTPError(400, 'user not found');
    }

    if (!user.savedRoutes.some((savedRoute) => { return savedRoute.equals(routeSection); })) {
        throw HTTPError(400, 'route was not saved')
    }

    user.savedRoutes = user.savedRoutes.filter((savedRoute) => { return !savedRoute.equals(routeSection); });

    collections.users?.replaceOne(
        { userId: userId },
        user,
    );

    return {};
}

export async function getSavedRoutes(userId: ObjectId) {
    const user = await collections.users?.findOne<User>({ userId: userId });
    if (!user) {
        throw HTTPError(400, 'user not found');
    }
    
    return { savedRoutes: user.savedRoutes.map((savedRoute) => { return savedRoute.asDisplayRouteSection() }) };
}

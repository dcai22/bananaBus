import HTTPError from "http-errors";
import { ObjectId } from "mongodb";
import { collections, connectToDatabase } from "./mongoUtil";
import { User } from "./interface";
import { findUserByToken } from "./helper";

export async function addManager(token: string) {
    await connectToDatabase();

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    if (user.isManager) {
        throw HTTPError(400, 'user is already a manager');
    }
    user.isManager = true;
    await collections.users?.updateOne({ userId: user._id }, user);
    return user;
}

export async function removeManager(token: string) {
    await connectToDatabase();

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    if (!user.isManager) {
        throw HTTPError(403, 'user is not a manager');
    }
    user.isManager = false;
    await collections.users?.updateOne({ userId: user._id }, user);
    return user;
}

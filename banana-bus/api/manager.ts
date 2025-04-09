import HTTPError from "http-errors";
import { ObjectId } from "mongodb";
import { collections, connectToDatabase } from "./mongoUtil";
import { User } from "./interface";

export async function addManager(userId: ObjectId) {
    await connectToDatabase();
    
    const user = await collections.users?.findOne<User>({ userId: userId });
    if (!user) {
        throw HTTPError(400, 'user not found');
    }
    if (user.isManager) {
        throw HTTPError(400, 'user is already a manager');
    }
    user.isManager = true;
    await collections.users?.updateOne({ userId: userId }, user);
    return user;
}

export async function removeManager(userId: ObjectId) {
    await connectToDatabase();

    const user = await collections.users?.findOne<User>({ userId: userId });
    if (!user) {
        throw HTTPError(400, 'user not found');
    }
    if (!user.isManager) {
        throw HTTPError(400, 'user is not a manager');
    }
    user.isManager = false;
    await collections.users?.updateOne({ userId: userId }, user);
    return user;
}

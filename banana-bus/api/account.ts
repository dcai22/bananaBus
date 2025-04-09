import HTTPError from "http-errors";
import { compareHash, findUserByToken, getHash } from "./helper";
import { collections } from "./mongoUtil";
import { ObjectId } from "mongodb";

export async function getAccountName(token: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    return { firstName: user?.firstName, lastName: user?.lastName };
}

export async function getUserDetails(token: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    return {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
    };
}

export async function updateUserDetails(token: string, firstName: string, lastName: string, email: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    await collections.users?.updateOne({ _id: user._id }, { $set: { firstName: firstName, lastName: lastName, email: email } } as any);

    return {
        firstName: firstName,
        lastName: lastName,
        email: email,
    }
}

export async function updateUserPassword(token: string, oldPassword: string, newPassword: string) {
    const strippedToken = token.replace('Bearer ', '');

    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    if (!compareHash(oldPassword, user.password)) {
        throw HTTPError(400, 'incorrect password');
    }
    const newHashedPassword = getHash(newPassword);
    await collections.users?.updateOne({ _id: user._id }, { $set: { password: newHashedPassword } } as any);
    return {};
}

export async function deleteAccount(userId: ObjectId, token: string) {
    const strippedToken = token.replace('Bearer ', '');
    const userById = await collections.users?.findOne({ _id: new ObjectId(userId) });
    if (!userById) {
        throw HTTPError(400, 'invalid userId ' + userId);
    }
    const userByToken = await findUserByToken(strippedToken);
    if (!userByToken) {
        throw HTTPError(403, 'invalid token');
    }
    
    if (!userById._id.equals(userByToken._id)) {
        throw HTTPError(403, 'invalid data');
    }

    await collections.users?.deleteOne({ _id: new ObjectId(userId) });
    return {};
}
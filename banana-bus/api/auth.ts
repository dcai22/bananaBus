import HTTPError from "http-errors";
import { AuthUserId, DataStore, Error, UserBuilder } from "./interface";
import { getData, setData } from "./dataStore";
import { getHash, compareHash } from "./helper";
import crypto from "crypto";

export function authRegister(email: string, password: string, firstName: string, lastName: string) {
    const data = getData();

    for (const index in data.users) {
        if (email === data.users[index].email) {
            throw HTTPError(400, 'email address already in use');
        }
    }

    const hashedPassword = getHash(password);
    
    let userId = 0;
    if (data.users.length !== 0) {
        userId = data.users[data.users.length - 1].userId + 1;
    }
    const token = crypto.randomBytes(64).toString('hex')
    const hashedToken = getHash(token);

    data.users.push(new UserBuilder()
        .withFirstName(firstName)
        .withLastName(lastName)
        .withEmail(email)
        .withPassword(hashedPassword)
        .withTokens([ hashedToken ])
        .withUserId(userId)
        .build()
    );


    setData(data);
    return {
        userId,
        token
    };
}

export function authLogin(email: string, password: string) {
    const data = getData();
    for (const index in data.users) {
        if (email === data.users[index].email) {
            if (!compareHash(password, data.users[index].password)) {
                throw HTTPError(400, 'incorrect password');
            } else {
                const token = crypto.randomBytes(64).toString('hex')
                const hashedToken = getHash(token);
                data.users[index].tokens.push(hashedToken);
                setData(data);
                return {
                    userId: data.users[index].userId,
                    token: token
                }
            }
        }
    }
    throw HTTPError(400, 'email not found');
}

export function authAutoLogin(token: string) {
    const data = getData();
    const strippedToken = token.replace('Bearer ', '');
    for (const user of data.users) {
        for (const userToken of user.tokens) {
            if (compareHash(strippedToken, userToken)) {
                return {
                    userId: user.userId,
                    token: strippedToken
                }
            }
        }
    }
    throw HTTPError(403, 'invalid token');
}

export function authLogout(userId: number, token: string) {
    const data = getData();
    for (const user of data.users) {
        if (user.userId === userId) {
            for (const index in user.tokens) {
                if (compareHash(token, user.tokens[index])) {
                    user.tokens.splice(parseInt(index), 1);
                    setData(data);
                    return {};
                }
            }
        }
    }
}

export function authDelete(userId: number, token: string) {
    const data = getData();
    for (const userIndex in data.users) {
        if (data.users[userIndex].userId === userId) {
            for (const index in data.users[userIndex].tokens) {
                if (compareHash(token, data.users[userIndex].tokens[index])) {
                    data.users.splice(parseInt(userIndex), 1);
                    setData(data);
                    return {};
                }
            }
        }
    }

    throw HTTPError(400, 'user not found');
}
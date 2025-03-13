import HTTPError from "http-errors";
import { authUserId, dataStore, error } from "./interface";
import { getData, setData } from "./dataStore";
import { getHash, compareHash } from "./helper";
import crypto from "crypto";

export function authRegister(email: string, password: string) {
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

    data.users.push({
        email,
        password: hashedPassword,
        tokens: [],
        userId,
    });

    setData(data);
    return;
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
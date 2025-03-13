import HTTPError from "http-errors";
import { authUserId, dataStore, error } from "./interface";
import { getData, setData } from "./dataStore";

export function authRegister() {
    return;
}

export function authLogin(email: string, password: string): authUserId | error {
    const data = getData();
    for (const index in data.users) {
        if (email === data.users[index].email) {
            if (password !== data.users[index].password) { // TODO: hash password
                throw HTTPError(400, 'incorrect password');
            } else {
                // TODO: create and hash token
                data.users[index].tokens.push('token');
                setData(data);
                return {
                    userId: data.users[index].userId,
                    token: 'token'
                }
            }
        }
    }
    throw HTTPError(400, 'email not found');
}
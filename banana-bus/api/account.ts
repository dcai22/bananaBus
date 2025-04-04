import HTTPError from "http-errors";
import { compareHash, findUserByToken } from "./helper";
import { getData, setData } from "./dataStore";

export function getAccountName(token: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    return { firstName: user?.firstName, lastName: user?.lastName };
}

export function getUserDetails(token: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    return {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
    };
}

export function updateUserDetails(token: string, firstName: string, lastName: string, email: string) {
    const strippedToken = token.replace('Bearer ', '');
    const data = getData();
    let userIndex = -1;
    for (const index in data.users) {
        for (const userToken of data.users[index].tokens) {
            if (compareHash(strippedToken, userToken)) {
                userIndex = parseInt(index);
                break;
            }
        }
    }
    if (userIndex === -1) {
        throw HTTPError(403, 'invalid token');
    }
    
    data.users[userIndex].firstName = firstName;
    data.users[userIndex].lastName = lastName;
    data.users[userIndex].email = email;
    setData(data);
    return {
        firstName: data.users[userIndex].firstName,
        lastName: data.users[userIndex].lastName,
        email: data.users[userIndex].email,
    };
}

export function updateUserPassword(token: string, oldPassword: string, newPassword: string) {
    const strippedToken = token.replace('Bearer ', '');
    const data = getData();
    let userIndex = -1;
    for (const index in data.users) {
        for (const userToken of data.users[index].tokens) {
            if (compareHash(strippedToken, userToken)) {
                userIndex = parseInt(index);
                break;
            }
        }
    }
    if (userIndex === -1) {
        throw HTTPError(403, 'invalid token');
    }

    if (!compareHash(oldPassword, data.users[userIndex].password)) {
        throw HTTPError(400, 'incorrect password');
    }
    
    data.users[userIndex].password = newPassword;
    setData(data);
    return {};
}
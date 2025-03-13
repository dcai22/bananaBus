import bcrypt from "bcryptjs";
import { getData } from "./dataStore";

export function getHash(text: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(text, salt);
}

export function compareHash(text: string, hash: string) {
    return bcrypt.compareSync(text, hash);
}

export function isValidToken(token: string) {
    const data = getData();
    for (const user of data.users) {
        for (const userToken of user.tokens) {
            if (compareHash(token, userToken)) {
                return true;
            }
        }
    }
    return false;
}
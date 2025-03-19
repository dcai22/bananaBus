import { findUserByToken } from "./helper";

export function getAccountName(token: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = findUserByToken(strippedToken);
    return user?.firstName;
}
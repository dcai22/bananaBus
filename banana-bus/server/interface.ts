export interface error {
    error: string
}

export interface user {
    firstName: string,
    surname: string,
    email: string,
    password: string,
    tokens: string[],
    userId: number
}

export interface dataStore {
    users: user[],
}
export interface authUserId {
    userId: number,
    token: string
}

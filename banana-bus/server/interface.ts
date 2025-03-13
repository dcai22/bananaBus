export interface error {
    error: string
}

export interface user {
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

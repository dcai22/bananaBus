export interface error {
    error: string
}

export interface user {
    email: string,
    password: string,
    tokens: string[],
    userId: number,
    trips: number[],
}

export interface dataStore {
    users: user[],
    trips: trip[],
}

export interface authUserId {
    userId: number,
    token: string,
}

export interface trip {
    tripId: number,
    vehicleId: number,
    price: number,
    departure_time: string,
    arrival_time: string,
}

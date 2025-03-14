export interface error {
    error: string
}

export interface user {
    email: string,
    password: string,
    tokens: string[],
    userId: number,
    bookings: number[],
}

export interface dataStore {
    users: user[],
    trips: trip[],
    bookings: booking[],
}

export interface authUserId {
    userId: number,
    token: string,
}

export interface trip {
    tripId: number,
    vehicleId: number,
    price: number,
    departure_time: string,             // ISO String
    arrival_time: string,               // ISO String
    origin: number,                     // stopId
    destination: number,                // stopId
}

export interface booking {
    bookingId: number,
    bookingTimes: [number, string][],   // array of [userId: number, time: ISO String]
    routeId: number,
}

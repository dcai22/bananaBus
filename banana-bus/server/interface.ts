export interface error {
    error: string
}

export interface user {
    firstName: string,
    surname: string,
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

export interface route {
    routeId: number,
    stops: number[],
    trips: number[],
}

export interface trip {
    tripId: number,
    vehicleId: number,
    routeId: number,
    bookings: number[],
    stopTimes: string[],					// array of ISO String
}

export interface booking {
    bookingId: number,
    userId: number,
    tripId: number,
    bookingTime: string,					// ISO String
    origin: number,
    dest: number,
}

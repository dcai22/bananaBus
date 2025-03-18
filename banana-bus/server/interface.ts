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
    routes: route[],
}

export interface authUserId {
    userId: number,
    token: string,
}

export interface route {
    routeId: number,
    stops: stop[],
    trips: number[],
}

export interface stop {
    stopId: number,
    name: string,
}

export interface trip {
    tripId: number,
    vehicleId: number,
    routeId: number,
    bookings: number[],
    stopTimes: string[],					// array of ISO String
}

export interface tripList {
    departName: string,
    arriveName: string,
    trips: tripBox[],
}

export interface tripBox {
    departureTime: Date,
    arrivalTime: Date,
    price: number,
    curCapacity: number, 
    maxCapacity: number,
}
export interface booking {
    bookingId: number,
    userId: number,
    tripId: number,
    bookingTime: string,					// ISO String
    origin: number,
    dest: number,
}

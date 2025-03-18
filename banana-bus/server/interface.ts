export interface error {
    error: string
}

interface User {
    email: string;
    password: string;
    tokens: string[];
    userId: number;
    bookings: number[];
}

class User implements User {
    constructor(user: User) {
        Object.assign(this, user);
    }
}

export class UserBuilder implements Partial<User> {
    email?: string;
    password?: string;
    tokens: string[] = [];
    userId?: number;
    bookings: number[] = [];

    withEmail(email: string) {
        return Object.assign(this, { email: email });
    }

    withPassword(password: string) {
        return Object.assign(this, { password: password });
    }

    withTokens(tokens: string[]) {
        return Object.assign(this, { tokens: tokens });
    }

    withUserId(userId: number) {
        return Object.assign(this, { userId: userId });
    }

    withBookings(bookings: number[]) {
        return Object.assign(this, { bookings:  bookings });
    }

    build(this: User) {
        return new User(this);
    }
}

export interface dataStore {
    users: User[],
    trips: Trip[],
    bookings: Booking[],
    routes: Route[],
}

export interface authUserId {
    userId: number,
    token: string,
}

export class Route {
    routeId: number;
    stops: number[];
    trips: number[];

    constructor(routeId: number, stops: number[], trips: number[] = []) {
        this.routeId = routeId;
        this.stops = stops;
        this.trips = trips;
    }
}

export class Trip {
    tripId: number;
    vehicleId: number;
    routeId: number;
    stopTimes: string[];					// array of ISO String
    bookings: number[];

    constructor(tripId: number, vehicleId: number, routeId: number, stopTimes: Date[], bookings: number[] = []) {
        this.tripId = tripId;
        this.vehicleId = vehicleId;
        this.routeId = routeId;
        this.stopTimes = stopTimes.map((date: Date) => date.toISOString());
        this.bookings = bookings;
    }
}

export class Booking {
    bookingId: number;
    userId: number;
    tripId: number;
    origin: number;
    dest: number;
    bookingTime: string;					// ISO String

    constructor(bookingId: number, userId: number, tripId: number, origin: number, dest: number, bookingTime: Date = new Date()) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.tripId = tripId;
        this.origin = origin;
        this.dest = dest;
        this.bookingTime = bookingTime.toISOString();
    }
}

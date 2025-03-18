export interface Error {
    error: string
}

interface User {
    firstName: string,
    lastName: string,
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
    firstName: string = 'anonymous';
    lastName: string = 'user';
    email?: string;
    password?: string;
    tokens: string[] = [];
    userId?: number;
    bookings: number[] = [];

    withFirstName(firstName: string) {
        return Object.assign(this, { firstName: firstName });
    }

    withLastName(lastName: string) {
        return Object.assign(this, { lastName: lastName });
    }

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

export interface DataStore {
    users: User[],
    trips: Trip[],
    bookings: Booking[],
    routes: Route[],
    stops: Stop[],
}

export interface Stop {
    stopId: number,
    name: string,
}
export interface AuthUserId {
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

export interface TripList {
    departName: string,
    arriveName: string,
    trips: TripBox[],
}

export interface TripBox {
    tripId: number
    departureTime: Date,
    arrivalTime: Date,
    price: number,
    curCapacity: number, 
    maxCapacity: number,
}


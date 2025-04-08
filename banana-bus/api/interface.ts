import { getData } from "./dataStore";
import { getRouteById, getStopById, getTripById } from "./helper";
import { ObjectId } from "mongodb";

export interface Error {
    error: string
}

interface User {
    _id: ObjectId;
    firstName: string,
    lastName: string,
    email: string;
    password: string;
    tokens: string[];
    resetToken: resetToken;
    bookings: number[];
    savedRoutes: RouteSection[];
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
    resetToken: resetToken = {
        token: '',
        code: '',
        expiry: new Date(),
    };
    _id?: ObjectId;
    bookings: number[] = [];
    savedRoutes: RouteSection[] = [];

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

    withUserId(_id: ObjectId) {
        return Object.assign(this, { _id: _id });
    }

    withBookings(bookings: number[]) {
        return Object.assign(this, { bookings:  bookings });
    }

    withSavedRoutes(savedRoutes: RouteSection[]) {
        return Object.assign(this, { savedRoutes: savedRoutes });
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

export interface resetToken {
    token: string,
    code: string,
    expiry: Date,
}

export class Stop {
    _id: ObjectId;
    name: string;
    lat: number;
    lng: number;

    constructor(_id: ObjectId, name: string, lat: number, lng: number) {
        this._id = _id;
        this.name = name;
        this.lat = lat;
        this.lng = lng;
    }
}

export interface AuthUserId {
    userId: ObjectId,
    token: string,
}

export class Route {
    _id: ObjectId;
    stops: ObjectId[];
    trips: ObjectId[];

    constructor(_id: ObjectId, stops: ObjectId[], trips: ObjectId[] = []) {
        this._id = _id;
        this.stops = stops;
        this.trips = trips;
    }
}

export class RouteSection {
    routeId: ObjectId;
    originId: ObjectId;
    destId: ObjectId;

    constructor(routeId: ObjectId, originId: ObjectId, destId: ObjectId) {
        this.routeId = routeId;
        this.originId = originId;
        this.destId = destId;
    }

    equals(other: RouteSection) {
        return this.routeId.equals(other.routeId) && this.originId.equals(other.originId) && this.destId.equals(other.destId);
    }

    async isValid() {
        const route = await getRouteById(this.routeId);
        const originIndex = route.stops.indexOf(this.originId);
        const destIndex = route.stops.indexOf(this.destId);
        if (0 <= originIndex && originIndex < destIndex) {
            return true;
        } else {
            return false;
        }
    }

    async asDisplayRouteSection() {
        const route = await getRouteById(this.routeId);
        const origin = await getStopById(this.originId);
        const dest = await getStopById(this.destId);

        return {
            route: route,
            originIndex: route.stops.indexOf(this.originId),
            originName: origin.name,
            destIndex: route.stops.indexOf(this.destId),
            destName: dest.name,
        };
    }
}

export class Trip {
    _id: ObjectId;
    vehicleId: ObjectId;
    routeId: ObjectId;
    stopTimes: string[];					// array of ISO String
    bookings: number[];

    constructor(_id: ObjectId, vehicleId: ObjectId, routeId: ObjectId, stopTimes: Date[], bookings: number[] = []) {
        this._id = _id;
        this.vehicleId = vehicleId;
        this.routeId = routeId;
        this.stopTimes = stopTimes.map((date: Date) => date.toISOString());
        this.bookings = bookings;
    }
}

export class Booking {
    _id: ObjectId;
    userId: ObjectId;
    tripId: ObjectId;
    originId: ObjectId;
    destId: ObjectId;
    bookingTime: string;					// ISO String

    constructor(_id: ObjectId, userId: ObjectId, tripId: ObjectId, originId: ObjectId, destId: ObjectId, bookingTime: Date = new Date()) {
        this._id = _id;
        this.userId = userId;
        this.tripId = tripId;
        this.originId = originId;
        this.destId = destId;
        this.bookingTime = bookingTime.toISOString();
    }

    async asDisplayBooking() {
        const trip = await getTripById(this.tripId);
        const route = await getRouteById(trip.routeId);

        const originName = await getStopById(this.originId).name;
        const destName = await getStopById(this.destId).name;
        const departureTime = trip.stopTimes[route.stops.indexOf(this.originId)];

        return {
            _id: this._id,
            userId: this.userId,
            tripId: this.tripId,
            originName: originName,
            destName: destName,
            departureTime: departureTime,
        };
    }
}

export interface TripList {
    departName: string,
    arriveName: string,
    trips: TripBox[],
}

export interface TripBox {
    tripId: ObjectId,
    departureTime: Date,
    arrivalTime: Date,
    price: number,
    curCapacity: number, 
    maxCapacity: number,
}
export interface Promotion {
    title: string,
    description: string,
    location: string,
    img: string,
    validFrom: string,
    validTo: string
}


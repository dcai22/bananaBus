import { getRouteById, getStopById } from "./helper";
import { ObjectId } from "mongodb";

export interface Error {
    error: string
}

export interface UserPayload {
    userId: string,
    sessionId: string,
}

export interface Session {
    sessionId: string,
    expiry: Date,   
}

export interface User {
    _id: ObjectId;
    firstName: string,
    lastName: string,
    email: string;
    password: string;
    sessions: Session[];
    resetToken: resetToken;
    bookings: ObjectId[];
    savedRoutes: RouteSection[];
    isManager: boolean;
    isDriver: boolean;
    isExternal: boolean;
    cards: Card[];
    customerId: string;
}

export class User implements User {
    constructor(user: User) {
        Object.assign(this, user);
    }
}

export class UserBuilder implements Partial<User> {
    firstName: string = 'anonymous';
    lastName: string = 'user';
    email?: string;
    password?: string;
    tokens: Token[] = [];
    resetToken: resetToken = {
        token: '',
        code: '',
        expiry: new Date(),
    };
    _id?: ObjectId;
    bookings: ObjectId[] = [];
    savedRoutes: RouteSection[] = [];
    isManager: boolean = false;
    isDriver: boolean = false;
    isExternal: boolean = false;
    cards: Card[] = [];

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

    withCards(cards: Card[]){
        return Object.assign(this, { cards: cards });
    }

    build(this: User) {
        return new User(this);
    }
}

export interface Token {
    token: string,
    expiry: Date,
}

export interface Card {
    _id: ObjectId;
    type: string;
    cardNumber: string;
    cvv: string;
    expiry: Date;
    last4: string;
    isDefault: boolean;
}

export interface DataStore {
    users: User[],
    trips: Trip[],
    bookings: Booking[],
    routes: Route[],
    stops: Stop[],
    vehicles: Vehicle[],
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
        const originIndex = route.stops.findIndex(sid => sid.equals(this.originId));
        const destIndex = route.stops.findIndex(sid => sid.equals(this.destId));
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
            originIndex: route.stops.findIndex(sid => sid.equals(this.originId)),
            originName: origin.name,
            destIndex: route.stops.findIndex(sid => sid.equals(this.destId)),
            destName: dest.name,
        };
    }
}

export class Trip {
    _id: ObjectId;
    vehicleId: ObjectId;
    driverId: ObjectId;
    routeId: ObjectId;
    stopTimes: Date[];
    bookings: ObjectId[];

    constructor(_id: ObjectId, vehicleId: ObjectId, routeId: ObjectId, stopTimes: Date[], bookings: ObjectId[] = [], driverId: ObjectId) {
        this._id = _id;
        this.vehicleId = vehicleId;
        this.driverId = driverId;
        this.routeId = routeId;
        this.stopTimes = stopTimes;
        this.bookings = bookings;
    }
}

export class Booking {
    _id: ObjectId;
    userId: ObjectId;
    tripId: ObjectId;
    originId: ObjectId;
    destId: ObjectId;
    numTickets: number = 1;
    numLuggage: number = 1;
    bookingTime: Date;

    constructor(_id: ObjectId, userId: ObjectId, tripId: ObjectId, originId: ObjectId, destId: ObjectId, numTickets?: number, numLuggage?: number, bookingTime?: Date) {
        this._id = _id;
        this.userId = userId;
        this.tripId = tripId;
        this.originId = originId;
        this.destId = destId;
        if (typeof numTickets !== "undefined") this.numTickets = numTickets;
        if (typeof numLuggage !== "undefined") this.numLuggage = numLuggage;
        this.bookingTime = bookingTime ?? new Date();
    }
}

export interface TripList {
    departName: string,
    arriveName: string,
    trips: TripBox[],
}

export interface TripBox {
    tripId: ObjectId,
    departId: ObjectId,
    arriveId: ObjectId,
    departureTime: Date,
    arrivalTime: Date,
    price: number,
    curCapacity: number, 
    maxCapacity: number,
    curLuggageCapacity: number,
    maxLuggageCapacity: number,
    luggagePrice: number,
    hasAssist: boolean,
}

export interface TripInfo {
    departName: string,
    arriveName: string,
    trip: TripBox,
}

export interface Promotion {
    title: string,
    description: string,
    location: string,
    img: string,
    validFrom: string,
    validTo: string
}

export interface Vehicle {
    _id: ObjectId,
    maxCapacity: number,
    maxLuggageCapacity: number,
    hasAssist: boolean,
    model: string,
    numberPlate: string,
    reports: Report[],
}

export interface Report {
    date: Date,
    text: string,
}

export interface DisplayBooking {
    _id: string,
    userId: string,
    tripId: string,
    originName: string,
    destName: string,
    departureTime: string,
}

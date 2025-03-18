import express, { json, Request, Response } from 'express';
import { setData } from "../dataStore";
import { Booking, Route, UserBuilder, Trip } from "../interface";

const request = require("supertest");
const app = require("../app");

const newDb = { users: [{ email: 'email', password: 'password', tokens: [], userId: 0, bookings: [] }], bookings: [] };

beforeEach(() => {
    setData({ users: [], trips: [], bookings: [], routes: [] });
})

describe("GET /pastBookings", () => {
    const booking00: Booking = new Booking(0, 0, 0, 0, 1, new Date(0));
    const booking01: Booking = new Booking(1, 0, 0, 0, 1, new Date(1));
    const booking02: Booking = new Booking(2, 0, 0, 0, 1, new Date(2));
    const booking03: Booking = new Booking(3, 0, 0, 0, 1, new Date(3));
    const booking04: Booking = new Booking(4, 0, 0, 0, 1, new Date(4));

    const booking10: Booking = new Booking(5, 1, 0, 0, 1, new Date(0));
    const booking11: Booking = new Booking(6, 1, 0, 0, 1, new Date(1));

    const upcomingBooking: Booking = new Booking(7, 0, 1, 0, 1, new Date(0));

    const trip0: Trip = new Trip(0, 0, 0, [ new Date(0), new Date(1) ], [ 0, 1, 2, 3, 4, 5, 6 ]);
    const upcomingTrip: Trip = new Trip(1, 0, 0, [ new Date(3000, 0, 1), new Date(3000, 0, 2) ], [ 7 ]);

    const route0: Route = new Route(0, [ 0, 1 ], [ 0, 1 ]);

    test("No past bookings", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).build() ],
            trips: [ trip0, upcomingTrip ],
            bookings: [ upcomingBooking ],
            routes: [ route0 ],
        });
        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toStrictEqual([]);
    });

    test("2 total past bookings, 2 past user bookings", async () => {
        const expected = [ booking01, booking00 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withBookings([ 0, 1 ]).build() ],
            trips: [ trip0, upcomingTrip ],
            bookings: [ booking00, booking01, upcomingBooking ],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 2 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toEqual(expected);
    });

    test("2 total past bookings, 2 past user bookings, display 1", async () => {
        const expected = [ booking01 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withBookings([ 0, 1 ]).build() ],
            trips: [ trip0, upcomingTrip ],
            bookings: [ booking00, booking01, upcomingBooking ],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toEqual(expected);
    });

    test("2 total past bookings, 1 past user booking", async () => {
        const expected = [ booking00 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withBookings([ 0 ]).build() ],
            trips: [ trip0, upcomingTrip ],
            bookings: [ booking00, booking10, upcomingBooking ],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toEqual(expected);
    });

    test("2 total past bookings, 2 past user bookings, display 3", async () => {
        const expected = [ booking01, booking00 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withBookings([ 0, 1 ]).build() ],
            trips: [ trip0, upcomingTrip ],
            bookings: [ booking00, booking01, upcomingBooking ],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 3 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toEqual(expected);
    });

    test("5 total past bookings, 3 past user bookings", async () => {
        const expected = [ booking03, booking02, booking00 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withBookings([ 0, 2, 3 ]).build() ],
            trips: [ trip0, upcomingTrip ],
            bookings: [ booking00, booking10, booking02, booking03, booking11, upcomingBooking ],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 3 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toEqual(expected);
    });
});

describe("GET /upcomingBookings", () => {
    const booking00: Booking = new Booking(0, 0, 0, 0, 1, new Date(0));
    const booking01: Booking = new Booking(1, 0, 0, 0, 1, new Date(1));
    const booking02: Booking = new Booking(2, 0, 0, 0, 1, new Date(2));
    const booking03: Booking = new Booking(3, 0, 0, 0, 1, new Date(3));
    const booking04: Booking = new Booking(4, 0, 0, 0, 1, new Date(4));

    const booking10: Booking = new Booking(5, 1, 0, 0, 1, new Date(0));
    const booking11: Booking = new Booking(6, 1, 0, 0, 1, new Date(1));

    const pastBooking: Booking = new Booking(7, 0, 1, 0, 1, new Date(0));

    const trip0: Trip = new Trip(0, 0, 0, [ new Date(3000, 0, 1), new Date(3000, 0, 2) ], [ 0, 1, 2, 3, 4, 5, 6 ]);
    const pastTrip: Trip = new Trip(1, 0, 0, [ new Date(0), new Date(1) ], [ 7 ]);

    const route0: Route = new Route(0, [ 0, 1 ], [ 0, 1 ]);

    test("No past bookings", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).build() ],
            trips: [ trip0, pastTrip ],
            bookings: [ pastBooking ],
            routes: [ route0 ],
        });
        const response = await request(app)
            .get("/upcomingBookings")
            .send({ userId: 0, numBookings: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toStrictEqual([]);
    });

    test("2 total past bookings, 2 past user bookings", async () => {
        const expected = [ booking01, booking00 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withBookings([ 0, 1 ]).build() ],
            trips: [ trip0, pastTrip ],
            bookings: [ booking00, booking01, pastBooking ],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/upcomingBookings")
            .send({ userId: 0, numBookings: 2 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toEqual(expected);
    });

    test("2 total past bookings, 2 past user bookings, display 1", async () => {
        const expected = [ booking01 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withBookings([ 0, 1 ]).build() ],
            trips: [ trip0, pastTrip ],
            bookings: [ booking00, booking01, pastBooking ],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/upcomingBookings")
            .send({ userId: 0, numBookings: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toEqual(expected);
    });

    test("2 total past bookings, 1 past user booking", async () => {
        const expected = [ booking00 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withBookings([ 0 ]).build() ],
            trips: [ trip0, pastTrip ],
            bookings: [ booking00, booking10, pastBooking ],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/upcomingBookings")
            .send({ userId: 0, numBookings: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toEqual(expected);
    });

    test("2 total past bookings, 2 past user bookings, display 3", async () => {
        const expected = [ booking01, booking00 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withBookings([ 0, 1 ]).build() ],
            trips: [ trip0, pastTrip ],
            bookings: [ booking00, booking01, pastBooking ],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/upcomingBookings")
            .send({ userId: 0, numBookings: 3 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toEqual(expected);
    });

    test("5 total past bookings, 3 past user bookings", async () => {
        const expected = [ booking03, booking02, booking00 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withBookings([ 0, 2, 3 ]).build() ],
            trips: [ trip0, pastTrip ],
            bookings: [ booking00, booking10, booking02, booking03, booking11, pastBooking ],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/upcomingBookings")
            .send({ userId: 0, numBookings: 3 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.userBookings).toEqual(expected);
    });
});

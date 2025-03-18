import express, { json, Request, Response } from 'express';
import { setData } from "../dataStore";
import { booking, trip, route } from "../interface";

const request = require("supertest");
const app = require("../app");

const newDb = { users: [{ email: 'email', password: 'password', tokens: [], userId: 0, bookings: [] }], bookings: [] };

beforeEach(() => {
    setData({ users: [], trips: [], bookings: [], routes: [] });
})

describe("GET /pastBookings", () => {
    const booking00: booking = {
        bookingId: 0,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(0).toISOString(),
        origin: 0,
        dest: 1,
    };
    const booking01: booking = {
        bookingId: 1,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(1).toISOString(),
        origin: 0,
        dest: 1,
    };
    const booking02: booking = {
        bookingId: 2,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(2).toISOString(),
        origin: 0,
        dest: 1,
    };
    const booking03: booking = {
        bookingId: 3,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(3).toISOString(),
        origin: 0,
        dest: 1,
    };
    const booking04: booking = {
        bookingId: 4,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(4).toISOString(),
        origin: 0,
        dest: 1,
    };

    const booking10: booking = {
        bookingId: 5,
        userId: 1,
        tripId: 0,
        bookingTime: new Date(0).toISOString(),
        origin: 0,
        dest: 1,
    };
    const booking11: booking = {
        bookingId: 6,
        userId: 1,
        tripId: 0,
        bookingTime: new Date(1).toISOString(),
        origin: 0,
        dest: 1,
    };

    const upcomingBooking: booking = {
        bookingId: 7,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(0).toISOString(),
        origin: 0,
        dest: 1,
    }

    const trip0: trip = {
        tripId: 0,
        vehicleId: 0,
        routeId: 0,
        bookings: [ 0, 1, 2, 3, 4, 5, 6 ],
        stopTimes: [ new Date(0).toISOString(), new Date(1).toISOString() ],
    };
    const upcomingTrip: trip = {
        tripId: 0,
        vehicleId: 0,
        routeId: 0,
        bookings: [ 7 ],
        stopTimes: [ new Date(3000, 0, 1).toISOString(), new Date(3000, 0, 2).toISOString() ],
    }

    const route0: route = {
        routeId: 0,
        stops: [ 0, 1 ],
        trips: [ 0, 1 ],
    };

    test("No past bookings", async () => {
        setData({
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: []
            }],
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
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 1 ],
            }],
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
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 1 ],
            }],
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
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0 ],
            }],
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
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 1 ],
            }],
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
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 2, 3 ],
            }],
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
    const booking00: booking = {
        bookingId: 0,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(0).toISOString(),
        origin: 0,
        dest: 1,
    };
    const booking01: booking = {
        bookingId: 1,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(1).toISOString(),
        origin: 0,
        dest: 1,
    };
    const booking02: booking = {
        bookingId: 2,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(2).toISOString(),
        origin: 0,
        dest: 1,
    };
    const booking03: booking = {
        bookingId: 3,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(3).toISOString(),
        origin: 0,
        dest: 1,
    };
    const booking04: booking = {
        bookingId: 4,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(4).toISOString(),
        origin: 0,
        dest: 1,
    };

    const booking10: booking = {
        bookingId: 5,
        userId: 1,
        tripId: 0,
        bookingTime: new Date(0).toISOString(),
        origin: 0,
        dest: 1,
    };
    const booking11: booking = {
        bookingId: 6,
        userId: 1,
        tripId: 0,
        bookingTime: new Date(1).toISOString(),
        origin: 0,
        dest: 1,
    };

    const pastBooking: booking = {
        bookingId: 7,
        userId: 0,
        tripId: 0,
        bookingTime: new Date(0).toISOString(),
        origin: 0,
        dest: 1,
    }

    const trip0: trip = {
        tripId: 0,
        vehicleId: 0,
        routeId: 0,
        bookings: [ 0, 1, 2, 3, 4, 5, 6 ],
        stopTimes: [ new Date(3000, 0, 1).toISOString(), new Date(3000, 0, 2).toISOString() ],
    };
    const pastTrip: trip = {
        tripId: 0,
        vehicleId: 0,
        routeId: 0,
        bookings: [ 7 ],
        stopTimes: [ new Date(0).toISOString(), new Date(1).toISOString() ],
    }

    const route0: route = {
        routeId: 0,
        stops: [ 0, 1 ],
        trips: [ 0, 1 ],
    };

    test("No past bookings", async () => {
        setData({
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: []
            }],
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
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 1 ],
            }],
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
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 1 ],
            }],
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
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0 ],
            }],
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
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 1 ],
            }],
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
            users: [{
                firstName: 'first',
                lastName: 'last',
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 2, 3 ],
            }],
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

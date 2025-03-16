import express, { json, Request, Response } from 'express';
import { setData } from "../dataStore";
import { booking } from "../interface";

const request = require("supertest");
const app = require("../app");

const newDb = { users: [{ email: 'email', password: 'password', tokens: [], userId: 0, bookings: [] }], bookings: [] };

beforeEach(() => {
    setData({ users: [], trips: [], bookings: [] });
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

    test("No bookings", async () => {
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
            trips: [],
            bookings: [],
        });
        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.bookings).toStrictEqual([]);
    });

    test("2 total bookings, 2 user bookings", async () => {
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
            trips: [],
            bookings: [ booking00, booking01 ],
        });

        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 2 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.bookings).toEqual(expected);
    });

    test("2 total bookings, 2 user bookings, display 1", async () => {
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
            trips: [],
            bookings: [ booking00, booking01 ],
        });

        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.bookings).toEqual(expected);
    });

    test("2 total bookings, 1 user booking", async () => {
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
            trips: [],
            bookings: [ booking00, booking10 ],
        });

        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.bookings).toEqual(expected);
    });

    test("2 total bookings, 2 user bookings, display 3", async () => {
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
            trips: [],
            bookings: [ booking00, booking01 ],
        });

        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 3 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.bookings).toEqual(expected);
    });

    test("5 total bookings, 3 user bookings", async () => {
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
            trips: [],
            bookings: [ booking00, booking10, booking02, booking03, booking11 ],
        });

        const response = await request(app)
            .get("/pastBookings")
            .send({ userId: 0, numBookings: 3 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.bookings).toEqual(expected);
    });
});

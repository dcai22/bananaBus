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
    const booking0: booking = {
        bookingId: 0,
        bookingTimes: [[0, new Date(0).toISOString()]],
        routeId: 0,
    };
    const booking1: booking = {
        bookingId: 1,
        bookingTimes: [[0, new Date(1).toISOString()]],
        routeId: 1,
    };
    const booking2: booking = {
        bookingId: 2,
        bookingTimes: [[0, new Date(2).toISOString()]],
        routeId: 2,
    };
    const booking3: booking = {
        bookingId: 3,
        bookingTimes: [[0, new Date(3).toISOString()]],
        routeId: 3,
    };
    const booking4: booking = {
        bookingId: 4,
        bookingTimes: [[0, new Date(4).toISOString()]],
        routeId: 4,
    };

    test("No bookings", async () => {
        setData({
            users: [{
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
        const expected = [ booking1, booking0 ];
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 1 ],
            }],
            trips: [],
            bookings: [ booking0, booking1 ],
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
        const expected = [ booking1 ];
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 1 ],
            }],
            trips: [],
            bookings: [ booking0, booking1 ],
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
        const expected = [ booking0 ];
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0 ],
            }],
            trips: [],
            bookings: [ booking0, booking1 ],
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
        const expected = [ booking1, booking0 ];
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 1 ],
            }],
            trips: [],
            bookings: [ booking0, booking1 ],
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
        const expected = [ booking3, booking2, booking0 ];
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                bookings: [ 0, 2, 3 ],
            }],
            trips: [],
            bookings: [ booking0, booking1, booking2, booking3, booking4 ],
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

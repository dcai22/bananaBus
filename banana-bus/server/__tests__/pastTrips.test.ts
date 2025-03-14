import express, { json, Request, Response } from 'express';
import { setData } from "../dataStore";
import { trip } from "../interface";

const request = require("supertest");
const app = require("../app");

const newDb = { users: [{ email: 'email', password: 'password', tokens: [], userId: 0, trips: [] }], trips: [] };

beforeEach(() => {
    setData({ users: [], trips: [] });
})

describe("GET /pastTrips", () => {
    const trip0: trip = {
        tripId: 0,
        vehicleId: 0,
        price: 0,
        departure_time: new Date(0).toISOString(),
        arrival_time: new Date(0).toISOString(),
    };
    const trip1: trip = {
        tripId: 1,
        vehicleId: 1,
        price: 1,
        departure_time: new Date(1).toISOString(),
        arrival_time: new Date(1).toISOString(),
    };
    const trip2: trip = {
        tripId: 2,
        vehicleId: 2,
        price: 2,
        departure_time: new Date(2).toISOString(),
        arrival_time: new Date(2).toISOString(),
    };
    const trip3: trip = {
        tripId: 3,
        vehicleId: 3,
        price: 3,
        departure_time: new Date(3).toISOString(),
        arrival_time: new Date(3).toISOString(),
    };
    const trip4: trip = {
        tripId: 4,
        vehicleId: 4,
        price: 4,
        departure_time: new Date(4).toISOString(),
        arrival_time: new Date(4).toISOString(),
    };

    test("No trips", async () => {
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                trips: []
            }],
            trips: [],
        });
        const response = await request(app)
            .get("/pastTrips")
            .send({ userId: 0, numTrips: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.trips).toStrictEqual([]);
    });

    test("2 total trips, 2 user trips", async () => {
        const expected = [ trip1, trip0 ];
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                trips: [ 0, 1 ],
            }],
            trips: [ trip0, trip1 ],
        });

        const response = await request(app)
            .get("/pastTrips")
            .send({ userId: 0, numTrips: 2 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.trips).toEqual(expected);
    });

    test("2 total trips, 2 user trips, display 1", async () => {
        const expected = [ trip1 ];
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                trips: [ 0, 1 ],
            }],
            trips: [ trip0, trip1 ],
        });

        const response = await request(app)
            .get("/pastTrips")
            .send({ userId: 0, numTrips: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.trips).toEqual(expected);
    });

    test("2 total trips, 1 user trip", async () => {
        const expected = [ trip0 ];
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                trips: [ 0 ],
            }],
            trips: [ trip0, trip1 ],
        });

        const response = await request(app)
            .get("/pastTrips")
            .send({ userId: 0, numTrips: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.trips).toEqual(expected);
    });

    test("2 total trips, 2 user trips, display 3", async () => {
        const expected = [ trip1, trip0 ];
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                trips: [ 0, 1 ],
            }],
            trips: [ trip0, trip1 ],
        });

        const response = await request(app)
            .get("/pastTrips")
            .send({ userId: 0, numTrips: 3 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.trips).toEqual(expected);
    });

    test("5 total trips, 3 user trips", async () => {
        const expected = [ trip3, trip2, trip0 ];
        setData({
            users: [{
                email: 'email',
                password: 'password',
                tokens: [],
                userId: 0,
                trips: [ 0, 2, 3 ],
            }],
            trips: [ trip0, trip1, trip2, trip3, trip4 ],
        });

        const response = await request(app)
            .get("/pastTrips")
            .send({ userId: 0, numTrips: 3 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.trips).toEqual(expected);
    });
});

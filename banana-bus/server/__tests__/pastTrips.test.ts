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

    test("2 trips, all for the same user", async () => {
        const trip0: trip = {
            tripId: 0,
            vehicleId: 0,
            price: 0,
            departure_time: new Date(0).toISOString(),
            arrival_time: new Date(1).toISOString(),
        };
        const trip1 = {
            tripId: 1,
            vehicleId: 1,
            price: 1,
            departure_time: new Date(2).toISOString(),
            arrival_time: new Date(3).toISOString(),
        };
        const expected = [ trip1, trip0 ];
        setData({
            users: [{
                email:'email',
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
});

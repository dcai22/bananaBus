import express, { json, Request, Response } from 'express';
import { getData, setData } from "../dataStore";
import { Booking, Route, UserBuilder, Trip } from "../interface";

const request = require("supertest");
const app = require("../app");

const newDb = { users: [{ email: 'email', password: 'password', tokens: [], userId: 0, bookings: [] }], bookings: [] };

beforeEach(() => {
    setData({ users: [], trips: [], bookings: [], routes: [] });
})


describe("GET /getSavedRoutes", () => {
    const route0 = new Route(0, []);
    const route1 = new Route(1, []);
    const route2 = new Route(2, []);

    test("no routes", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).build() ],
            trips: [],
            bookings: [],
            routes: [],
        });

        const response = await request(app)
            .get("/getSavedRoutes")
            .send({ userId: 0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.savedRoutes).toStrictEqual([]);
    });

    test("one saved route", async () => {
        const expected = [ route0 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ 0 ]).build() ],
            trips: [],
            bookings: [],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/getSavedRoutes")
            .send({ userId: 0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.savedRoutes).toEqual(expected);
    });

    test("many saved routes", async () => {
        const expected = [ route0, route1, route2 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ 0, 1, 2 ]).build() ],
            trips: [],
            bookings: [],
            routes: [ route0, route1, route2 ],
        });

        const response = await request(app)
            .get("/getSavedRoutes")
            .send({ userId: 0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.savedRoutes).toEqual(expected);
    });

    test("user does not exist", async () => {
        setData({
            users: [],
            trips: [],
            bookings: [],
            routes: [ route0 ],
        });

        const response = await request(app)
            .get("/getSavedRoutes")
            .send({ userId: 0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(400);
    });
});

describe("POST /saveRoute", () => {
    const route0 = new Route(0, []);
    const route1 = new Route(1, []);
    const route2 = new Route(2, []);

    test("simple save route", async () => {
        const expected = [ 0 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).build() ],
            trips: [],
            bookings: [],
            routes: [ route0 ],
        });

        const response = await request(app)
            .post("/saveRoute")
            .send({ userId: 0, routeId: 0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);

        expect(getData().users[0].savedRoutes).toEqual(expected);
    });

    test("savedRoutes sorted after new route is saved", async () => {
        const expected = [ 0, 1, 2 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ 0, 2 ]).build() ],
            trips: [],
            bookings: [],
            routes: [ route0, route1, route2 ],
        });

        const response = await request(app)
            .post("/saveRoute")
            .send({ userId: 0, routeId: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);

        expect(getData().users[0].savedRoutes).toEqual(expected);
    });

    test("user does not exist", async () => {
        setData({
            users: [],
            trips: [],
            bookings: [],
            routes: [ route0 ],
        });

        const response = await request(app)
            .post("/saveRoute")
            .send({ userId: 0, routeId: 0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(400);
    });

    test("route does not exist", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).build() ],
            trips: [],
            bookings: [],
            routes: [ route0 ],
        });

        const response = await request(app)
            .post("/saveRoute")
            .send({ userId: 0, routeId: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(400);
    });
});

describe("DELETE /unsaveRoute", () => {
    const route0 = new Route(0, []);
    const route1 = new Route(1, []);
    const route2 = new Route(2, []);

    test("simple unsave route", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ 0 ]).build() ],
            trips: [],
            bookings: [],
            routes: [ route0 ],
        });

        const response = await request(app)
            .delete("/unsaveRoute")
            .send({ userId: 0, routeId: 0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);

        expect(getData().users[0].savedRoutes).toStrictEqual([]);
    });

    test("unsave route from larger array", async () => {
        const expected = [ 0, 2 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ 0, 1, 2 ]).build() ],
            trips: [],
            bookings: [],
            routes: [ route0, route1, route2 ],
        });

        const response = await request(app)
            .delete("/unsaveRoute")
            .send({ userId: 0, routeId: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);

        expect(getData().users[0].savedRoutes).toEqual(expected);
    });

    test("user does not exist", async () => {
        setData({
            users: [],
            trips: [],
            bookings: [],
            routes: [ route0 ],
        });

        const response = await request(app)
            .delete("/unsaveRoute")
            .send({ userId: 0, routeId: 0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(400);
    });

    test("route does not exist", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ 0 ]).build() ],
            trips: [],
            bookings: [],
            routes: [ route0 ],
        });

        const response = await request(app)
            .delete("/unsaveRoute")
            .send({ userId: 0, routeId: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(400);
    });

    test("route exists but was not saved", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).build() ],
            trips: [],
            bookings: [],
            routes: [ route0 ],
        });

        const response = await request(app)
            .delete("/unsaveRoute")
            .send({ userId: 0, routeId: 0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(400);
    });
});

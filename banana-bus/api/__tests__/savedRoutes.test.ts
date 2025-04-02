import express, { json, Request, Response } from 'express';
import { getData, setData } from "../dataStore";
import { Booking, Route, UserBuilder, Trip, RouteSection, Stop } from "../interface";

const request = require("supertest");
const app = require("../index");

const newDb = { users: [{ email: 'email', password: 'password', tokens: [], userId: 0, bookings: [] }], bookings: [] };

beforeEach(() => {
    setData({ users: [], trips: [], bookings: [], routes: [], stops: [] });
})


describe("GET /getSavedRoutes", () => {
    const stop0 = new Stop(0, '1utama Shopping Mall');
    const stop1 = new Stop(1, 'Kuala Lumpur Intl. Terminal 1');
    const stop2 = new Stop(2, 'Kuala Lumpur Intl. Terminal 2');
    const route0 = new Route(0, [0, 1]);
    const route1 = new Route(1, [1, 2]);
    const route2 = new Route(2, [0, 1, 2]);
    const routeSection0 = new RouteSection(0, 0, 1);
    const routeSection1 = new RouteSection(1, 1, 2);
    const routeSection2 = new RouteSection(2, 0, 2);

    const routes = [route0, route1, route2];
    const stops = [stop0, stop1, stop2];

    test("no saved routes", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).build() ],
            trips: [],
            bookings: [],
            routes: routes,
            stops: stops,
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
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ routeSection0 ]).build() ],
            trips: [],
            bookings: [],
            routes: routes,
            stops: stops,
        });
        const expected = [ routeSection0.asDisplayRouteSection() ];

        const response = await request(app)
            .get("/getSavedRoutes")
            .send({ userId: 0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.savedRoutes).toEqual(expected);
    });

    test("many saved routes", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ routeSection0, routeSection1, routeSection2 ]).build() ],
            trips: [],
            bookings: [],
            routes: routes,
            stops: stops,
        });
        const expected = [ routeSection0.asDisplayRouteSection(), routeSection1.asDisplayRouteSection(), routeSection2.asDisplayRouteSection() ];

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
            routes: routes,
            stops: stops,
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
    const stop0 = new Stop(0, '1utama Shopping Mall');
    const stop1 = new Stop(1, 'Kuala Lumpur Intl. Terminal 1');
    const stop2 = new Stop(2, 'Kuala Lumpur Intl. Terminal 2');
    const route0 = new Route(0, [0, 1]);
    const route1 = new Route(1, [1, 2]);
    const route2 = new Route(2, [0, 1, 2]);
    const routeSection0 = new RouteSection(0, 0, 1);
    const routeSection1 = new RouteSection(1, 1, 2);
    const routeSection2 = new RouteSection(2, 0, 2);

    const routes = [route0, route1, route2];
    const stops = [stop0, stop1, stop2];

    test("simple save route", async () => {
        const expected = [ routeSection0 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).build() ],
            trips: [],
            bookings: [],
            routes: routes,
            stops: stops,
        });

        const response = await request(app)
            .post("/saveRoute")
            .send({ userId: 0, routeId: 0, originId: 0, destId: 1 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);

        expect(getData().users[0].savedRoutes).toEqual(expected);
    });

    test("savedRoutes sorted after new route is saved", async () => {
        const expected = [ routeSection0, routeSection1, routeSection2 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ routeSection0, routeSection2 ]).build() ],
            trips: [],
            bookings: [],
            routes: routes,
            stops: stops,
        });

        const response = await request(app)
            .post("/saveRoute")
            .send({ userId: 0, routeId: 1, originId: 1, destId: 2 })
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
            routes: routes,
            stops: stops,
        });

        const response = await request(app)
            .post("/saveRoute")
            .send({ userId: 0, routeId: 0, originId: 0, destId: 1 })
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
            stops: stops,
        });

        const response = await request(app)
            .post("/saveRoute")
            .send({ userId: 0, routeId: 1, originId: 1, destId: 2 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(400);
    });
});

describe("DELETE /unsaveRoute", () => {
    const stop0 = new Stop(0, '1utama Shopping Mall');
    const stop1 = new Stop(1, 'Kuala Lumpur Intl. Terminal 1');
    const stop2 = new Stop(2, 'Kuala Lumpur Intl. Terminal 2');
    const route0 = new Route(0, [0, 1]);
    const route1 = new Route(1, [1, 2]);
    const route2 = new Route(2, [0, 1, 2]);
    const routeSection0 = new RouteSection(0, 0, 1);
    const routeSection1 = new RouteSection(1, 1, 2);
    const routeSection2 = new RouteSection(2, 0, 2);

    const routes = [route0, route1, route2];
    const stops = [stop0, stop1, stop2];

    test("simple unsave route", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ routeSection0 ]).build() ],
            trips: [],
            bookings: [],
            routes: routes,
            stops: stops,
        });

        const response = await request(app)
            .delete("/unsaveRoute")
            .send({ userId: 0, routeSection: routeSection0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(200);

        expect(getData().users[0].savedRoutes).toStrictEqual([]);
    });

    test("unsave route from larger array", async () => {
        const expected = [ routeSection0, routeSection2 ];
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).withSavedRoutes([ routeSection0, routeSection1, routeSection2 ]).build() ],
            trips: [],
            bookings: [],
            routes: routes,
            stops: stops,
        });

        const response = await request(app)
            .delete("/unsaveRoute")
            .send({ userId: 0, routeSection: routeSection1 })
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
            routes: routes,
            stops: stops,
        });

        const response = await request(app)
            .delete("/unsaveRoute")
            .send({ userId: 0, routeSection: routeSection0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(400);
    });

    test("route exists but was not saved", async () => {
        setData({
            users: [ new UserBuilder().withEmail('email').withPassword('password').withUserId(0).build() ],
            trips: [],
            bookings: [],
            routes: routes,
            stops: stops,
        });

        const response = await request(app)
            .delete("/unsaveRoute")
            .send({ userId: 0, routeSection: routeSection0 })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(response.statusCode).toBe(400);
    });
});

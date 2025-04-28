import express, { json, Request, Response } from 'express';
import { Booking, Route, UserBuilder, Trip, RouteSection, Stop } from "../interface";
import { ObjectId } from 'mongodb';
import { closeConnection, collections, connectToDatabase } from '../mongoUtil';

const request = require("supertest");
const app = require("../index");

const sid0 = new ObjectId();
const sid1 = new ObjectId();
const sid2 = new ObjectId();
const rid0 = new ObjectId();
const rid1 = new ObjectId();
const rid2 = new ObjectId();

const stop0 = new Stop(sid0, '1utama Shopping Mall', 0, 0);
const stop1 = new Stop(sid1, 'Kuala Lumpur Intl. Terminal 1', 1, 1);
const stop2 = new Stop(sid2, 'Kuala Lumpur Intl. Terminal 2', 2, 2);
const route0 = new Route(rid0, [sid0, sid1]);
const route1 = new Route(rid1, [sid1, sid2]);
const route2 = new Route(rid2, [sid0, sid1, sid2]);
const routeSection0 = new RouteSection(rid0, sid0, sid1);
const routeSection1 = new RouteSection(rid1, sid1, sid2);
const routeSection2 = new RouteSection(rid2, sid0, sid2);
const displayRouteSection0 = {
    route: {
        _id: rid0.toString(),
        stops: [sid0.toString(), sid1.toString()],
        trips: [],
    },
    originIndex: 0,
    originName: '1utama Shopping Mall',
    destIndex: 1,
    destName: 'Kuala Lumpur Intl. Terminal 1',
};
const displayRouteSection1 = {
    route: {
        _id: rid1.toString(),
        stops: [sid1.toString(), sid2.toString()],
        trips: [],
    },
    originIndex: 0,
    originName: 'Kuala Lumpur Intl. Terminal 1',
    destIndex: 1,
    destName: 'Kuala Lumpur Intl. Terminal 2',
};
const displayRouteSection2 = {
    route: {
        _id: rid2.toString(),
        stops: [sid0.toString(), sid1.toString(), sid2.toString()],
        trips: [],
    },
    originIndex: 0,
    originName: '1utama Shopping Mall',
    destIndex: 2,
    destName: 'Kuala Lumpur Intl. Terminal 2',
};

beforeAll(async () => {
    await connectToDatabase();
    await collections.bookings?.deleteMany();
    await collections.trips?.deleteMany();
    await collections.routes?.deleteMany();
    await collections.stops?.deleteMany();
    await collections.vehicles?.deleteMany();
    await collections.users?.deleteMany();
    await collections.stops?.insertMany([stop0, stop1, stop2]);
    await collections.routes?.insertMany([route0, route1, route2]);
});

afterAll(async () => {
    await closeConnection();
});

beforeEach(async () => {
    await collections.users?.deleteMany();
});

describe("GET /savedRoutes/get", () => {
    test("no saved routes", async () => {
        const res0 = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { token } = res0.body;

        const res1 = await request(app)
            .get('/savedRoutes/get')
            .set('Authorization', `Bearer ${token}`);
        expect(res1.statusCode).toBe(200);
        expect(res1.body.savedRoutes).toStrictEqual([]);
    });

    test("one saved route", async () => {
        const expected = [displayRouteSection0];

        const res0 = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { token } = res0.body;

        await collections.users?.updateOne(
            { email: 'email@email.com' },
            { $push: { savedRoutes: routeSection0 } }
        );

        const res1 = await request(app)
            .get('/savedRoutes/get')
            .set('Authorization', `Bearer ${token}`);
        expect(res1.statusCode).toBe(200);
        expect(res1.body.savedRoutes).toEqual(expected);
    });

    test("many saved routes", async () => {
        const expected = [displayRouteSection0, displayRouteSection1, displayRouteSection2];

        const res0 = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { token } = res0.body;

        await collections.users?.updateOne(
            { email: 'email@email.com' },
            { $push: { savedRoutes: { $each: [ routeSection0, routeSection1, routeSection2 ] } } }
        );

        const res1 = await request(app)
            .get('/savedRoutes/get')
            .set('Authorization', `Bearer ${token}`);
        expect(res1.statusCode).toBe(200);
        expect(res1.body.savedRoutes).toStrictEqual(expected);
    });

    test("user does not exist", async () => {
        const res = await request(app)
            .get('/savedRoutes/get')
            .set('Authorization', `Bearer faketoken`);
        expect(res.statusCode).toBe(403);
    });
});

describe("POST /savedRoutes/save", () => {
    test("simple save route", async () => {
        const expected = [displayRouteSection0];

        const res0 = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { token } = res0.body;

        const res1 = await request(app)
            .post("/savedRoutes/save")
            .send(routeSection0)
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);

        const res2 = await request(app)
            .get('/savedRoutes/get')
            .set('Authorization', `Bearer ${token}`);
        expect(res2.statusCode).toBe(200);
        expect(res2.body.savedRoutes).toEqual(expected);
    });

    test("user does not exist", async () => {
        const res = await request(app)
            .post("/savedRoutes/save")
            .send(routeSection0)
            .set('Authorization', `Bearer faketoken`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res.statusCode).toBe(403);
    });

    test("route does not exist", async () => {
        const res0 = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { token } = res0.body;

        const res1 = await request(app)
            .post("/savedRoutes/save")
            .send({ routeId: new ObjectId(), originId: sid1, destId: sid2 })
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(400);

        const res2 = await request(app)
            .get('/savedRoutes/get')
            .set('Authorization', `Bearer ${token}`);
        expect(res2.statusCode).toBe(200);
        expect(res2.body.savedRoutes).toEqual([]);
    });
});

describe("DELETE /savedRoutes/unsave", () => {
    test("simple unsave route", async () => {
        const res0 = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { token } = res0.body;

        const res1 = await request(app)
            .post("/savedRoutes/save")
            .send(routeSection0)
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);

        const res2 = await request(app)
            .post("/savedRoutes/unsave")
            .send(routeSection0)
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res2.statusCode).toBe(200);

        const res3 = await request(app)
            .get('/savedRoutes/get')
            .set('Authorization', `Bearer ${token}`);
        expect(res3.body.savedRoutes).toEqual([]);
    });

    test("unsave route from larger array", async () => {
        const expected = [displayRouteSection0, displayRouteSection2];

        const res0 = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { token } = res0.body;

        const res1 = await request(app)
            .post("/savedRoutes/save")
            .send(routeSection0)
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);

        const res2 = await request(app)
            .post("/savedRoutes/save")
            .send(routeSection1)
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res2.statusCode).toBe(200);

        const res3 = await request(app)
            .post("/savedRoutes/save")
            .send(routeSection2)
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res3.statusCode).toBe(200);

        const res4 = await request(app)
            .post("/savedRoutes/unsave")
            .send(routeSection1)
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res4.statusCode).toBe(200);

        const res5 = await request(app)
            .get('/savedRoutes/get')
            .set('Authorization', `Bearer ${token}`);
        expect(res5.body.savedRoutes).toEqual(expected);
    });

    test("user does not exist", async () => {
        const res = await request(app)
            .post("/savedRoutes/unsave")
            .send(routeSection0)
            .set('Authorization', `Bearer faketoken`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res.statusCode).toBe(403);
    });

    test("route exists but was not saved", async () => {
        const res0 = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { token } = res0.body;

        const res1 = await request(app)
            .post("/savedRoutes/unsave")
            .send(routeSection0)
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(400);
    });
});

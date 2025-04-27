import express, { json, Request, Response } from 'express';
import { Booking, Route, UserBuilder, Trip, RouteSection, Stop, DisplayBooking } from "../interface";
import { ObjectId } from 'mongodb';
import { closeConnection, collections, connectToDatabase } from '../mongoUtil';

const request = require("supertest");
const app = require("../index");

// id's
const vid = new ObjectId();
const did = new ObjectId();
const sid0 = new ObjectId();
const sid1 = new ObjectId();
const sid2 = new ObjectId();
const rid = new ObjectId();
const bid00 = new ObjectId();
const bid01 = new ObjectId();
const bid02 = new ObjectId();
const bid03 = new ObjectId();
const bid10 = new ObjectId();
const bid11 = new ObjectId();
const tid0 = new ObjectId();
const tid1 = new ObjectId();
const fakeUid = new ObjectId();

// data
const stop0 = new Stop(sid0, '1utama Shopping Mall', 0, 0);
const stop1 = new Stop(sid1, 'Kuala Lumpur Intl. Terminal 1', 1, 1);
const stop2 = new Stop(sid2, 'Kuala Lumpur Intl. Terminal 2', 2, 2);
const route = new Route(rid, [sid0, sid1], [tid0, tid1]);

beforeAll(async () => {
    await connectToDatabase();

    await collections.bookings?.deleteMany();
    await collections.trips?.deleteMany();
    await collections.routes?.deleteMany();
    await collections.stops?.deleteMany();
    await collections.vehicles?.deleteMany();
    await collections.users?.deleteMany();

    await collections.stops?.insertMany([stop0, stop1, stop2]);
    await collections.routes?.insertOne(route);

    const res = await request(app)
        .post('/auth/register')
        .send({
            email: 'email@email.com',
            password: 'password',
            firstName: 'first',
            lastName: 'last',
        });
});

beforeEach(async () => {
    // delete stuff
});

afterAll(async () => {
    await closeConnection();
});

describe("GET /bookings/past", () => {
    const upcomingBId = new ObjectId();

    let booking00: Booking;
    let booking01: Booking;
    let booking02: Booking;
    let booking03: Booking;
    let booking10: Booking;
    let booking11: Booking;
    let upcomingBooking: Booking;

    let displayBooking00: DisplayBooking;
    let displayBooking01: DisplayBooking;
    let displayBooking02: DisplayBooking;
    let displayBooking03: DisplayBooking;

    beforeAll(async () => {
        await collections.trips?.deleteMany();

        const user = await collections.users?.findOne({ email: 'email@email.com' });
        if (!user) throw new Error();
        const userId = user._id;

        upcomingBooking = new Booking(upcomingBId, userId, tid1, sid0, sid1);

        const pastTrip: Trip = new Trip(tid0, vid, rid, [new Date(0), new Date(1)], [bid00, bid01, bid02, bid03, bid10, bid11], did);
        const upcomingTrip: Trip = new Trip(tid1, vid, rid, [new Date(3000, 0, 1), new Date(3000, 0, 2)], [upcomingBId], did);
    
        booking00 = new Booking(bid00, userId, tid0, sid0, sid1);
        booking01 = new Booking(bid01, userId, tid0, sid0, sid1);
        booking02 = new Booking(bid02, userId, tid0, sid0, sid1);
        booking03 = new Booking(bid03, userId, tid0, sid0, sid1);
        booking10 = new Booking(bid10, fakeUid, tid0, sid0, sid1);
        booking11 = new Booking(bid11, fakeUid, tid0, sid0, sid1);

        displayBooking00 = {
            _id: bid00.toString(),
            userId: userId.toString(),
            tripId: tid0.toString(),
            originName: '1utama Shopping Mall',
            destName: 'Kuala Lumpur Intl. Terminal 1',
            departureTime: new Date(0).toISOString(),
        };
        displayBooking01 = {
            _id: bid01.toString(),
            userId: userId.toString(),
            tripId: tid0.toString(),
            originName: '1utama Shopping Mall',
            destName: 'Kuala Lumpur Intl. Terminal 1',
            departureTime: new Date(0).toISOString(),
        };
        displayBooking02 = {
            _id: bid02.toString(),
            userId: userId.toString(),
            tripId: tid0.toString(),
            originName: '1utama Shopping Mall',
            destName: 'Kuala Lumpur Intl. Terminal 1',
            departureTime: new Date(0).toISOString(),
        };
        displayBooking03 = {
            _id: bid03.toString(),
            userId: userId.toString(),
            tripId: tid0.toString(),
            originName: '1utama Shopping Mall',
            destName: 'Kuala Lumpur Intl. Terminal 1',
            departureTime: new Date(0).toISOString(),
        };

        await collections.trips?.insertMany([pastTrip, upcomingTrip]);
    });

    beforeEach(async () => {
        await collections.bookings?.deleteMany();
        await collections.users?.updateOne(
            { email: 'email@email.com' },
            { $set: { bookings: [] } }
        );
    });

    test("No past bookings", async () => {
        const res0 = await request(app)
            .post('/auth/login')
            .send({
                email: 'email@email.com',
                password: 'password',
            });
        const { token } = res0.body;

        const res1 = await request(app)
            .get("/bookings/past")
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);
        expect(res1.body.bookings).toStrictEqual([]);
    });

    test("2 past bookings", async () => {
        const res0 = await request(app)
            .post('/auth/login')
            .send({
                email: 'email@email.com',
                password: 'password',
            });
        const token = res0.body.token;

        const expected = [displayBooking00, displayBooking01];

        await collections.users?.updateOne(
            { email: 'email@email.com' },
            { $push: { bookings: { $each: [bid00, bid01] } } }
        );
        await collections.bookings?.insertMany([booking00, booking01]);

        const res1 = await request(app)
            .get("/bookings/past")
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);
        expect(res1.body.bookings).toEqual(expected);
    });

    test("2 total past bookings, 1 past user booking", async () => {
        const res0 = await request(app)
            .post('/auth/login')
            .send({
                email: 'email@email.com',
                password: 'password',
            });
        const token = res0.body.token;

        const expected = [displayBooking00];

        await collections.users?.updateOne(
            { email: 'email@email.com' },
            { $push: { bookings: { $each: [bid00] } } }
        );
        await collections.bookings?.insertMany([booking00, booking10, upcomingBooking]);

        const res1 = await request(app)
            .get("/bookings/past")
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);
        expect(res1.body.bookings).toEqual(expected);
    });

    test("5 total past bookings, 3 past user bookings", async () => {
        const res0 = await request(app)
            .post('/auth/login')
            .send({
                email: 'email@email.com',
                password: 'password',
            });
        const token = res0.body.token;

        const expected = [displayBooking00, displayBooking02, displayBooking03];

        await collections.users?.updateOne(
            { email: 'email@email.com' },
            { $push: { bookings: { $each: [bid00, bid02, bid03] } } }
        );
        await collections.bookings?.insertMany([booking00, booking10, booking02, booking03, booking11, upcomingBooking]);

        const res1 = await request(app)
            .get("/bookings/past")
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);
        expect(res1.body.bookings).toEqual(expected);
    });
});

describe("GET /bookings/upcoming", () => {
    const pastBId = new ObjectId();

    let booking00: Booking;
    let booking01: Booking;
    let booking02: Booking;
    let booking03: Booking;
    let booking10: Booking;
    let booking11: Booking;
    let pastBooking: Booking;

    let displayBooking00: DisplayBooking;
    let displayBooking01: DisplayBooking;
    let displayBooking02: DisplayBooking;
    let displayBooking03: DisplayBooking;

    beforeAll(async () => {
        await collections.trips?.deleteMany();

        const user = await collections.users?.findOne({ email: 'email@email.com' });
        if (!user) throw new Error();
        const userId = user._id;

        pastBooking = new Booking(pastBId, userId, tid1, sid0, sid1);

        const upcomingTrip: Trip = new Trip(tid0, vid, rid, [new Date(3000, 0, 1), new Date(3000, 0, 2)], [bid00, bid01, bid02, bid03, bid10, bid11], did);
        const pastTrip: Trip = new Trip(tid1, vid, rid, [new Date(0), new Date(1)], [pastBId], did);
    
        booking00 = new Booking(bid00, userId, tid0, sid0, sid1);
        booking01 = new Booking(bid01, userId, tid0, sid0, sid1);
        booking02 = new Booking(bid02, userId, tid0, sid0, sid1);
        booking03 = new Booking(bid03, userId, tid0, sid0, sid1);
        booking10 = new Booking(bid10, fakeUid, tid0, sid0, sid1);
        booking11 = new Booking(bid11, fakeUid, tid0, sid0, sid1);

        displayBooking00 = {
            _id: bid00.toString(),
            userId: userId.toString(),
            tripId: tid0.toString(),
            originName: '1utama Shopping Mall',
            destName: 'Kuala Lumpur Intl. Terminal 1',
            departureTime: new Date(3000, 0, 1).toISOString(),
        };
        displayBooking01 = {
            _id: bid01.toString(),
            userId: userId.toString(),
            tripId: tid0.toString(),
            originName: '1utama Shopping Mall',
            destName: 'Kuala Lumpur Intl. Terminal 1',
            departureTime: new Date(3000, 0, 1).toISOString(),
        };
        displayBooking02 = {
            _id: bid02.toString(),
            userId: userId.toString(),
            tripId: tid0.toString(),
            originName: '1utama Shopping Mall',
            destName: 'Kuala Lumpur Intl. Terminal 1',
            departureTime: new Date(3000, 0, 1).toISOString(),
        };
        displayBooking03 = {
            _id: bid03.toString(),
            userId: userId.toString(),
            tripId: tid0.toString(),
            originName: '1utama Shopping Mall',
            destName: 'Kuala Lumpur Intl. Terminal 1',
            departureTime: new Date(3000, 0, 1).toISOString(),
        };

        await collections.trips?.insertMany([pastTrip, upcomingTrip]);
    });

    beforeEach(async () => {
        await collections.bookings?.deleteMany();
        await collections.users?.updateOne(
            { email: 'email@email.com' },
            { $set: { bookings: [] } }
        );
    });

    test("No upcoming bookings", async () => {
        const res0 = await request(app)
            .post('/auth/login')
            .send({
                email: 'email@email.com',
                password: 'password',
            });
        const { token } = res0.body;

        const res1 = await request(app)
            .get("/bookings/upcoming")
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);
        expect(res1.body.bookings).toStrictEqual([]);
    });

    test("2 upcoming bookings", async () => {
        const res0 = await request(app)
            .post('/auth/login')
            .send({
                email: 'email@email.com',
                password: 'password',
            });
        const token = res0.body.token;

        const expected = [displayBooking00, displayBooking01];

        await collections.users?.updateOne(
            { email: 'email@email.com' },
            { $push: { bookings: { $each: [bid00, bid01] } } }
        );
        await collections.bookings?.insertMany([booking00, booking01]);

        const res1 = await request(app)
            .get("/bookings/upcoming")
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);
        expect(res1.body.bookings).toEqual(expected);
    });

    test("2 total upcoming bookings, 1 upcoming user booking", async () => {
        const res0 = await request(app)
            .post('/auth/login')
            .send({
                email: 'email@email.com',
                password: 'password',
            });
        const token = res0.body.token;

        const expected = [displayBooking00];

        await collections.users?.updateOne(
            { email: 'email@email.com' },
            { $push: { bookings: { $each: [bid00] } } }
        );
        await collections.bookings?.insertMany([booking00, booking10, pastBooking]);

        const res1 = await request(app)
            .get("/bookings/upcoming")
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);
        expect(res1.body.bookings).toEqual(expected);
    });

    test("5 total upcoming bookings, 3 upcoming user bookings", async () => {
        const res0 = await request(app)
            .post('/auth/login')
            .send({
                email: 'email@email.com',
                password: 'password',
            });
        const token = res0.body.token;

        const expected = [displayBooking00, displayBooking02, displayBooking03];

        await collections.users?.updateOne(
            { email: 'email@email.com' },
            { $push: { bookings: { $each: [bid00, bid02, bid03] } } }
        );
        await collections.bookings?.insertMany([booking00, booking10, booking02, booking03, booking11, pastBooking]);

        const res1 = await request(app)
            .get("/bookings/upcoming")
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        expect(res1.statusCode).toBe(200);
        expect(res1.body.bookings).toEqual(expected);
    });
});

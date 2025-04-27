import { Booking, Route, Stop, Trip, Vehicle } from '../interface';
import { collections, connectToDatabase, closeConnection } from '../mongoUtil';
import { ObjectId } from 'mongodb';

const request = require("supertest");
const app = require("../index");

const driver = {
    email: "driver@email.com",
    password: 'password',
    firstName: 'first',
    lastName: 'last',
};
let driverToken: string;
let driverId: ObjectId;

const user = {
    email: "user@email.com",
    password: 'password',
    firstName: 'first',
    lastName: 'last',
};
let userToken: string;

const passenger0 = {
    email: "passenger0@email.com",
    password: 'password',
    firstName: 'first0',
    lastName: 'last0',
};
let passenger0Id: ObjectId;

const passenger1 = {
    email: "passenger1@email.com",
    password: 'password',
    firstName: 'first1',
    lastName: 'last1',
};
let passenger1Id: ObjectId;

const passenger2 = {
    email: "passenger2@email.com",
    password: 'password',
    firstName: 'first2',
    lastName: 'last2',
};
let passenger2Id: ObjectId;

const vid = new ObjectId();
const vehicle: Vehicle = {
    _id: vid,
    maxCapacity: 20,
    maxLuggageCapacity: 10,
    hasAssist: true,
    model: "model",
    numberPlate: "PLATE",
    reports: [],
};

const sid0 = new ObjectId();
const sid1 = new ObjectId();
const rid0 = new ObjectId();
const rid1 = new ObjectId();
const tid0 = new ObjectId();
const tid1 = new ObjectId();
const tid2 = new ObjectId();
const pastTId = new ObjectId();
const fakeTId = new ObjectId();

const stop0 = new Stop(sid0, '1utama Shopping Mall', 0, 0);
const stop1 = new Stop(sid1, 'Kuala Lumpur Intl. Terminal 1', 1, 1);
const route0 = new Route(rid0, [sid0, sid1], [pastTId, tid0, tid2]);
const route1 = new Route(rid1, [sid0, sid1], [fakeTId, tid1]);

beforeAll(async () => {
    await connectToDatabase();
    
    await collections.bookings?.deleteMany();
    await collections.trips?.deleteMany();
    await collections.routes?.deleteMany();
    await collections.stops?.deleteMany();
    await collections.vehicles?.deleteMany();
    await collections.users?.deleteMany();

    const driverRes = await request(app)
    .post('/register')
    .send(driver);
    driverToken = driverRes.body.token;
    driverId = new ObjectId(driverRes.body.userId as string);

    userToken = await request(app)
    .post('/register')
    .send(user)
    .then((res: any) => res.body.token);

    const passenger0Res = await request(app)
    .post('/register')
    .send(passenger0);
    passenger0Id = new ObjectId(passenger0Res.body.userId as string);

    const passenger1Res = await request(app)
    .post('/register')
    .send(passenger1);
    passenger1Id = new ObjectId(passenger1Res.body.userId as string);

    const passenger2Res = await request(app)
    .post('/register')
    .send(passenger2);
    passenger2Id = new ObjectId(passenger2Res.body.userId as string);

    await collections.stops?.insertMany([stop0, stop1]);
    await collections.routes?.insertMany([route0, route1]);
    await collections.vehicles?.insertOne(vehicle);
}, 10000);

afterAll(async () => {
    await closeConnection();
});

describe('GET /driver/getUpcomingTrips', () => {
    const resTrip0 = { _id: tid0.toString(), stopTimes: [new Date(3000, 0, 1).toISOString(), new Date(3000, 0, 2).toISOString()], originName: '1utama Shopping Mall', destName: 'Kuala Lumpur Intl. Terminal 1' };
    const resTrip1 = { _id: tid1.toString(), stopTimes: [new Date(3000, 1, 1).toISOString(), new Date(3000, 1, 2).toISOString()], originName: '1utama Shopping Mall', destName: 'Kuala Lumpur Intl. Terminal 1' };
    const resTrip2 = { _id: tid2.toString(), stopTimes: [new Date(3000, 2, 1).toISOString(), new Date(3000, 2, 2).toISOString()], originName: '1utama Shopping Mall', destName: 'Kuala Lumpur Intl. Terminal 1' };

    beforeEach(async () => {
        await collections.trips?.deleteMany();
        const pastTrip = new Trip(pastTId, vid, rid0, [new Date(0), new Date(1)], [], driverId);
        const fakeTrip = new Trip(fakeTId, vid, rid0, [new Date(3000, 0, 1), new Date(3000, 0, 2)], [], new ObjectId());
        await collections.trips?.insertMany([pastTrip, fakeTrip]);
    });
    
    test('no upcoming trips', async () => {
        const res = await request(app)
        .get('/driver/getUpcomingTrips')
        .set('Authorization', `Bearer ${driverToken}`);
        expect(res.status).toBe(200);
        expect(res.body.upcomingTrips).toEqual([]);
    });
    
    test('one upcoming trip', async () => {
        const trip0 = new Trip(tid0, vid, rid0, [new Date(3000, 0, 1), new Date(3000, 0, 2)], [], driverId);
        await collections.trips?.insertOne(trip0);
        const expected = [resTrip0];
        
        const res = await request(app)
            .get('/driver/getUpcomingTrips')
            .set('Authorization', `Bearer ${driverToken}`);
        expect(res.status).toBe(200);
        expect(res.body.upcomingTrips).toEqual(expected);
    });
    
    test('many upcoming trips', async () => {
        const trip0 = new Trip(tid0, vid, rid0, [new Date(3000, 0, 1), new Date(3000, 0, 2)], [], driverId);
        const trip1 = new Trip(tid1, vid, rid1, [new Date(3000, 1, 1), new Date(3000, 1, 2)], [], driverId);
        const trip2 = new Trip(tid2, vid, rid0, [new Date(3000, 2, 1), new Date(3000, 2, 2)], [], driverId);
        await collections.trips?.insertMany([trip0, trip1, trip2]);
        const expected = [resTrip0, resTrip1, resTrip2];

        const res = await request(app)
            .get('/driver/getUpcomingTrips')
            .set('Authorization', `Bearer ${driverToken}`);
        expect(res.status).toBe(200);
        expect(res.body.upcomingTrips).toEqual(expected);
    });
    
    test('invalid token', async () => {
        const res = await request(app)
        .get('/driver/getUpcomingTrips')
        .set('Authorization', `Bearer faketoken`);
        expect(res.status).toBe(403);
    });

    test('token does not belong to driver', async () => {
        const res = await request(app)
        .get('/driver/getUpcomingTrips')
        .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(403);
    });
});

describe('GET /driver/getTrip', () => {
    const resVehicle = {
        _id: vid.toString(),
        maxCapacity: 20,
        maxLuggageCapacity: 10,
        hasAssist: true,
        model: "model",
        numberPlate: "PLATE",
        reports: [],
    };
    
    beforeAll(async () => {
        await collections.bookings?.deleteMany();
        await collections.trips?.deleteMany();

        const pastTrip = new Trip(pastTId, vid, rid0, [new Date(0), new Date(1)], [], driverId);
        const fakeTrip = new Trip(fakeTId, vid, rid0, [new Date(3000, 0, 1), new Date(3000, 0, 2)], [], new ObjectId());
        const trip0 = new Trip(tid0, vid, rid0, [new Date(3000, 0, 1), new Date(3000, 0, 2)], [], driverId);
        const trip1 = new Trip(tid1, vid, rid1, [new Date(3000, 1, 1), new Date(3000, 1, 2)], [], driverId);
        const trip2 = new Trip(tid2, vid, rid0, [new Date(3000, 2, 1), new Date(3000, 2, 2)], [], driverId);
        const booking0Past = new Booking(new ObjectId(), passenger0Id, pastTId, sid0, sid1, 1);
        const booking00 = new Booking(new ObjectId(), passenger0Id, tid0, sid0, sid1, 2);
        const booking1Past = new Booking(new ObjectId(), passenger1Id, pastTId, sid0, sid1, 3);
        const booking10 = new Booking(new ObjectId(), passenger1Id, tid0, sid0, sid1, 4);
        const booking2Past = new Booking(new ObjectId(), passenger2Id, pastTId, sid0, sid1, 5);
        const booking20 = new Booking(new ObjectId(), passenger2Id, tid0, sid0, sid1, 6);

        await collections.trips?.insertMany([pastTrip, fakeTrip, trip0, trip1, trip2]);
        await collections.bookings?.insertMany([booking0Past, booking00, booking1Past, booking10, booking2Past, booking20]);
    });

    test('correctly gets past trip', async () => {
        const expected = {
            vehicle: resVehicle,
            stops: [
                { _id: sid0.toString(), name: '1utama Shopping Mall', stopTime: new Date(0).toISOString() },
                { _id: sid1.toString(), name: 'Kuala Lumpur Intl. Terminal 1', stopTime: new Date(1).toISOString() }
            ],
            passengers: [
                { firstName: "first0", lastName: "last0", numTickets: 1 },
                { firstName: "first1", lastName: "last1", numTickets: 3 },
                { firstName: "first2", lastName: "last2", numTickets: 5 }
            ],
        };

        const res = await request(app)
            .get(`/driver/getTrip?tripId=${pastTId.toString()}`)
            .set('Authorization', `Bearer ${driverToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(expected);
    });

    test('correctly gets upcoming trip', async () => {
        const expected = {
            vehicle: resVehicle,
            stops: [
                { _id: sid0.toString(), name: '1utama Shopping Mall', stopTime: new Date(3000, 0, 1).toISOString() },
                { _id: sid1.toString(), name: 'Kuala Lumpur Intl. Terminal 1', stopTime: new Date(3000, 0, 2).toISOString() }
            ],
            passengers: [
                { firstName: "first0", lastName: "last0", numTickets: 2 },
                { firstName: "first1", lastName: "last1", numTickets: 4 },
                { firstName: "first2", lastName: "last2", numTickets: 6 }
            ],
        };

        const res = await request(app)
            .get(`/driver/getTrip?tripId=${tid0.toString()}`)
            .set('Authorization', `Bearer ${driverToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(expected);
    });

    test("trip doesn't belong to driver", async () => {
        const res = await request(app)
            .get(`/driver/getTrip?tripId=${fakeTId.toString()}`)
            .set('Authorization', `Bearer ${driverToken}`);
        expect(res.statusCode).toBe(403);
    });

    test('invalid token', async () => {
        const res = await request(app)
            .get(`/driver/getTrip?tripId=${tid0.toString()}`)
            .set('Authorization', `Bearer faketoken`);
        expect(res.statusCode).toBe(403);
    });

    test('token does not belong to driver', async () => {
        const res = await request(app)
            .get(`/driver/getTrip?tripId=${tid0.toString()}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toBe(403);
    });
});

describe('GET /driver/reportVehicle', () => {
    beforeEach(async () => {
        await collections.vehicles?.updateMany({}, {
            $set: { reports: [] }
        });
    })

    test('one report', async () => {
        const report = { vehicleId: vid.toString(), reportText: "report" };
        const res = await request(app)
        .put('/driver/reportVehicle')
        .send(report)
        .set('Authorization', `Bearer ${driverToken}`);
        expect(res.status).toBe(200);
        const expected = [{ date: new Date(res.body.date as string), text: "report" }];

        const allReports = await collections.vehicles?.findOne({ _id: vid }).then(res => res ? res.reports : []);
        expect(allReports).toEqual(expected);
    });

    test('multiple reports', async () => {
        const report0 = { vehicleId: vid.toString(), reportText: "report0" };
        const report1 = { vehicleId: vid.toString(), reportText: "report1" };
        const report2 = { vehicleId: vid.toString(), reportText: "report2" };

        const res0 = await request(app)
        .put('/driver/reportVehicle')
        .send(report0)
        .set('Authorization', `Bearer ${driverToken}`);
        expect(res0.status).toBe(200);
        const res1 = await request(app)
        .put('/driver/reportVehicle')
        .send(report1)
        .set('Authorization', `Bearer ${driverToken}`);
        expect(res1.status).toBe(200);
        const res2 = await request(app)
        .put('/driver/reportVehicle')
        .send(report2)
        .set('Authorization', `Bearer ${driverToken}`);
        expect(res2.status).toBe(200);

        const expected = [
            { date: new Date(res0.body.date as string), text: "report0" },
            { date: new Date(res1.body.date as string), text: "report1" },
            { date: new Date(res2.body.date as string), text: "report2" },
        ];

        const allReports = await collections.vehicles?.findOne({ _id: vid }).then(res => res ? res.reports : null);
        expect(allReports).toEqual(expected);
    });

    test('invalid token', async () => {
        const report = { vehicleId: vid.toString(), reportText: "report" };
        const res = await request(app)
            .put('/driver/reportVehicle')
            .send(report)
            .set('Authorization', `Bearer faketoken`);
        expect(res.status).toBe(403);
    });

    test('user is not driver', async () => {
        const report = { vehicleId: vid.toString(), reportText: "report" };
        const res = await request(app)
            .put('/driver/reportVehicle')
            .send(report)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(403);
    });
});

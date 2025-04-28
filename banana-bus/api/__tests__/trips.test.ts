import { Route, Stop } from '../interface';
import { collections, connectToDatabase, closeConnection } from '../mongoUtil';
import { ObjectId } from 'mongodb';

const request = require("supertest");
const app = require("../index");

// set up data for tests
// manager and driver account
const manager = {
    email: "manager@email.com",
    password: 'password',
    firstName: 'first',
    lastName: 'last',
}
let managerToken: string;

const user = {
    email: "user@email.com",
    password: 'password',
    firstName: 'first',
    lastName: 'last',
}
let userToken: string;

const vehicle1 = {
    maxCapacity: 10,
    maxLuggageCapacity: 10,
    hasAssist: true,
    numberPlate: "abc123",
    model: "toyota" 
}

const sid0 = new ObjectId();
const sid1 = new ObjectId();
const sid2 = new ObjectId();
const rid = new ObjectId();

const stop0 = new Stop(sid0, '1utama Shopping Mall', 0, 0);
const stop1 = new Stop(sid1, 'Kuala Lumpur Intl. Terminal 1', 1, 1);
const stop2 = new Stop(sid2, 'Kuala Lumpur Intl. Terminal 2', 2, 2);
const route = new Route(rid, [sid0, sid1, sid2], []);

let date: Date;

beforeEach(async () => {
    // Clear users before each test
    await connectToDatabase();
    await collections.users?.deleteMany({});
    await collections.trips?.deleteMany({});
    await collections.routes?.deleteMany({});
    await collections.stops?.deleteMany({});
    await collections.vehicles?.deleteMany({});

    await collections.stops?.insertMany([stop0, stop1, stop2]);
    await collections.routes?.insertOne(route);

    // make manager and user
    managerToken = await request(app)
        .post('/auth/register')
        .send(manager)
        .then((res: any) => res.body.token);

    userToken = await request(app)
        .post('/auth/register')
        .send(user)
        .then((res: any) => res.body.token);

    date = new Date();
});

afterAll(async () => {
    await closeConnection();
});

describe('POST trip generation', () => {
    test('success, 1 vehicle, 1 driver', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)
        expect(res1.body.trips[0]).toHaveProperty('_id');
        expect(res1.body.trips[0]).toHaveProperty('vehicleId');
        expect(res1.body.trips[0]).toHaveProperty('driverId');
        expect(res1.body.trips[0]).toHaveProperty('routeId');
        expect(Array.isArray(res1.body.trips[0].stopTimes)).toBe(true);
        expect(res1.body.trips[0].stopTimes.length).toBeGreaterThan(0);
    })

    test('no trips, no vehicles', async () => {
        const res = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res.status).toBe(200);
        expect(res.body.trips).toStrictEqual([]);
    })

    test('no trips generated on same day', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);


        await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips).toStrictEqual([]);
    })

    test('no trips generated on a week ahead', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const eightDaysAhead = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: eightDaysAhead})

        expect(res1.status).toBe(200);
        expect(res1.body.trips).toStrictEqual([]);
    })

    test('route id not found', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: new ObjectId().toString(), date: date})

        expect(res1.status).toBe(400);
        expect(res1.body.error).toBe('route not found');
    })

    test('invalid token', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer invalid`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(403);
        expect(res1.body.error).toBe('invalid token');
    })
})

describe('GET tripsList', () => {
    test('success,  empty array, no trips generated yet', async () => {
        const res1 = await request(app)
            .get('/trips/list')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({
                routeId: rid.toString(),
                departId: sid0.toString(),
                arriveId: sid1.toString(),
                date: date,
            });

        expect(res1.status).toBe(200);
        expect(res1.body.departName).toBe(stop0.name)
        expect(res1.body.arriveName).toBe(stop1.name)
        expect(res1.body.trips).toStrictEqual([])
    })

    test('success, trips generated', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const res2 = await request(app)
            .get('/trips/list')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({
                routeId: rid.toString(),
                departId: sid0.toString(),
                arriveId: sid1.toString(),
                date: date,
            });

        expect(res2.status).toBe(200);
        // check that it gets all trips generated for the day
        expect(res2.body.trips.length).toBe(res1.body.trips.length)

        // check return values
        expect(res2.body.departName).toBe(stop0.name)
        expect(res2.body.arriveName).toBe(stop1.name)
        expect(res2.body.trips[0]).toHaveProperty('tripId');
        expect(res2.body.trips[0]).toHaveProperty('departId');
        expect(res2.body.trips[0]).toHaveProperty('arriveId');
        expect(res2.body.trips[0]).toHaveProperty('departureTime');
        expect(res2.body.trips[0]).toHaveProperty('arrivalTime');
        expect(res2.body.trips[0]).toHaveProperty('price');
        expect(res2.body.trips[0].curCapacity).toBe(0);
        expect(res2.body.trips[0].maxCapacity).toBe(vehicle1.maxCapacity);
        expect(res2.body.trips[0].curLuggageCapacity).toBe(0);
        expect(res2.body.trips[0].maxLuggageCapacity).toBe(vehicle1.maxLuggageCapacity);
        expect(res2.body.trips[0]).toHaveProperty('luggagePrice');
        expect(res2.body.trips[0].hasAssist).toBe(vehicle1.hasAssist);
    })

    test('different day than generated', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const tmr = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)

        const res2 = await request(app)
            .get('/trips/list')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({
                routeId: rid.toString(),
                departId: sid0.toString(),
                arriveId: sid1.toString(),
                date: tmr,
            });

        expect(res2.status).toBe(200);
        expect(res2.body.departName).toBe(stop0.name)
        expect(res2.body.arriveName).toBe(stop1.name)
        expect(res2.body.trips).toStrictEqual([])
    })

    test('route id not found', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const res2 = await request(app)
            .get('/trips/list')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({
                routeId: new ObjectId().toString(),
                departId: sid0.toString(),
                arriveId: sid1.toString(),
                date: date,
            });

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("route not found")
    })

    test('departure id not found', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const res2 = await request(app)
            .get('/trips/list')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({
                routeId: rid.toString(),
                departId: new ObjectId().toString(),
                arriveId: sid1.toString(),
                date: date,
            });

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("stop not found")
    })

    test('arrival id not found', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const res2 = await request(app)
            .get('/trips/list')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({
                routeId: rid.toString(),
                departId: sid0.toString(),
                arriveId: new ObjectId().toString(),
                date: date,
            });

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("stop not found")
    })

    test('invalid token', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const res2 = await request(app)
            .get('/trips/list')
            .set('Authorization', `Bearer invalid`)
            .query({
                routeId: rid.toString(),
                departId: sid0.toString(),
                arriveId: sid1.toString(),
                date: date,
            });

        expect(res2.status).toBe(403);
        expect(res2.body.error).toBe("invalid token")
    })
})

describe('GET getTrip', () => {
    test('success', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const res2 = await request(app)
            .get('/trips/get')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({
                departId: sid0.toString(),
                arriveId: sid1.toString(),
                tripId: res1.body.trips[0]._id
            });

        expect(res2.status).toBe(200);
        // check return values
        expect(res2.body.departName).toBe(stop0.name)
        expect(res2.body.arriveName).toBe(stop1.name)
        expect(res2.body.trip).toHaveProperty('tripId');
        expect(res2.body.trip).toHaveProperty('departId');
        expect(res2.body.trip).toHaveProperty('arriveId');
        expect(res2.body.trip).toHaveProperty('departureTime');
        expect(res2.body.trip).toHaveProperty('arrivalTime');
        expect(res2.body.trip).toHaveProperty('price');
        expect(res2.body.trip.curCapacity).toBe(0);
        expect(res2.body.trip.maxCapacity).toBe(vehicle1.maxCapacity);
        expect(res2.body.trip.curLuggageCapacity).toBe(0);
        expect(res2.body.trip.maxLuggageCapacity).toBe(vehicle1.maxLuggageCapacity);
        expect(res2.body.trip).toHaveProperty('luggagePrice');
        expect(res2.body.trip.hasAssist).toBe(vehicle1.hasAssist);
    })

    test('departure id not found', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const res2 = await request(app)
            .get('/trips/get')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({
                departId: new ObjectId().toString(),
                arriveId: sid1.toString(),
                tripId: res1.body.trips[0]._id
            });

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("stop not found")
    })

    test('arrive id not found', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const res2 = await request(app)
            .get('/trips/get')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({
                departId: sid0.toString(),
                arriveId: new ObjectId().toString(),
                tripId: res1.body.trips[0]._id
            });

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("stop not found")
    })

    test('trip id not found', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const res2 = await request(app)
            .get('/trips/get')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({
                departId: sid0.toString(),
                arriveId: sid1.toString(),
                tripId: new ObjectId().toString()
            });

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("trip not found")
    })

    test('invalid token', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);

        const res1 = await request(app)
            .post('/trips/generate')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({routeId: rid, date: date})

        expect(res1.status).toBe(200);
        expect(res1.body.trips.length).toBeGreaterThan(0)

        const res2 = await request(app)
            .get('/trips/get')
            .set('Authorization', `Bearer invalid`)
            .query({
                departId: sid0.toString(),
                arriveId: sid1.toString(),
                tripId: res1.body.trips[0]._id
            });

        expect(res2.status).toBe(403);
        expect(res2.body.error).toBe("invalid token")
    })
})
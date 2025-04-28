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
let managerId: ObjectId;
let managerToken: string;

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
    await collections.bookings?.deleteMany({});

    await collections.stops?.insertMany([stop0, stop1, stop2]);
    await collections.routes?.insertOne(route);

    // make manager and user
    const managerRes = await request(app)
        .post('/auth/register')
        .send(manager)

    managerToken = managerRes.body.token;
    managerId = managerRes.body.userId

    date = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    
});

afterAll(async () => {
    await closeConnection();
});

describe('POST create booking', () => {
    test('success, upcoming trip', async () => {
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
        expect(res1.body.trips.length).toBeGreaterThan(0);
        
        const trip = res1.body.trips[0];

        const res2 = await request(app)
            .post('/bookings/create')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                tripId: trip._id,
                originId: sid0,
                destId: sid1,
                numTickets: 4,
                numLuggage: 4,
            })

        expect(res2.status).toBe(200);

        const res3 = await request(app)
            .get('/bookings/upcoming')
            .set('Authorization', `Bearer ${managerToken}`)
        
        expect(res3.statusCode).toBe(200);
        expect(res3.body.bookings.length).toBe(1);

        const booking = res3.body.bookings[0]
        expect(booking.userId).toBe(managerId);
        expect(booking.tripId).toBe(trip._id);
        expect(booking.originName).toBe(stop0.name);
        expect(booking.destName).toBe(stop1.name);
        expect(booking).toHaveProperty('departureTime');
    })

    test('too many passengers', async () => {
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
        expect(res1.body.trips.length).toBeGreaterThan(0);

        const trip = res1.body.trips[0];

        const res2 = await request(app)
            .post('/bookings/create')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                tripId: trip._id,
                originId: sid0,
                destId: sid1,
                numTickets: vehicle1.maxCapacity + 1,
                numLuggage: 4,
            })

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("booking exceeds passenger capacity");
    })

    test('too many luggages', async () => {
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
        expect(res1.body.trips.length).toBeGreaterThan(0);

        const trip = res1.body.trips[0];

        const res2 = await request(app)
            .post('/bookings/create')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                tripId: trip._id,
                originId: sid0,
                destId: sid1,
                numTickets: 4,
                numLuggage: vehicle1.maxLuggageCapacity + 1,
            })

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("booking exceeds luggage capacity");
    })

    test('trip id not found ', async () => {
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
        expect(res1.body.trips.length).toBeGreaterThan(0);

        const res2 = await request(app)
            .post('/bookings/create')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                tripId: new ObjectId(),
                originId: sid0,
                destId: sid1,
                numTickets: 4,
                numLuggage: 4,
            })

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("trip not found");
    })

    test('origin id not found ', async () => {
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
        expect(res1.body.trips.length).toBeGreaterThan(0);

        const trip = res1.body.trips[0];

        const res2 = await request(app)
            .post('/bookings/create')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                tripId: trip._id,
                originId: new ObjectId(),
                destId: sid1,
                numTickets: 4,
                numLuggage: 4,
            })

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("stop not found");
    })

    test('dest id not found ', async () => {
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
        expect(res1.body.trips.length).toBeGreaterThan(0);

        const trip = res1.body.trips[0];

        const res2 = await request(app)
            .post('/bookings/create')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                tripId: trip._id,
                originId: sid0,
                destId: new ObjectId(),
                numTickets: 4,
                numLuggage: 4,
            })

        expect(res2.status).toBe(400);
        expect(res2.body.error).toBe("stop not found");
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
        expect(res1.body.trips.length).toBeGreaterThan(0);

        const trip = res1.body.trips[0];

        const res2 = await request(app)
            .post('/bookings/create')
            .set('Authorization', `Bearer invalid`)
            .send({
                tripId: trip._id,
                originId: sid0,
                destId: sid1,
                numTickets: 4,
                numLuggage: 4,
            })

        expect(res2.status).toBe(403);
        expect(res2.body.error).toBe("invalid token");
    })
})
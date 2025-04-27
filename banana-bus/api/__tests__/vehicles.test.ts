import { collections, connectToDatabase, closeConnection } from '../mongoUtil';
import { ObjectId } from 'mongodb';

const request = require("supertest");
const app = require("../index");

// set up data for tests
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

const vehicle2 = {
    maxCapacity: 10,
    maxLuggageCapacity: 10,
    hasAssist: true,
    numberPlate: "abcdef",
    model: "ford" 
}

beforeEach(async () => {
    // Clear users before each test
    await connectToDatabase();
    await collections.users?.deleteMany({});
    await collections.vehicles?.deleteMany({});

    // make manager and user
    managerToken = await request(app)
        .post('/auth/register')
        .send(manager)
        .then((res: any) => res.body.token);

    userToken = await request(app)
        .post('/auth/register')
        .send(user)
        .then((res: any) => res.body.token);
});

afterAll(async () => {
    await closeConnection();
});

describe('POST addVehicle', () => {
    test('successful add, user is manager', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res.status).toBe(200);
        expect(ObjectId.isValid(res.body._id)).toBe(true);
    })

    test('add same vehicle numberplate', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const res2 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)
        
        expect(res2.status).toBe(409);
        expect(res2.body.error).toBe('Vehicle with number plate already in database');
    })
    
    test('invalid token', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer Invalid`)
            .send(vehicle1)

        expect(res.status).toBe(403);
        expect(res.body.error).toBe('invalid token');
    })

    test('user is not a manager', async () => {
        const res = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${userToken}`)
            .send(vehicle1)

        expect(res.status).toBe(403);
        expect(res.body.error).toBe('user is not a manager');
    })  
})

describe('GET allVehicles', () => {
    test('no vehicle', async () => {
        const res1 = await request(app)
            .get('/manager/allVehicles')
            .set('Authorization', `Bearer ${managerToken}`)

        expect(res1.status).toBe(200);
        expect(res1.body.vehicles).toEqual([]);
    })

    test('one vehicle', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const res2 = await request(app)
            .get('/manager/allVehicles')
            .set('Authorization', `Bearer ${managerToken}`)

        expect(res2.status).toBe(200);
        expect(res2.body.vehicles).toEqual([res1.body]);
    })

    test('two vehicles', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const res2 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle2)

        expect(res2.status).toBe(200);
        expect(ObjectId.isValid(res2.body._id)).toBe(true);

        const res3 = await request(app)
            .get('/manager/allVehicles')
            .set('Authorization', `Bearer ${managerToken}`)

        expect(res3.status).toBe(200);
        expect(res3.body.vehicles).toEqual([res1.body, res2.body]);
    })
    
    test('invalid token', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const res2 = await request(app)
            .get('/manager/allVehicles')
            .set('Authorization', `Bearer invalid`)

        expect(res2.status).toBe(403);
        expect(res2.body.error).toBe('invalid token');
    })

    test('user is not a manager', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

            expect(res1.status).toBe(200);
            expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const res2 = await request(app)
            .get('/manager/allVehicles')
            .set('Authorization', `Bearer ${userToken}`)

        expect(res2.status).toBe(403);
        expect(res2.body.error).toBe('user is not a manager');
    }) 
})

describe('PUT editVehicle', () => {
    test('successful edit, user is manager', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const edit = {
            vehicleId: res1.body._id,
            maxCapacity: 100,
            maxLuggageCapacity: 100,
            hasAssist: false,
            numberPlate: "abc1235",
            model: "toyota1"
        }

        const res2 = await request(app)
            .put('/manager/editVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(edit)

        expect(res2.status).toBe(200);
        
        const res3 = await request(app)
            .get('/manager/allVehicles')
            .set('Authorization', `Bearer ${managerToken}`)
        
        expect(res3.status).toBe(200);
        expect(res3.body.vehicles).toEqual([res2.body]);
    })

    test('vehicle not found', async () => {

        const res1 = await request(app)
            .put('/manager/editVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(404);
        expect(res1.body.error).toBe('Vehicle not found');
    })

    test('numberplate already exists', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const res2 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle2)

        expect(res2.status).toBe(200);
        expect(ObjectId.isValid(res2.body._id)).toBe(true);

        const edit = {
            vehicleId: res2.body._id,
            maxCapacity: res2.body.maxCapacity,
            maxLuggageCapacity: res2.body.maxLuggageCapacity,
            hasAssist: res2.body.hasAssist,
            numberPlate: res1.body.numberPlate,
            model: res2.body.hasAssist
        }

        const res3 = await request(app)
            .put('/manager/editVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(edit)

        expect(res3.status).toBe(409);
        expect(res3.body.error).toBe('Another vehicle with that number plate already exists');
    })

    test('invalid token', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const edit = {
            vehicleId: res1.body._id,
            maxCapacity: 100,
            maxLuggageCapacity: 100,
            hasAssist: false,
            numberPlate: "abc1235",
            model: "toyota1"
        }

        const res2 = await request(app)
            .put('/manager/editVehicle')
            .set('Authorization', `Bearer invalid`)
            .send(edit)

        expect(res2.status).toBe(403);
        expect(res2.body.error).toBe('invalid token');
    })

    test('user is not a manager', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const edit = {
            vehicleId: res1.body._id,
            maxCapacity: 100,
            maxLuggageCapacity: 100,
            hasAssist: false,
            numberPlate: "abc1235",
            model: "toyota1"
        }

        const res2 = await request(app)
            .put('/manager/editVehicle')
            .set('Authorization', `Bearer ${userToken}`)
            .send(edit)

        expect(res2.status).toBe(403);
        expect(res2.body.error).toBe('user is not a manager');
    })
})

describe('DELETE deleteVehicle', () => {
    test('successful delete, user is manager', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const res2 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle2)

        expect(res2.status).toBe(200);
        expect(ObjectId.isValid(res2.body._id)).toBe(true);

        const res3 = await request(app)
            .delete('/manager/deleteVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({vehicleId: res1.body._id})

        expect(res3.status).toBe(200);
        
        const res4 = await request(app)
            .get('/manager/allVehicles')
            .set('Authorization', `Bearer ${managerToken}`)
        
        expect(res4.status).toBe(200);
        expect(res4.body.vehicles).toEqual([res2.body]);
    })

    test('vehicle not found', async () => {
        const res1 = await request(app)
            .delete('/manager/deleteVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({vehicleId: new ObjectId()})

        expect(res1.status).toBe(404);
        expect(res1.body.error).toBe('Vehicle not found');
    })

    test('invalid token', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const res2 = await request(app)
            .delete('/manager/deleteVehicle')
            .set('Authorization', `Bearer invalid`)
            .send({vehicleId: new ObjectId()})

        expect(res2.status).toBe(403);
        expect(res2.body.error).toBe('invalid token');
    })

    test('invalid token', async () => {
        const res1 = await request(app)
            .post('/manager/addVehicle')
            .set('Authorization', `Bearer ${managerToken}`)
            .send(vehicle1)

        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body._id)).toBe(true);

        const res2 = await request(app)
            .delete('/manager/deleteVehicle')
            .set('Authorization', `Bearer ${userToken}`)
            .send({vehicleId: new ObjectId()})

        expect(res2.status).toBe(403);
        expect(res2.body.error).toBe('user is not a manager');
    })
})
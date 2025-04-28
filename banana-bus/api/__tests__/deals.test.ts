import { ObjectId } from "mongodb";
import { collections, connectToDatabase, closeConnection } from '../mongoUtil';


const request = require("supertest");
const app = require("../index");

beforeEach(async () => {
  // Clear users before each test
  await connectToDatabase();
  await collections.users?.deleteMany({});
});

afterAll(async () => {
  await closeConnection();
});

describe('GET deals', () => {
    test('correct deals format', async () => {
        const res1 = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
       
        expect(res1.status).toBe(200);
        expect(ObjectId.isValid(res1.body.userId)).toBe(true);

        const token = res1.body.token
        const res2 = await request(app)
            .get('/deals/get')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res2.status).toBe(200);
        expect(Array.isArray(res2.body)).toBe(true);
        
        if (res2.body.length > 0) {
            expect(res2.body[0]).toHaveProperty('title');
            expect(res2.body[0]).toHaveProperty('description');
            expect(res2.body[0]).toHaveProperty('location');
            expect(res2.body[0]).toHaveProperty('img');
            expect(res2.body[0]).toHaveProperty('validFrom');
            expect(res2.body[0]).toHaveProperty('validTo');
        }
  });
})
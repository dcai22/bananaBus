import express, { json, Request, Response } from 'express';
import { ObjectId } from 'mongodb';

const request = require("supertest");
const app = require("../index");

beforeEach(async () => {
    // Clear users before each test
    await request(app)
        .del('/clearUsers')
});

afterAll(async () => {
    await request(app)
        .post('/closeConnection')
});

describe('Register', () => {
    test('successful register', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                email: 'email@email',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        expect(response.status).toBe(200);
        expect(ObjectId.isValid(response.body.userId)).toBe(true);
        expect(response.body.token).toBeTruthy();
    })

    test('email already in use', async () => {
        await request(app)
            .post('/register')
            .send({
                email: 'email@email',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const response = await request(app)
            .post('/register')
            .send({
                email: 'email@email',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        expect(response.status).toBe(400);
    })
})

describe('Login', () => {
    test('successful login', async () => {
        await request(app)
            .post('/register')
            .send({
                email: 'email@email',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const response = await request(app)
            .post('/login')
            .send({
                email: 'email@email',
                password: 'password',
            });
        expect(response.status).toBe(200);
        expect(ObjectId.isValid(response.body.userId)).toBe(true);
        expect(response.body.token).toBeTruthy();
    })

    test('incorrect password', async () => {
        await request(app)
            .post('/register')
            .send({
                email: 'email@email',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const response = await request(app)
            .post('/login')
            .send({
                email: 'email@email',
                password: 'wrong',
            });
        expect(response.status).toBe(400);
    })

    test('email not found', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: 'email',
                password: 'password',
            });
        expect(response.status).toBe(400);
    })
})

describe('Logout', () => {
    test('successful logout', async () => {
        const response1 = await request(app)
            .post('/register')
            .send({
                email: 'email@email',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { userId, token } = response1.body;
        const response2 = await request(app)
            .post('/logout')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId,
            });
        expect(response2.status).toBe(200);
    });
});

describe('Delete', () => {
    test('successful delete', async () => {
        const response1 = await request(app)
            .post('/register')
            .send({
                email: 'email@email',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { userId, token } = response1.body;
        const response2 = await request(app)
            .delete('/deleteAccount')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId
            });
        expect(response2.status).toBe(200);

        const response3 = await request(app)
            .post('/login')
            .send({
                email: 'email@email',
                password: 'password',
            });
        expect(response3.status).toBe(400);
    })

    test('user not found', async () => {
        const response = await request(app)
            .delete('/deleteAccount')
            .set('Authorization', `Bearer tokenthatdoesnotexist`)
            .send({
                userId: 0,
            });
        expect(response.status).toBe(400);
    })
})
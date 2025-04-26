import express, { json, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections, connectToDatabase, closeConnection } from '../mongoUtil';

const request = require("supertest");
const app = require("../index");

// authPasswordResetEmail, authPasswordVerifyCode, authPasswordReset, authGoogleLogin are untested
// because they require external services

beforeEach(async () => {
    // Clear users before each test
    await connectToDatabase();
    await collections.users?.deleteMany({});
});

afterAll(async () => {
    await closeConnection();
});

describe('Register', () => {
    test('successful register', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                email: 'email@email.com',
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
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const response = await request(app)
            .post('/register')
            .send({
                email: 'email@email.com',
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
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const response = await request(app)
            .post('/login')
            .send({
                email: 'email@email.com',
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
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const response = await request(app)
            .post('/login')
            .send({
                email: 'email@email.com',
                password: 'wrong',
            });
        expect(response.status).toBe(400);
    })

    test('email not found', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: 'email@gmail.com',
                password: 'password',
            });
        expect(response.status).toBe(400);
    })

    test('autologin', async () => {
        const response1 = await request(app)
            .post('/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const { userId, token } = response1.body;
        const response2 = await request(app)
            .post('/autologin')
            .set('Authorization', `Bearer ${token}`);
        expect(response2.status).toBe(200);
        expect(response2.body.userId).toBe(userId);
        expect(response2.body.token).toBeTruthy();
    });
            
})

describe('Logout', () => {
    test('successful logout', async () => {
        const response1 = await request(app)
            .post('/register')
            .send({
                email: 'email@email.com',
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
                email: 'email@email.com',
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
                email: 'email@email.com',
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
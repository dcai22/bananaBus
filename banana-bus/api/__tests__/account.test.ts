import express, { json, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
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

describe('Get User Details', () => {
    test('successful get user details', async () => {
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const token = registerResponse.body.token;
        const response = await request(app)
            .get('/account/getDetails')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.firstName).toBe('first');
        expect(response.body.lastName).toBe('last');
        expect(response.body.email).toBe('email@email.com');
        expect(response.body.isManager).toBe(true);
        expect(response.body.isDriver).toBe(true);
        expect(response.body.isExternal).toBe(false);
    });

    test('invalid token', async () => {
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
            const response = await request(app)
            .get('/account/getDetails')
            .set('Authorization', `Bearer invalidtoken`);
        expect(response.status).toBe(403);
    });
})

describe('Update User Details', () => {
    test('invalid token', async () => {
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const response = await request(app)
            .put('/account/updateDetails')
            .set('Authorization', `Bearer invalidtoken`)
            .send({
                firstName: 'newFirst',
                lastName: 'newLast',
                email: 'newEmail@email.com',
            });
        expect(response.status).toBe(403);
    })

    test('update email to someone else\'s email', async () => {
        const registerResponse1 = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const registerResponse2 = await request(app)
            .post('/auth/register')
            .send({
                email: 'otheremail@email.com',
                password: 'password',
                firstName: 'someone',
                lastName: 'else',
            });
        const token = registerResponse1.body.token;
        const response = await request(app)
            .put('/account/updateDetails')
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'newFirst',
                lastName: 'newLast',
                email: 'otheremail@email.com',
            });
        expect(response.status).toBe(400);
    });

    test('successful update', async () => {
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const token = registerResponse.body.token;
        const response = await request(app)
            .put('/account/updateDetails')
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'newFirst',
                lastName: 'newLast',
                email: 'newemail@email.com',
            });
        expect(response.status).toBe(200);
        const getResponse = await request(app)
            .get('/account/getDetails')
            .set('Authorization', `Bearer ${token}`);
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.firstName).toBe('newFirst');
        expect(getResponse.body.lastName).toBe('newLast');
        expect(getResponse.body.email).toBe('newemail@email.com');
    });
})

describe('Update User Password', () => {
    test('incorrect old password', async () => {
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const token = registerResponse.body.token;
        const response = await request(app)
            .put('/account/updatePassword')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPassword: 'wrongpassword',
                newPassword: 'newpassword',
            });
        expect(response.status).toBe(400);
    });


    test('successful update', async () => {
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const token = registerResponse.body.token;
        const response = await request(app)
            .put('/account/updatePassword')
            .set('Authorization', `Bearer ${token}`)
            .send({
                oldPassword: 'password',
                newPassword: 'newpassword',
            });
        expect(response.status).toBe(200);
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'email@email.com',
                password: 'newpassword',
            });
        expect(loginResponse.status).toBe(200);
    })
})

describe('Delete User Account', () => {
    test('invalid userId', async () => {
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const token = registerResponse.body.token;
        const response = await request(app)
            .delete('/account/delete')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId: new ObjectId(),
            });
        expect(response.status).toBe(400);
    })

    test('successful delete', async () => {
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                email: 'email@email.com',
                password: 'password',
                firstName: 'first',
                lastName: 'last',
            });
        const token = registerResponse.body.token;
        const userId = registerResponse.body.userId;
        const response = await request(app)
            .delete('/account/delete')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId: userId,
            });
        expect(response.status).toBe(200);
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({
                email: 'email@email.com',
                password: 'password',
            });
        expect(loginResponse.status).toBe(400);
    });
})
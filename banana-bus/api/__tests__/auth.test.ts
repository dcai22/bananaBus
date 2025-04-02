import express, { json, Request, Response } from 'express';
import { setData } from "../dataStore";
import { authRegister, authLogin } from "../auth";

const request = require("supertest");
const app = require("../index");

beforeEach(() => {
    setData({ users: [], trips: [], bookings: [], routes: [], stops: [] });
})

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
        expect(response.body.userId).toBe(0);
        expect(response.body.token).toBeTruthy;
    })

    test('email already in use', async () => {
        authRegister('email@email', 'password', 'first', 'last');
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
        authRegister('email@email', 'password', 'first', 'last');
        const response = await request(app)
            .post('/login')
            .send({
                email: 'email@email',
                password: 'password',
            });
        expect(response.status).toBe(200);
        expect(response.body.userId).toBe(0);
        expect(response.body.token).toBeTruthy;
    })

    test('incorrect password', async () => {
        authRegister('email@email', 'password', 'first', 'last');
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
        const { userId, token } = authRegister('email@email', 'password', 'first', 'last');
        const response = await request(app)
            .post('/logout')
            .send({
                userId,
                token,
            });
        expect(response.status).toBe(200);
    })
})
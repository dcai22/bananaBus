import express, { json, Request, Response } from 'express';
import cors from 'cors';

import { authLogin, authRegister, authAutoLogin, authLogout } from './auth';
import { pastBookings } from './pastBookings';

const app = express();

app.use(json());
app.use(cors());

module.exports = app;

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello world');
})

app.post('/login', (req: Request, res: Response) => {
    const email = req.body.email as string;
    const password = req.body.password as string;
    res.json(authLogin(email, password));
    return;
})

app.post('/register', (req: Request, res: Response) => {
    const email = req.body.email as string;
    const password = req.body.password as string;
    res.json(authRegister(email, password));
    return;
})

app.post('/autologin', (req: Request, res: Response) => {
    const token = req.body.token as string;
    res.json(authAutoLogin(token));
    return;
})

app.post('/logout', (req: Request, res: Response) => {
    const userId = req.body.userId as number;
    const token = req.body.token as string;
    res.json(authLogout(userId, token));
    return;
})

app.get('/pastBookings', (req: Request, res: Response) => {
    const userId = req.body.userId as number;
    const numBookings = req.body.numBookings as number;
    res.json(pastBookings(userId, numBookings));
    return;
})

import express, { json, Request, Response } from 'express';
import cors from 'cors';

import { authLogin, authRegister, authAutoLogin, authLogout } from './auth';
import { searchBookings } from './searchBookings';

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
    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;
    res.json(authRegister(email, password, firstName, lastName));
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
    res.json(searchBookings(userId, 'past', numBookings));
    return;
})

app.get('/upcomingBookings', (req: Request, res: Response) => {
    const userId = req.body.userId as number;
    const numBookings = req.body.numBookings as number;
    res.json(searchBookings(userId, 'upcoming', numBookings));
    return;
})

import express, { json, Request, Response } from 'express';
import cors from 'cors';
import errorHandler from "middleware-http-errors"

import { authLogin, authRegister, authAutoLogin, authLogout, authPasswordResetEmail, authPasswordReset, authPasswordVerifyCode } from './auth';
import { tripsList } from './tripsList';
import { searchBookings } from './searchBookings';
import { getSavedRoutes, saveRoute, unsaveRoute } from './savedRoutes';
import { deleteAccount, getAccountName, getUserDetails, updateUserDetails, updateUserPassword } from './account';
import { getDeals } from './getDeals';
import { RouteSection } from './interface';
import { ObjectId } from 'mongodb';
import { addManager, removeManager } from './manager';
import { collections } from './mongoUtil';

const app = express();

app.use(json());
app.use(cors());

module.exports = app;

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello world');
})

app.post('/login', async (req: Request, res: Response, next) => {
    try {
        const email = req.body.email as string;
        const password = req.body.password as string;
        res.json(await authLogin(email, password));
    } catch(error) {
        next(error);
    }
    return;
})

app.post('/register', async (req: Request, res: Response, next) => {
    try {
        const email = req.body.email as string;
        const password = req.body.password as string;
        const firstName = req.body.firstName as string;
        const lastName = req.body.lastName as string;
        res.json(await authRegister(email, password, firstName, lastName));
    } catch(error) {
        next(error);
    }
    return;
})

app.post('/resetPasswordEmail', async (req: Request, res: Response, next) => {
    try {
        const email = req.body.email as string;
        res.json(await authPasswordResetEmail(email));
    } catch (error) {
        next(error);
    }
    return;
})

app.post('/resetPasswordVerifyCode', async (req: Request, res: Response, next) => {
    try {
        const token = req.query.token as string;
        const code = req.body.code as string;
        res.json(await authPasswordVerifyCode(token, code));
    } catch (error) {
        next(error);
    }
    return;
})

app.post('/resetPassword', async (req: Request, res: Response, next) => {
    try {
        const token = req.query.token as string;
        const newPassword = req.body.newPassword as string;
        res.json(await authPasswordReset(token, newPassword));
    } catch (error) {
        next(error);
    }
    return;
})

app.post('/autologin', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        res.json(await authAutoLogin(token));
    } catch (error) {
        next(error);
    }
    return;
})

app.post('/logout', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const userId = req.body.userId as ObjectId;
        res.json(await authLogout(userId, token));
    } catch (error) {
        next(error);
    }
    return;
})

app.delete('/deleteAccount', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const userId = req.body.userId as ObjectId;
        res.json(await deleteAccount(userId, token));
    } catch (error) {
        next(error);
    }
    return;
})

app.get('/pastBookings', async (req: Request, res: Response, next) => {
    try {
        const userId = req.body.userId as ObjectId;
        const numBookings = req.body.numBookings as number;
        const bookings = await searchBookings(userId, 'past', numBookings);
        res.json(bookings);
    } catch (err) {
        next(err);
    }

    return;
})

app.get('/upcomingBookings', async (req: Request, res: Response, next) => {
    try {
        const userId = req.body.userId as ObjectId;
        const numBookings = req.body.numBookings as number;
        const bookings = await searchBookings(userId, 'upcoming', numBookings);
        res.json(bookings);
    } catch (err) {
        next(err);
    }
    return;
})

app.get('/tripsList', async (req: Request, res: Response, next) => {
    try {
        const routeId = new ObjectId(req.query.routeId as string);
        const departId = new ObjectId(req.query.departId as string); 
        const arriveId = new ObjectId(req.query.arriveId as string);
        const date = req.query.date as string;
    
        res.json(await tripsList(routeId, departId, arriveId, date));
    } catch (err) {
        next(err);
    }
})

app.get('/getSavedRoutes', async (req: Request, res: Response, next) => {
    const userId = req.body.userId as ObjectId;
    try {
        res.json(await getSavedRoutes(userId));
    } catch (err) {
        next(err);
    }
})

app.post('/saveRoute', async (req: Request, res: Response, next) => {
    const userId = req.body.userId as ObjectId;
    const routeId = req.body.routeId as ObjectId;
    const originId = req.body.originId as ObjectId;
    const destId = req.body.destId as ObjectId;
    try {
        res.json(await saveRoute(userId, routeId, originId, destId));
    } catch (err) {
        next(err);
    }
})

app.delete('/unsaveRoute', async (req: Request, res: Response, next) => {
    const userId = req.body.userId as ObjectId;
    const routeSection = req.body.routeSection as RouteSection;
    try {
        res.json(await unsaveRoute(userId, routeSection));
    } catch (err) {
        next(err);
    }
})

app.get('/getAccountName', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        res.json(await getAccountName(token));
    } catch (error) {
        next(error);
    }
    return;
})

app.get('/getAccountDetails', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        res.json(await getUserDetails(token));
    } catch (error) {
        next(error);
    }
})

app.post('/updateAccountDetails', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const firstName = req.body.firstName as string;
        const lastName = req.body.lastName as string;
        const email = req.body.email as string;
        res.json(await updateUserDetails(token, firstName, lastName, email));
    } catch (error) {
        next(error);
    }
    return;
})

app.post('/updateAccountPassword', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const oldPassword = req.body.oldPassword as string;
        const newPassword = req.body.newPassword as string;
        res.json(await updateUserPassword(token, oldPassword, newPassword));
    } catch (error) {
        next(error);
    }
    return;
})

app.get('/getDeals', async (req: Request, res: Response, next) => {
    try {
        const deals = await getDeals()
        res.json(deals);
    } catch (err) {
        next(err);
    }
})

app.post('/createBooking', async (req: Request, res: Response, next) => {
    const userId = req.body.userId as ObjectId;
    const tripId = req.body.tripId as ObjectId;
    const originId = req.body.originId as ObjectId;
    const destId = req.body.destId as ObjectId;
    const numTickets = req.body.numTickets as number;

    try {
        const dbRes = await collections.bookings?.insertOne({
            userId,
            tripId,
            originId,
            destId,
            numTickets,
        });
        res.json({ insertedId: dbRes?.insertedId });
    } catch (err) {
        next(err);
    }
})

app.post('/manager/createRoute', async (req: Request, res: Response, next) => {
    const stops = req.body.stops as ObjectId[];

    try {
        const dbRes = await collections.routes?.insertOne({
            stops,
            trips: [],
        });
        res.json({ insertedId: dbRes?.insertedId });
    } catch (err) {
        next(err);
    }
})

app.delete('/manager/deleteRoute', async (req: Request, res: Response, next) => {
    const routeId = req.body.routeId as ObjectId;

    try {
        await collections.routes?.deleteOne({ routeId: routeId });
        res.json({});
    } catch (err) {
        next(err);
    }
})

app.get('/manager/allStops', async (req: Request, res: Response, next) => {
    try {
        const allStops = collections.stops?.find().toArray();
        res.json({ stops: allStops });
    } catch (err) {
        next(err);
    }
})

app.put('/manager/add', async (req: Request, res: Response, next) => {
    const userId = req.body.userId as ObjectId;

    try {
        res.json(await addManager(userId));
    } catch (err) {
        next(err);
    }
})

app.put('/manager/remove', async (req: Request, res: Response, next) => {
    const userId = req.body.userId as ObjectId;

    try {
        res.json(await removeManager(userId));
    } catch (err) {
        next(err);
    }
})

app.get('/manager/allVehicles', async (req: Request, res: Response, next) => {
    try {
        const allVehicles = await collections.vehicles?.find().toArray();
        res.json({ vehicles: allVehicles });
    } catch (err) {
        next(err);
    }
})

app.use(errorHandler())

import express, { json, Request, Response } from 'express';
import cors from 'cors';
import errorHandler from "middleware-http-errors"

import { authLogin, authRegister, authAutoLogin, authLogout, authPasswordResetEmail, authPasswordReset, authPasswordVerifyCode } from './auth';
import { getTrip, tripsList } from './tripsList';
import { searchBookings } from './searchBookings';
import { getSavedRoutes, saveRoute, unsaveRoute } from './savedRoutes';
import { deleteAccount,
            getAccountName, 
            getUserDetails,
            updateUserDetails,
            updateUserPassword,
            addCard,
            editCard,
            deleteCard,
            makeDefaultCard,
            getUserCards } from './account';
import { getDeals } from './getDeals';
import { Route, RouteSection } from './interface';
import { ObjectId } from 'mongodb';
import { addManager, removeManager } from './manager';
import { collections, connectToDatabase } from './mongoUtil';
import { findUserByToken } from './helper';

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
        const token = req.headers.authorization as string;
        const numBookings = req.body.numBookings as number;
        const bookings = await searchBookings(token, 'past', numBookings);
        res.json(bookings);
    } catch (err) {
        next(err);
    }

    return;
})

app.get('/upcomingBookings', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const numBookings = req.body.numBookings as number;
        const bookings = await searchBookings(token, 'upcoming', numBookings);
        res.json(bookings);
    } catch (err) {
        next(err);
    }
    return;
})

app.get('/tripsList', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const routeId = new ObjectId(req.query.routeId as string);
        const departId = new ObjectId(req.query.departId as string); 
        const arriveId = new ObjectId(req.query.arriveId as string);
        const date = req.query.date as string;
    
        res.json(await tripsList(token, routeId, departId, arriveId, date));
    } catch (err) {
        next(err);
    }
})

app.get('/getTrip', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const departId = new ObjectId(req.query.departId as string); 
        const arriveId = new ObjectId(req.query.arriveId as string);
        const tripId = new ObjectId(req.query.tripId as string);
        
        res.json(await getTrip(token, departId, arriveId, tripId));
    } catch (err) {
        next(err);
    }
})

app.get('/getSavedRoutes', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    try {
        res.json(await getSavedRoutes(token));
    } catch (err) {
        next(err);
    }
})

app.post('/saveRoute', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const routeId = req.body.routeId as ObjectId;
    const originId = req.body.originId as ObjectId;
    const destId = req.body.destId as ObjectId;
    try {
        res.json(await saveRoute(token, routeId, originId, destId));
    } catch (err) {
        next(err);
    }
})

app.delete('/unsaveRoute', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const routeSection = req.body.routeSection as RouteSection;
    try {
        res.json(await unsaveRoute(token, routeSection));
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
    const token = req.headers.authorization as string;
    const tripId = new ObjectId(req.body.tripId as string);
    const originId = new ObjectId(req.body.originId as string);
    const destId = new ObjectId(req.body.destId as string);
    const numTickets = req.body.numTickets as number;
    const numLuggage = req.body.numLuggage as number;

    await connectToDatabase();

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: 'invalid token' });
        return;
    }

    try {
        const dbRes = await collections.bookings?.insertOne({
            userId: user._id,
            tripId,
            originId,
            destId,
            numTickets,
            numLuggage,
        });
        await collections.trips?.updateOne(
            { _id: tripId },
            { $push: { bookings: dbRes?.insertedId } } as any
        )
        res.json({ insertedId: dbRes?.insertedId });
    } catch (err) {
        next(err);
    }
})

app.post('/manager/createRoute', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const stops = req.body.stops as ObjectId[];

    await connectToDatabase();
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: 'invalid token' });
        return;
    }
    if (!user.isManager) {
        res.status(403).json({ error: 'user is not a manager' });
        return;
    }

    try {
        const dbRes = await collections.routes?.insertOne({
            _id: new ObjectId(),
            stops,
            trips: [],
        });
        res.json({ insertedId: dbRes?.insertedId });
    } catch (err) {
        next(err);
    }
})

app.delete('/manager/deleteRoute', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const routeId = req.body.routeId as ObjectId;

    await connectToDatabase();
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: 'invalid token' });
        return;
    }
    if (!user.isManager) {
        res.status(403).json({ error: 'user is not a manager' });
        return;
    }

    try {
        await collections.routes?.deleteOne({ routeId: routeId });
        res.json({});
    } catch (err) {
        next(err);
    }
})

app.get('/manager/allStops', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    await connectToDatabase();
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: 'invalid token' });
        return;
    }
    if (!user.isManager) {
        res.status(403).json({ error: 'user is not a manager' });
        return;
    }
    try {
        const dbRes = await collections.stops?.find().toArray();
        res.json(dbRes);
    } catch (err) {
        next(err);
    }
})

app.put('/manager/add', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;

    try {
        res.json(await addManager(token));
    } catch (err) {
        next(err);
    }
})

app.put('/manager/remove', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;

    try {
        res.json(await removeManager(token));
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
    return;
})

app.get('/stops/reachableFrom', async (req: Request, res: Response, next) => {
    await connectToDatabase();

    const token = req.headers.authorization as string;
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: 'invalid token' });
        return;
    }

    const fromId = new ObjectId(req.query.fromId as string);

    try {
        const routes = await collections.routes?.find<Route>({
            stops: { $elemMatch: { $eq: fromId } }
        }).toArray();

        if (typeof routes === 'undefined') {
            res.status(400).json({ error: 'unable to search routes' })
            return;
        }

        const stops = new Set<ObjectId>();
        for (const route of routes) {
            const fromIndex = route.stops.indexOf(fromId);
            route.stops.forEach((e, i, a) => {
                if (i > fromIndex) {
                    stops.add(e);
                }
            })
        }

        res.json({ stops: Array.from(stops) });
    } catch (err) {
        next(err);
    }
})

app.post('/addCard', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const type = req.body.type as string;
        const cardNumber = req.body.cardNumber as string;
        const cvv = req.body.cvv as string;
        const expMonth = req.body.expMonth as number;
        const expYear = req.body.expYear as number;
        res.json(await addCard(token, type, cardNumber, cvv, expMonth, expYear));
    } catch(error) {
        next(error);
    }
    return;
})

app.put('/editCard', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const cardId = req.body.cardId as ObjectId;
        const type = req.body.type as string;
        const cardNumber = req.body.cardNumber as string;
        const cvv = req.body.cvv as string;
        const expMonth = req.body.expMonth as number;
        const expYear = req.body.expYear as number;
        res.json(await editCard(token, cardId, type, cardNumber, cvv, expMonth, expYear));
    } catch(error) {
        next(error);
    }
    return;
})


app.put('/makeDefaultCard', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const cardId = req.body.cardId as ObjectId;
    try{
        res.json(await makeDefaultCard(token, cardId));
    } catch ( err ) {
        next(err);
    }
    return;
})

app.delete('/deleteCard', async(req: Request, res: Response, next) => {
    try{
        const token = req.headers.authorization as string;
        const cardId = req.body.cardId as ObjectId;
        res.json(await deleteCard(token, cardId));
    } catch ( err ) {
        next(err);
    }
    return;
})

app.get('/getUserCards', async(req: Request, res: Response, next) => {
    try{
        const token = req.headers.authorization as string;
        res.json(await getUserCards(token));
    } catch ( err ) {
        next(err);
    }
    return;
})

app.get('/routes/fromSection', async (req: Request, res: Response, next) => {
    await connectToDatabase();

    const token = req.headers.authorization as string;
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: 'invalid token' });
        return;
    }

    const departId = new ObjectId(req.query.departId as string);
    const arriveId = new ObjectId(req.query.arriveId as string);

    try {
        const allRoutes = await collections.routes?.find<Route>({
            stops: {
                $and: [
                    { $elemMatch: { $eq: departId }},
                    { $elemMatch: { $eq: arriveId }},
                ],
            }
        }).toArray();

        if (typeof allRoutes === 'undefined') {
            res.status(400).json({ error: 'unable to search routes' })
            return;
        }

        const routes = allRoutes.filter((route) => {
            return route.stops.indexOf(arriveId) > route.stops.indexOf(departId);
        })

        res.json( { routes });
    } catch (err) {
        next(err);
    }
})

app.use(errorHandler())

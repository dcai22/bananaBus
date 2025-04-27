import express, { json, request, Request, Response } from "express";
import cors from "cors";
import errorHandler from "middleware-http-errors";

import { authLogin, authRegister, authAutoLogin, authLogout, authPasswordResetEmail, authPasswordReset, authPasswordVerifyCode, authGoogleLogin, removeExpiredSessions } from './auth';
import { generateTrips, getTrip, tripsList } from './tripsList';
import { createCustomerKey, createPaymentDetails, createSetupIntent, searchBookings } from './searchBookings';
import { getSavedRoutes, saveRoute, unsaveRoute } from './savedRoutes';
import { deleteAccount, 
            getUserDetails,
            updateUserDetails,
            updateUserPassword,
            sendEnquiry} from './account';
import { getDeals } from './getDeals';
import { Booking, Route, RouteSection, Trip } from './interface';
import { ObjectId } from 'mongodb';
import { addManager, removeManager, addVehicle, deleteVehicle, editVehicle } from './manager';
import { collections, connectToDatabase, closeConnection } from './mongoUtil';
import { driverGetTrip, findUserByToken, getRouteById, getStopById } from './helper';

const app = express();

app.use(json());
app.use(cors());

module.exports = app;

// Routes
app.get("/", (req: Request, res: Response) => {
    res.send("Hello world");
});

app.post("/login", async (req: Request, res: Response, next) => {
    try {
        const email = req.body.email as string;
        const password = req.body.password as string;
        res.json(await authLogin(email, password));
    } catch (error) {
        next(error);
    }
    return;
});

app.post("/register", async (req: Request, res: Response, next) => {
    try {
        const email = req.body.email as string;
        const password = req.body.password as string;
        const firstName = req.body.firstName as string;
        const lastName = req.body.lastName as string;
        res.json(await authRegister(email, password, firstName, lastName));
    } catch (error) {
        next(error);
    }
    return;
});

app.post("/googleLogin", async (req: Request, res: Response, next) => {
    try {
        const email = req.body.email as string;
        const firstName = req.body.firstName as string;
        const lastName = req.body.lastName as string;
        res.json(await authGoogleLogin(email, firstName, lastName));
    } catch (error) {
        next(error);
    }
    return;
});

app.post("/resetPasswordEmail", async (req: Request, res: Response, next) => {
    try {
        const email = req.body.email as string;
        res.json(await authPasswordResetEmail(email));
    } catch (error) {
        next(error);
    }
    return;
});

app.post(
    "/resetPasswordVerifyCode",
    async (req: Request, res: Response, next) => {
        try {
            const token = req.query.token as string;
            const code = req.body.code as string;
            res.json(await authPasswordVerifyCode(token, code));
        } catch (error) {
            next(error);
        }
        return;
    }
);

app.post("/resetPassword", async (req: Request, res: Response, next) => {
    try {
        const token = req.query.token as string;
        const newPassword = req.body.newPassword as string;
        res.json(await authPasswordReset(token, newPassword));
    } catch (error) {
        next(error);
    }
    return;
});

app.post("/autologin", async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        res.json(await authAutoLogin(token));
    } catch (error) {
        next(error);
    }
    return;
});

app.post("/logout", async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const userId = req.body.userId as ObjectId;
        res.json(await authLogout(userId, token));
    } catch (error) {
        next(error);
    }
    return;
});

app.delete("/deleteAccount", async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const userId = req.body.userId as ObjectId;
        res.json(await deleteAccount(userId, token));
    } catch (error) {
        next(error);
    }
    return;
});

app.get("/upcomingBookings", async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const bookings = await searchBookings(token, 'upcoming');
        res.json({ bookings });
    } catch (err) {
        next(err);
    }
    return;
});

app.get("/pastBookings", async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const bookings = await searchBookings(token, 'past');
        res.json({ bookings });
    } catch (err) {
        next(err);
    }
    return;
});

app.post('/generateTrips', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const routeId = new ObjectId(req.body.routeId as string);
        const date = req.body.date as string;

        res.json(await generateTrips(token, routeId, date));
    } catch (err) {
        next(err);
    }
});

app.get("/tripsList", async (req: Request, res: Response, next) => {
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
});

app.get("/getTrip", async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const departId = new ObjectId(req.query.departId as string);
        const arriveId = new ObjectId(req.query.arriveId as string);
        const tripId = new ObjectId(req.query.tripId as string);

        res.json(await getTrip(token, departId, arriveId, tripId));
    } catch (err) {
        next(err);
    }
});

app.get("/getSavedRoutes", async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    try {
        res.json(await getSavedRoutes(token));
    } catch (err) {
        next(err);
    }
});

app.post("/saveRoute", async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const routeId = new ObjectId(req.body.routeId as string);
    const originId = new ObjectId(req.body.originId as string);
    const destId = new ObjectId(req.body.destId as string);
    try {
        res.json(await saveRoute(token, routeId, originId, destId));
    } catch (err) {
        next(err);
    }
});

app.post("/unsaveRoute", async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const routeId = new ObjectId(req.body.routeId as string);
    const originId = new ObjectId(req.body.originId as string);
    const destId = new ObjectId(req.body.destId as string);
    try {
        res.json(await unsaveRoute(token, routeId, originId, destId));
    } catch (err) {
        next(err);
    }
});

app.get("/getAccountDetails", async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        res.json(await getUserDetails(token));
    } catch (error) {
        next(error);
    }
});

app.put("/updateAccountDetails", async (req: Request, res: Response, next) => {
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
});

app.put("/updateAccountPassword", async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const oldPassword = req.body.oldPassword as string;
        const newPassword = req.body.newPassword as string;
        res.json(await updateUserPassword(token, oldPassword, newPassword));
    } catch (error) {
        next(error);
    }
    return;
});

app.get("/getDeals", async (req: Request, res: Response, next) => {
    try {
        const deals = await getDeals();
        res.json(deals);
    } catch (err) {
        next(err);
    }
});

app.post("/createBooking", async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const tripId = new ObjectId(req.body.tripId as string);
    const originId = new ObjectId(req.body.originId as string);
    const destId = new ObjectId(req.body.destId as string);
    const numTickets = req.body.numTickets as number;
    const numLuggage = req.body.numLuggage as number;

    await connectToDatabase();

    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: "invalid token" });
        return;
    }

    try {
        const dbRes = await collections.bookings?.insertOne({
            _id: new ObjectId(),
            userId: user._id,
            tripId,
            originId,
            destId,
            numTickets,
            numLuggage,
            bookingTime: new Date(),
        });
        await collections.trips?.updateOne(
            { _id: tripId },
            { $push: { bookings: dbRes?.insertedId } } as any
        )
        await collections.users?.updateOne(
            { _id: user._id },
            { $push: { bookings: dbRes?.insertedId } } as any
        )

        res.json({ insertedId: dbRes?.insertedId });
    } catch (err) {
        next(err);
    }
});

app.post("/manager/createRoute", async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const stops = req.body.stops as ObjectId[];

    await connectToDatabase();
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: "invalid token" });
        return;
    }
    if (!user.isManager) {
        res.status(403).json({ error: "user is not a manager" });
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
});

app.delete(
    "/manager/deleteRoute",
    async (req: Request, res: Response, next) => {
        const token = req.headers.authorization as string;
        const routeId = req.body.routeId as ObjectId;

        await connectToDatabase();
        const strippedToken = token.replace("Bearer ", "");
        const user = await findUserByToken(strippedToken);
        if (!user) {
            res.status(403).json({ error: "invalid token" });
            return;
        }
        if (!user.isManager) {
            res.status(403).json({ error: "user is not a manager" });
            return;
        }

        try {
            await collections.routes?.deleteOne({ routeId: routeId });
            res.json({});
        } catch (err) {
            next(err);
        }
    }
);

app.get("/manager/allStops", async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    await connectToDatabase();
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);

    if (!user) {
        res.status(403).json({ error: 'invalid token' });
        return;
    }
    try {
        const dbRes = await collections.stops?.find().toArray();
        res.json(dbRes);
    } catch (err) {
        next(err);
    }
});

app.put("/manager/add", async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;

    try {
        res.json(await addManager(token));
    } catch (err) {
        next(err);
    }
});

app.put("/manager/remove", async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;

    try {
        res.json(await removeManager(token));
    } catch (err) {
        next(err);
    }
});

app.post('/sendEnquiry', async (req: Request, res: Response, next) => {
    try {
        const heading = req.body.heading as string;
        const body = req.body.body as string;
        const token = req.headers.authorization as string;
        res.json(await sendEnquiry(token, heading, body));
    } catch (error) {
        next(error);
    }
    return;
})

app.get('/manager/allVehicles', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;

    try {
        await connectToDatabase();

        const strippedToken = token.replace("Bearer ", "");
        const user = await findUserByToken(strippedToken);
        if (!user) {
            res.status(403).json({ error: "invalid token" });
            return;
        }
        if (!user.isManager) {
            res.status(403).json({ error: "user is not a manager" });
            return;
        }

        
        const allVehicles = await collections.vehicles?.find().toArray();
        res.json({ vehicles: allVehicles });
    } catch (err) {
        next(err);
    }
    return;
})

app.post('/manager/addVehicle', async (req: Request, res: Response, next) => {
    
    const token = req.headers.authorization as string;
    const maxCapacity = req.body.maxCapacity as number;
    const maxLuggageCapacity = req.body.maxLuggageCapacity as number;
    const hasAssist = req.body.hasAssist as boolean;
    const numberPlate = req.body.numberPlate as string;
    const model = req.body.model;

    await connectToDatabase();

    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: "invalid token" });
        return;
    }
    if (!user.isManager) {
        res.status(403).json({ error: "user is not a manager" });
        return;
    }

    try {   
        res.json(await addVehicle(maxCapacity, maxLuggageCapacity, hasAssist, numberPlate, model));
    } catch (err) {
        next(err);
    }
    return;
})  


app.put('/manager/editVehicle', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const vehicleId = new ObjectId(req.body.vehicleId as string);
    const maxCapacity = req.body.maxCapacity as number;
    const maxLuggageCapacity = req.body.maxLuggageCapacity as number;
    const hasAssist = req.body.hasAssist as boolean;
    const numberPlate = req.body.numberPlate as string;
    const model = req.body.model;

    await connectToDatabase();

    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: "invalid token" });
        return;
    }
    if (!user.isManager) {
        res.status(403).json({ error: "user is not a manager" });
        return;
    }

    try {   
        res.json(await editVehicle(vehicleId, maxCapacity, maxLuggageCapacity, hasAssist, numberPlate, model));
    } catch (err) {
        next(err);
    }
    return;
})

app.delete('/manager/deleteVehicle', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string; 
    const vehicleId = new ObjectId(req.body.vehicleId as string);

    await connectToDatabase();
    
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: "invalid token" });
        return;
    }
    if (!user.isManager) {
        res.status(403).json({ error: "user is not a manager" });
        return;
    }

    try{
        res.json(await deleteVehicle(vehicleId));
    } catch (err) {
        next(err);
    }

})


app.get('/stops/reachableFrom', async (req: Request, res: Response, next) => {
    await connectToDatabase();

    const token = req.headers.authorization as string;
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: "invalid token" });
        return;
    }

    const fromId = new ObjectId(req.query.fromId as string);

    try {
        const routes = await collections.routes
            ?.find<Route>({
                stops: { $elemMatch: { $eq: fromId } },
            })
            .toArray();

        if (typeof routes === "undefined") {
            res.status(400).json({ error: "unable to search routes" });
            return;
        }

        const stops = new Set<ObjectId>();
        for (const route of routes) {
            const fromIndex = route.stops.indexOf(fromId);
            route.stops.forEach((e, i, a) => {
                if (i > fromIndex) {
                    stops.add(e);
                }
            });
        }

        res.json({ stops: Array.from(stops) });
    } catch (err) {
        next(err);
    }
});

app.get('/routes/fromSection', async (req: Request, res: Response, next) => {
    await connectToDatabase();

    const token = req.headers.authorization as string;
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: "invalid token" });
        return;
    }

    const departId = new ObjectId(req.query.departId as string);
    const arriveId = new ObjectId(req.query.arriveId as string);

    try {
        const allRoutes = await collections.routes?.find<Route>({
            $and: [
                { stops: { $elemMatch: { $eq: departId } } },
                { stops: { $elemMatch: { $eq: arriveId } } }
            ]
        }).toArray();

        if (typeof allRoutes === 'undefined') {
            res.status(400).json({ error: 'unable to search routes' })
            return;
        }

        const routes = allRoutes.filter((route) => {
            return route.stops.findIndex(s => s.equals(arriveId)) > route.stops.findIndex(s => s.equals(departId));
        })

        res.json( { routes });
    } catch (err) {
        next(err);
    }
});

app.get('/driver/getUpcomingTrips', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;

    await connectToDatabase();
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: "invalid token" });
        return;
    }
    if (!user.isDriver) {
        res.status(403).json({ error: "user is not a driver" });
        return;
    }

    try {
        const now = new Date();
        const allTrips = await collections.trips?.find<Trip>({
            driverId: user._id,
        }).toArray();
        const upcomingTrips = allTrips?.filter(t => t.stopTimes[0] > now);
        if (!upcomingTrips) {
            res.json({ upcomingTrips: [] });
            return;
        }

        const formattedUpcomingTrips = await Promise.all(
            upcomingTrips.map(async (t) => {
                const route = await getRouteById(t.routeId);
                const origin = await getStopById(route.stops[0]);
                const dest = await getStopById(route.stops[route.stops.length - 1]);
                return {
                    _id: t._id.toString(),
                    stopTimes: t.stopTimes,
                    originName: origin.name,
                    destName: dest.name,
                };
            })
        );

        res.json({ upcomingTrips: formattedUpcomingTrips });
    } catch (err) {
        next(err);
    }
});

app.get('/driver/getTrip', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const tripId = new ObjectId(req.query.tripId as string);

    try {
        res.json(await driverGetTrip(token, tripId));
    } catch (err) {
        next(err);
    }
});

app.put('/driver/reportVehicle', async (req: Request, res: Response, next) => {
    const token = req.headers.authorization as string;
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        res.status(403).json({ error: "invalid token" });
        return;
    }
    
    const vehicleId = new ObjectId(req.body.vehicleId as string);
    const reportText = req.body.reportText as string;

    console.log(req);

    await connectToDatabase();
    
    try {
        await collections.vehicles?.updateOne(
            { _id: vehicleId },
            { $push: { reports: { date: new Date(), text: reportText } } }
        );
        res.json();
    } catch (err) {
        next(err);
    }
});

app.get('/removeExpiredSessions', async (req: Request, res: Response, next) => {
    try {
        res.json(await removeExpiredSessions());
    } catch (error) {
        next(error);
    }
    return;
});

app.delete('/clearUsers', async (req: Request, res: Response, next) => {
    await connectToDatabase();
    await collections.users?.deleteMany({});
    res.json({});
    return;
});

app.post('/closeConnection', async (req: Request, res: Response, next) => {
    res.json(await closeConnection());
    return;
});

app.post('/createPaymentDetails', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        const price = parseInt(req.body.price);
        res.json(await createPaymentDetails(token, price));
    } catch (error) {
        next(error);
    }
    return;
});

app.post('/createCustomerKey', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        res.json(await createCustomerKey(token));
    } catch (error) {
        next(error);
    }
    return;
});

app.post('/createSetupIntent', async (req: Request, res: Response, next) => {
    try {
        const token = req.headers.authorization as string;
        res.json(await createSetupIntent(token));
    } catch (error) {
        next(error);
    }
    return;
});


app.use(errorHandler());

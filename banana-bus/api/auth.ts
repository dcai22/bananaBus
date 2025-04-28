import HTTPError from "http-errors";
import { Error } from "./interface";
import { getHash, compareHash, findUserByToken, findUserByResetToken } from "./helper";
import crypto from "crypto";
import { collections } from "./mongoUtil";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "./mongoUtil";
import dotenv from "dotenv";
var jwt = require('jsonwebtoken');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function authRegister(email: string, password: string, firstName: string, lastName: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    const checkUser = await collections.users?.findOne({ email: email, isExternal: false });
    if (checkUser) {
        throw HTTPError(400, 'email address already in use');
    }

    const hashedPassword = await getHash(password);
    const sessionId = crypto.randomBytes(64).toString('hex');

    const customer = await stripe.customers.create({
        name: `${firstName} ${lastName}`,
        email: email,
    })

    const newUser = {
        _id: new ObjectId(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        sessions: [
            {
                sessionId: sessionId,
                expiry: new Date(Date.now() + 120 * 60 * 1000),
            },
        ],
        resetToken: {
            token: '',
            code: '',
            expiry: new Date(),
        },
        bookings: [],
        savedRoutes: [],
        isManager: false,
        isDriver: false,
        isExternal: false,
        cards: [],
        customerId: customer.id,
    }

    const userId = await collections.users.insertOne(newUser);

    const jwtToken = jwt.sign({ userId: userId.insertedId.toString(), sessionId }, process.env.JWT_SECRET, { expiresIn: '2h' });

    return {
        userId: userId.insertedId,
        token: jwtToken
    };
}

export async function authLogin(email: string, password: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    const user = await collections.users.findOne({ email: email, isExternal: false });
    if (!user) {
        throw HTTPError(400, 'incorrect email or password');
    }

    if (!(await compareHash(password, user.password))) {
        throw HTTPError(400, 'incorrect email or password');
    }

    
    const sessionId = crypto.randomBytes(64).toString('hex');
    const expiry = new Date(Date.now() + 120 * 60 * 1000);
    await collections.users.updateOne({ _id: user._id }, { $push: { sessions: { sessionId, expiry } } } as any);
    const token = jwt.sign({ userId: user._id.toString(), sessionId }, process.env.JWT_SECRET, { expiresIn: '2h' });

    return {
        userId: user._id,
        token: token
    }
}

export async function authAutoLogin(token: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    return {
        userId: user._id,
        token: strippedToken,
    }
}

export async function authLogout(userId: ObjectId, token: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    const strippedToken = token.replace('Bearer ', '');
    const userByToken = await findUserByToken(strippedToken);
    if (!userByToken) {
        throw HTTPError(403, 'invalid token');
    }


    const decoded = jwt.verify(strippedToken, process.env.JWT_SECRET);
    
    const sessionId = decoded.sessionId;
    const tokenUserId = decoded.userId;

    if (userId.toString() !== tokenUserId) {
        throw HTTPError(403, 'invalid token');
    }

    await collections.users.updateOne({ _id: userId }, { $pull: { sessions: { sessionId: sessionId } } } as any);

    return { message: 'logged out' };
}

export async function authPasswordResetEmail(email: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    let user = await collections.users.findOne({ email: email, isExternal: false });
    const code = Math.floor(Math.random() * 899999 + 100000).toString();
    const token = crypto.randomBytes(64).toString('hex');
    // even if the email is invalid, act as if the email is, for security reasons
    if (!user) {
        user = await collections.users.findOne({ email: email, isExternal: true });
        if (!user) {
            return {
                message: 'Email not found ' + email,
                token
            }
        }
    }

    const hashedCode = await getHash(code);
    const hashedToken = await getHash(token);
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    await collections.users.updateOne({ email: email, isExternal: false }, { $set: { resetToken: { token: hashedToken, code: hashedCode, expiry: expiry } } } as any);

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await new Promise((resolve, reject) => {
        transporter.verify(function(error: Error, success: any) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log('Server is ready to take our messages');
                resolve(success);
            }
        });
    });



    let mailOptions = {
        from: 'Banana Bus 2025',
        to: email,
        subject: 'Banana Bus Password Reset',
        html: `
            <p>This is your one-time passcode:</p>
            <h1 style="font-size: 24px; font-weight: bold;">${code}</h1>
            <p>It will expire in 15 minutes.</p>
        `,
    }

    if (user.isExternal) {
        mailOptions = {
            from: 'Banana Bus 2025',
            to: email,
            subject: 'Banana Bus Password Reset',
            html: `
                <p>ur signed in with google el o el</p>
            `,
        }
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error: Error, info: any) {
            if (error) {
                console.log(error);
                reject(error);
            }
            else {
                console.log('Email sent: ' + info.response);
                resolve(info);
            }
        })
    })
    return {
        message: 'Email sent',
        token
    }
}

// checks the token in the query of the url is correct, ensures that this person is actually trying to reset their password
export async function authPasswordVerifyCode(token: string, code: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const user = await findUserByResetToken(token);
    if (!user) {
        throw HTTPError(400, 'invalid token');
    }
    if (user.resetToken.expiry < new Date()) {
        throw HTTPError(400, 'token expired');
    }
    if (!(await compareHash(code, user.resetToken.code))) {
        throw HTTPError(400, 'incorrect code');
    }
    const newToken = crypto.randomBytes(64).toString('hex');
    const hashedToken = await getHash(newToken);
    user.resetToken.token = hashedToken;
    user.resetToken.expiry = new Date(Date.now() + 15 * 60 * 1000);
    await collections.users.updateOne({ _id: user._id }, { $set: { resetToken: user.resetToken } } as any);
    return {
        token: newToken,
    }
}

export async function authPasswordReset(token: string, password: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const user = await findUserByResetToken(token);
    if (!user) {
        throw HTTPError(400, 'invalid token');
    }
    if (user.resetToken.expiry < new Date()) {
        throw HTTPError(400, 'token expired');
    }
    const hashedPassword = await getHash(password);
    await collections.users.updateOne({ _id: user._id }, { $set: { password: hashedPassword } } as any);
    return {
        message: 'password reset',
    }
}

export async function authGoogleLogin(email: string, firstName: string, lastName: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    const checkUser = await collections.users?.findOne({ email: email, isExternal: true });
    if (checkUser) {
        const sessionId = crypto.randomBytes(64).toString('hex');
        const expiry = new Date(Date.now() + 120 * 60 * 1000);
        const token = jwt.sign({ userId: checkUser._id.toString(), sessionId }, process.env.JWT_SECRET, { expiresIn: '2h' });
        await collections.users.updateOne({ _id: checkUser._id }, { $push: { sessions: { sessionId, expiry } } } as any);
        return {
            userId: checkUser._id,
            token: token,
        };
    }

    const sessionId = crypto.randomBytes(64).toString('hex');
    const expiry = new Date(Date.now() + 120 * 60 * 1000);

    const customer = await stripe.customers.create({
        name: `${firstName} ${lastName}`,
        email: email,
    });

    // note: google members should not have a password, and cannot reset email or password
    const newUser = {
        _id: new ObjectId(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: '',
        sessions: [{
            sessionId,
            expiry
        }],
        resetToken: {
            token: '',
            code: '',
            expiry: new Date(),
        },
        bookings: [],
        savedRoutes: [],
        isManager: false,
        isDriver: false,
        isExternal: true,
        cards: [],
        customerId: customer.id,
    }

    const userId = await collections.users?.insertOne(newUser);
    const token = jwt.sign({ userId: userId.insertedId.toString(), sessionId }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return {
        userId: userId.insertedId,
        token: token,
    }
}


export async function removeExpiredSessions() {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const now = new Date();

    // Remove expired sessions from all users
    const result = await collections.users.updateMany(
        { "sessions.expiry": { $lte: now } }, // Match users with expired sessions
        { $pull: { sessions: { expiry: { $lte: now } } } } as any // Remove expired sessions
    );

    return {
        message: `Removed expired sessions from ${result.modifiedCount} user(s).`,
    };
}

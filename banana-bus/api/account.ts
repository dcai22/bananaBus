import HTTPError from "http-errors";
import { compareHash, findUserByToken, getHash } from "./helper";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";
import { Card } from "./interface";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Returns certain details about the user
 * @param {string} token        token of the user
 * @returns object containing firstName, lastName, email, isExternal, isManager, isDriver of user
 */
export async function getUserDetails(token: string) {
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
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        isExternal: user?.isExternal,
        isManager: user?.isManager,
        isDriver: user?.isDriver,
    };
}

/**
 * Updates the user details with the inputted values
 * @param {string} token        token of the user
 * @param {string} firstName    new first name of the user
 * @param {string} lastName     new last name of the user
 * @param {string} email        new email of the user
 * @returns object containing firstName, lastName, email
 * @returns 
 */
export async function updateUserDetails(token: string, firstName: string, lastName: string, email: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const originalEmail = user.email;
    const userByEmail = await collections.users?.findOne({ email : email });
    if (userByEmail && userByEmail.email !== originalEmail) {
        throw HTTPError(400, 'cannot use this email');
    }

    await collections.users?.updateOne({ _id: user._id }, { $set: { firstName: firstName, lastName: lastName, email: email } } as any);

    return {
        firstName: firstName,
        lastName: lastName,
        email: email,
    }
}

/**
 * Update the user's password with the new password. Requires the old password to be correct
 * @param {string} token        token of the user
 * @param {string} oldPassword  old password of the user
 * @param {string} newPassword  new password of the user
 * @returns empty object
 */
export async function updateUserPassword(token: string, oldPassword: string, newPassword: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const strippedToken = token.replace('Bearer ', '');

    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    if (!(await compareHash(oldPassword, user.password))) {
        throw HTTPError(400, 'incorrect password');
    }
    const newHashedPassword = await getHash(newPassword);
    await collections.users?.updateOne({ _id: user._id }, { $set: { password: newHashedPassword } } as any);
    return {};
}

/**
 * Deletes the user's account
 * @param {string} token        token of the user
 * @param {ObjectId} userId     id of the user
 * @returns empty object
 */
export async function deleteAccount(userId: ObjectId, token: string) {
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const strippedToken = token.replace('Bearer ', '');
    const userById = await collections.users?.findOne({ _id: new ObjectId(userId) });
    if (!userById) {
        throw HTTPError(400, 'invalid userId ' + userId);
    }
    const userByToken = await findUserByToken(strippedToken);
    if (!userByToken) {
        throw HTTPError(403, 'invalid token');
    }
    
    if (!userById._id.equals(userByToken._id)) {
        throw HTTPError(403, 'invalid data');
    }

    const customerId = userById.customerId;

    await stripe.customers.del(customerId);

    await collections.users?.deleteOne({ _id: new ObjectId(userId) });
    return {};
}

/**
 * Sends an enquiry email to the support team
 * @param {string} token        token of the user
 * @param {string} heading      heading of the enquiry
 * @param {string} body         body of the enquiry
 * @returns object containing message and ticket number
 */
export async function sendEnquiry(token: string, heading: string, body: string) {
    await connectToDatabase();
    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    const email = user.email;
    // Change the ticket number to be random and unique
    const ticketNumber = Math.floor(Math.random() * 899999 + 100000).toString();
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

    const mailOptions = {
        from: 'Customer Enquiry',
        to: 'bananabus846@gmail.com',
        subject: `Enquiry from ${user.firstName} ${user.lastName} (${email}) - Ticket Number: ${ticketNumber}`,
        html: `<h1 style="font-size: 24px; font-weight: bold;">${heading}</h1>
                <p style="font-size: 16px;">${body}</p>`,
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error: Error, info: any) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log('Email sent: ' + info.response);
                resolve(info.response);
            }
        });
    });

    return {
        message: 'Enquiry sent',
        ticketNumber
    }
}


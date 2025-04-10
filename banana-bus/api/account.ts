import HTTPError from "http-errors";
import { compareHash, findUserByToken, getHash } from "./helper";
import { collections } from "./mongoUtil";
import { ObjectId } from "mongodb";

export async function getAccountName(token: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    return { firstName: user?.firstName, lastName: user?.lastName };
}

export async function getUserDetails(token: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    return {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
    };
}

export async function updateUserDetails(token: string, firstName: string, lastName: string, email: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    await collections.users?.updateOne({ _id: user._id }, { $set: { firstName: firstName, lastName: lastName, email: email } } as any);

    return {
        firstName: firstName,
        lastName: lastName,
        email: email,
    }
}

export async function updateUserPassword(token: string, oldPassword: string, newPassword: string) {
    const strippedToken = token.replace('Bearer ', '');

    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    if (!compareHash(oldPassword, user.password)) {
        throw HTTPError(400, 'incorrect password');
    }
    const newHashedPassword = getHash(newPassword);
    await collections.users?.updateOne({ _id: user._id }, { $set: { password: newHashedPassword } } as any);
    return {};
}

export async function deleteAccount(userId: ObjectId, token: string) {
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

    await collections.users?.deleteOne({ _id: new ObjectId(userId) });
    return {};
}

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
            user: 'delphine.batz@ethereal.email',
            pass: 'djexbJqVg88mr4u38u'
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
        to: 'beanslover65@hotmail.com',
        subject: `Enquiry from ${user.firstName} ${user.lastName} (${email}) - Ticket Number: ${ticketNumber}`,
        text: `${heading}\n\n${body}`,
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
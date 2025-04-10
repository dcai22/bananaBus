import HTTPError from "http-errors";
import { compareHash, findUserByToken, getHash } from "./helper";
import { getData, setData } from "./dataStore";

export function getAccountName(token: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    return { firstName: user?.firstName, lastName: user?.lastName };
}

export function getUserDetails(token: string) {
    const strippedToken = token.replace('Bearer ', '');
    const user = findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    return {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
    };
}

export function updateUserDetails(token: string, firstName: string, lastName: string, email: string) {
    const strippedToken = token.replace('Bearer ', '');
    const data = getData();
    let userIndex = -1;
    for (const index in data.users) {
        for (const userToken of data.users[index].tokens) {
            if (compareHash(strippedToken, userToken)) {
                userIndex = parseInt(index);
                break;
            }
        }
    }
    if (userIndex === -1) {
        throw HTTPError(403, 'invalid token');
    }
    
    data.users[userIndex].firstName = firstName;
    data.users[userIndex].lastName = lastName;
    data.users[userIndex].email = email;
    setData(data);
    return {
        firstName: data.users[userIndex].firstName,
        lastName: data.users[userIndex].lastName,
        email: data.users[userIndex].email,
    };
}

export function updateUserPassword(token: string, oldPassword: string, newPassword: string) {
    const strippedToken = token.replace('Bearer ', '');
    const data = getData();
    let userIndex = -1;
    for (const index in data.users) {
        for (const userToken of data.users[index].tokens) {
            if (compareHash(strippedToken, userToken)) {
                userIndex = parseInt(index);
                break;
            }
        }
    }
    if (userIndex === -1) {
        throw HTTPError(403, 'invalid token');
    }

    if (!compareHash(oldPassword, data.users[userIndex].password)) {
        throw HTTPError(400, 'incorrect password');
    }

    const newHashedPassword = getHash(newPassword);
    
    data.users[userIndex].password = newHashedPassword;
    setData(data);
    return {};
}

export function deleteAccount(userId: number, token: string) {
    const data = getData();
    const strippedToken = token.replace('Bearer ', '');

    let userIndex = -1;
        for (const index in data.users) {
            if (data.users[index].userId === userId) {
                userIndex = parseInt(index);
                break;
            }
        }
    if (userIndex === -1) {
        throw HTTPError(400, 'invalid userId ' + userId);
    }

    const userBytoken = findUserByToken(strippedToken);
    if (userBytoken === undefined) {
        throw HTTPError(403, 'invalid token');
    }
    if (data.users[userIndex].userId !== userBytoken.userId) {
        throw HTTPError(403, 'invalid data');
    }

    data.users.splice(userIndex, 1);
    setData(data);
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
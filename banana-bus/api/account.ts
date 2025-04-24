import HTTPError from "http-errors";
import { compareHash, findUserByToken, getHash } from "./helper";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";
import { Card } from "./interface";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
        host: 'smtp.ethereal.email',
        port: 587,
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

export async function getUserCards(token: string){
    await connectToDatabase();
    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const cards = [];
    for (const card of user.cards) {
        const cardData = {
            _id: card._id.toString(),
            type: card.type,
            last4: card.last4,
            isDefault: card.isDefault
        };
        cards.push(cardData);
    }
    return {
        cards
    };
}

export async function addCard(token: string, type: string, cardNumber: string, cvv: string, expMonth: number, expYear: number ){
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const expiry = new Date(expYear, expMonth-1,1);
    const now = new Date();
    const curDate = new Date(now.getFullYear(), now.getMonth(),1);

    if (expiry < curDate) {
        throw HTTPError(400, "Card is expired");
    }

    const hashedCardNumber = await getHash(cardNumber);
    const hashedCvv = await getHash(cvv);
    const last4 = cardNumber.slice(-4);
    
    let isDefault = false;

    const cardId = new ObjectId(); 

    if (user.cards.length == 0) {
        isDefault = true;
    }

    const newCard: Card = {
        _id: cardId,
        type: type,
        cardNumber: hashedCardNumber,
        cvv: hashedCvv,
        expiry: expiry,
        last4: last4,
        isDefault: isDefault
    };

    const result = await collections.users?.updateOne(
        { _id: user._id },
        { $push: { cards: newCard } as any }
    );
    
    if (!result || result.modifiedCount === 0) {
        throw HTTPError(400, 'Failed to add card');
    }
    
    return newCard;

}

export async function deleteCard(token: string, cardId: ObjectId){
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const cardtoDelete = user.cards.find((card: any) => card._id.equals(cardId));
    if (!cardtoDelete) {
        throw HTTPError(400, 'Card does not exist');
    }

    const result = await collections.users?.updateOne(
        { _id: user._id },
        { $pull: { cards: { _id: cardId } } as any}
    );

    if (!result || result.modifiedCount === 0) {
        throw HTTPError(400, 'Card does not exist');
    }

    if (cardtoDelete.isDefault) {
        const remainingCards = user.cards.filter((card: any) => !card._id.equals(cardId));
        if (remainingCards.length > 0) {
            const newDefaultCardId = remainingCards[0]._id; // Pick the first remaining card
            await collections.users?.updateOne(
                { _id: user._id, 'cards._id': newDefaultCardId },
                { $set: { 'cards.$.isDefault': true } }
            );
        }
    }

    return {};

}

export async function makeDefaultCard(token: string, cardId: ObjectId){
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    await collections.users?.updateOne(
        { _id: user._id },
        { $set: { 'cards.$[].isDefault': false }}
    );

    
    const result = await collections.users?.updateOne(
        { _id: user._id, 'cards._id': cardId },
        { $set: { 'cards.$.isDefault': true }}
    );

    return {}
}

export async function editCard(token: string, cardId: ObjectId, type: string, cardNumber: string, cvv: string, expMonth: number, expYear: number ){
    await connectToDatabase();

    if (!collections.users) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const now = new Date();
    const curDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const expiry = new Date(expYear, expMonth - 1, 0);

    if (expiry < curDate) {
        throw HTTPError(400, 'Card is expired');
    }

    const hashedCardNumber = await getHash(cardNumber);
    const hashedCvv = await getHash(cvv);
    const last4 = cardNumber.slice(-4);


    const result = await collections.users?.updateOne(
        { _id: user._id , "cards.cardId": cardId },
        {$set: {
                "cards.$.type": type,
                "cards.$.cardNumber": hashedCardNumber,
                "cards.$.cvv": hashedCvv,
                "cards.$.expiry": expiry,
                "cards.$.last4": last4,
            }
        }
    );

    if (!result || result.modifiedCount === 0) {
        throw new Error('Card update failed');
    }

    return {
        cardId: cardId,
        type: type,
        cardNumber: hashedCardNumber,
        cvv: hashedCvv,
        expiry: expiry,
        last4: last4
    }
}


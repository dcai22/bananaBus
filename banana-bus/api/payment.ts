import HTTPError from "http-errors";
import { ObjectId } from "mongodb";
import { collections, connectToDatabase } from "./mongoUtil";
import { User, Card } from "./interface";
import { getHash, compareHash} from "./helper";


export async function getUserCards(userId: ObjectId){
    await connectToDatabase();

    const user = await collections.users?.findOne<User>({ userId: userId });
    if (!user) {
        throw HTTPError(400, 'user not found');
    }
    
    return user.cards;
}

export async function addCard(userId: ObjectId, type: string, cardNumber: string, cvv: string, expMonth: number, expYear: number ){
    await connectToDatabase();

    const user = await collections.users?.findOne<User>({ userId: userId });
    
    if (!user) {
        throw HTTPError(400, 'User not found');
    }

    const expiry = new Date(expYear, expMonth-1,1);
    const now = new Date();
    const curDate = new Date(now.getFullYear(), now.getMonth(),1);

    if (expiry < curDate) {
        throw HTTPError(400, "Card is expired");
    }

    const hashedCardNumber = getHash(cardNumber);
    const hashedCvv = getHash(cvv);
    const last4 = cardNumber.slice(-4);
    
    let isDefault = false;

    const cardId = new ObjectId(); 

    if (user.cards.length == 0){
        isDefault = true;
    }

    const newCard = new Card(
        cardId,
        type,
        hashedCardNumber,
        hashedCvv,
        expiry,
        last4,
        isDefault
    );

    const result = await collections.users?.updateOne(
        { userId: userId },
        { $push: { cards: newCard } }
    );
    
    if (!result || result.modifiedCount === 0) {
        throw HTTPError(400, 'Failed to add card');
    }
    
    return newCard;

}

export async function deleteCard(userId: ObjectId, cardId: ObjectId){
    await connectToDatabase();

    const user = await collections.users?.findOne({ userId });
    if (!user){
        throw HTTPError(400, 'User does not exist');
    }

    const result = await collections.users?.updateOne(
        { userId },
        { $pull: { cards: { cardId } } }
    );

    if (!result || result.modifiedCount === 0) {
        throw HTTPError(400, 'Card does not exist');
    }

    return {};

}

export async function makeDefaultCard(userId: ObjectId, cardId: ObjectId){
    await connectToDatabase();

    const user = await collections.users?.findOne({ userId });
    if (!user){
        throw HTTPError(400, 'User does not exist');
    }

    const result = await collections.users?.updateOne(
        { userId },
        {$set: { 'cards.$[].isDefault': false, 'cards.$[selected].isDefault': true }},
        { arrayFilters: [{ 'selected.cardId': cardId }] }
    );

    if (!result || result.modifiedCount === 0) {
        throw HTTPError(400, 'Card does not exist');
    }

    return {}
}

export async function editCard(userId: ObjectId, cardId: ObjectId, type: string, cardNumber: string, cvv: string, expMonth: number, expYear: number ){
    await connectToDatabase();

    const user = await collections.users?.findOne({ userId });
    if (!user){
        throw HTTPError(400, 'User does not exist');
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
        { userId, "cards.cardId": cardId },
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

    return {}
}


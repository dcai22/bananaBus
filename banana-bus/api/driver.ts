import HTTPError from "http-errors";
import { ObjectId } from "mongodb";
import { collections, connectToDatabase } from "./mongoUtil";
import { findUserByToken } from "./helper";
import { Booking, User } from "./interface";

export async function driverGetTrip(token: string, tripId: ObjectId) {
    await connectToDatabase();
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isDriver) {
        throw HTTPError(403, "user is not a driver");
    }

    const allBookings = await collections.bookings?.find<Booking>({
        tripId: tripId,
    }).toArray();
    if (!allBookings) {
        throw HTTPError(400, 'bookings not found');
    }

    const passengers = await Promise.all(
        allBookings.map(async (booking) => {
            const user = await collections.users?.findOne<User>({
                _id: booking.userId
            });

            if (!user) {
                throw HTTPError(400, 'User not found');
            }

            return {
                firstName: user.firstName,
                lastName: user.lastName,
                numTickets: booking.numTickets,
            };
        })
    );

    return { passengers };
}
import HTTPError from "http-errors";
import { collections, connectToDatabase } from "./mongoUtil";
import { getRouteById, getTripById } from "./helper";
import { Booking } from "./interface";
import { ObjectId } from "mongodb";

// timeFrame: 'past', 'upcoming', 'ongoing', 'all'.
// Past bookings have already arrived at their destination,
// upcoming bookings are yet to depart from their origin,
// and so on.
export async function searchBookings(userId: ObjectId, timeFrame: string, numBookings: number) {
    await connectToDatabase();

    let bookings = await collections.bookings?.find<Booking>({ userId: userId }).toArray();
    if (!bookings) {
        throw HTTPError(400, 'user not found');
    }

    const curTime = new Date().toISOString();
    bookings = bookings.filter(async (booking) => {
        if (timeFrame === 'all') {
            return true;
        }
        const trip = await getTripById(booking.tripId);
        const route = await getRouteById(trip.routeId);
        const originIndex = route.stops.indexOf(booking.originId);
        const destIndex = route.stops.indexOf(booking.destId);
        if (originIndex < 0 || destIndex < 0) {
            throw HTTPError(500, 'route does not contain required stop');
        }
        const originTime = trip.stopTimes[originIndex];
        const destTime = trip.stopTimes[destIndex];

        switch(timeFrame) {
            case 'past':
                return destTime < curTime;
                
            case 'upcoming':
                return originTime > curTime;

            case 'ongoing':
                return originTime <= curTime && curTime <= destTime;

            default:
                throw HTTPError(400, 'invalid timeframe');
        }
    }
    ).slice(0, numBookings);
    return { userBookings: bookings.map((booking) => { return booking.asDisplayBooking() }) };
}

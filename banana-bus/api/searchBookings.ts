import HTTPError from "http-errors";
import { collections, connectToDatabase } from "./mongoUtil";
import { findUserByToken, getRouteById, getStopById, getTripById } from "./helper";
import { Booking } from "./interface";

// timeFrame: 'past', 'upcoming', 'ongoing', 'all'.
// Past bookings have already arrived at their destination,
// upcoming bookings are yet to depart from their origin,
// and so on.
export async function searchBookings(token: string, timeFrame: string, numBookings?: number) {
    await connectToDatabase();

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    let bookings = await collections.bookings?.find<Booking>({ userId: user._id }).toArray();
    if (!bookings) {
        throw HTTPError(400, 'user not found');
    }

    const curTime = new Date();
    const bookingsWithIncludes = await Promise.all(bookings.map(async (b) => {
        if (timeFrame === 'all') {
            return { include: true, value: b }
        }

        const trip = await getTripById(b.tripId);
        const route = await getRouteById(trip.routeId);
        const originIndex = route.stops.findIndex(s => s.equals(b.originId));
        const destIndex = route.stops.findIndex(s => s.equals(b.destId));

        if (originIndex < 0 || destIndex < 0) {
            throw HTTPError(500, 'route does not contain required stop');
        }

        const originTime = trip.stopTimes[originIndex];
        const destTime = trip.stopTimes[destIndex];

        switch(timeFrame) {
            case 'past':
                return { include: destTime < curTime, value: b };
                
                case 'upcoming':
                    return { include: originTime > curTime, value: b };
                case 'ongoing':
                    return { include: originTime <= curTime && curTime <= destTime, value: b };

            default:
                throw HTTPError(400, 'invalid timeframe');
        }
    }))

    bookings = bookingsWithIncludes.filter(b => b.include).map((b) => b.value)
    
    const sliced = numBookings === undefined ? bookings: bookings.slice(0, numBookings);
    const userBookings = await Promise.all(sliced.map(async (b) => {

        const trip = await getTripById(b.tripId);
        const route = await getRouteById(trip.routeId);

        const origin = await getStopById(b.originId);
        const dest = await getStopById(b.destId);
        const departureTime = trip.stopTimes[route.stops.findIndex(s => s.equals(b.originId))];

        return {
            _id: b._id,
            userId: b.userId,
            tripId: b.tripId,
            originName: origin.name,
            destName: dest.name,
            departureTime: departureTime,
        };
    } 
    ));
    return userBookings;
}

import HTTPError from "http-errors";
import { collections } from "./mongoUtil";
import { getRouteById, getTripById } from "./helper";

// timeFrame: 'past', 'upcoming', 'ongoing', 'all'.
// Past bookings have already arrived at their destination,
// upcoming bookings are yet to depart from their origin,
// and so on.
export async function searchBookings(userId: number, timeFrame: string, numBookings: number) {
    let bookings = await collections.bookings?.find({ userId: userId }).toArray();
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
        const originIndex = route.stops.indexOf(booking.origin);
        const destIndex = route.stops.indexOf(booking.dest);
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

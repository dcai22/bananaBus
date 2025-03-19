import HTTPError from "http-errors";
import { Booking } from "./interface";
import { getData } from "./dataStore";
import { getTripById, getRouteById } from "./helper";

function bookingsBinarySearch(bookings: Booking[], bookingId: number): Booking {
    let left: number = 0;
    let right: number = bookings.length - 1;

    while (left <= right) {
        const mid: number = Math.floor((left + right) / 2);

        if (bookings[mid].bookingId === bookingId) return bookings[mid];
        if (bookingId < bookings[mid].bookingId) right = mid - 1;
        else left = mid + 1;
    }

    throw HTTPError(400, 'booking not found');
}

// timeFrame: 'past', 'upcoming', 'ongoing', 'all'.
// Past bookings have already arrived at their destination,
// upcoming bookings are yet to depart from their origin,
// and so on.
export function searchBookings(userId: number, timeFrame: string, numBookings: number) {
    const data = getData();

    for (const user of data.users) {
        if (user.userId !== userId) {
            continue;
        }

        const reverseBookingIds = user.bookings.reverse();
        
        // O(m * log(n)), where m = user.bookings.length, n = data.bookings.length.
        // It assumes data.bookings is listed in ascending bookingId.
        // An O(n) algorithm is possible, but we expect n >> m.
        let userBookings: Booking[] = [];
        reverseBookingIds.forEach((bookingId: number) => {
            userBookings.push(bookingsBinarySearch(data.bookings, bookingId));
        });
        
        const curTime = new Date().toISOString();
        userBookings = userBookings
            .filter((booking) => {
                if (timeFrame === 'all') {
                    return true;
                }

                const trip = getTripById(booking.tripId);
                const route = getRouteById(trip.routeId);
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
            })
            .slice(0, numBookings);
        return { userBookings: userBookings };
    }

    // userId does not exist
    throw HTTPError(400, 'user not found');
}

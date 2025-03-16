import HTTPError from "http-errors";
import { booking } from "./interface";
import { getData } from "./dataStore";

function bookingsBinarySearch(bookings: booking[], bookingId: number): booking {
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

export function pastBookings(userId: number, numBookings?: number) {
    const data = getData();

    for (const user of data.users) {
        if (user.userId !== userId) {
            continue;
        }

        numBookings = typeof numBookings === 'undefined' ? user.bookings.length : Math.min(numBookings, user.bookings.length);
        const reverseBookingIds = user.bookings.reverse().slice(0, numBookings);
        
        // O(m * log(n)), where m = user.bookings.length, n = data.bookings.length.
        // It assumes data.bookings is listed in ascending bookingId.
        // An O(n) algorithm is possible, but we expect n >> m.
        let displayBookings: booking[] = [];
        reverseBookingIds.forEach((bookingId: number) => {
            displayBookings.push(bookingsBinarySearch(data.bookings, bookingId));
        })
        return { bookings: displayBookings };
    }
    
    // userId does not exist
    throw HTTPError(400, 'user not found');
}
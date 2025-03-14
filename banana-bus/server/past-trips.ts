import HTTPError from "http-errors";
import { trip } from "./interface"

function tripsBinarySearch(trips: trip[], tripId: number): trip {
    let left: number = 0;
    let right: number = trips.length - 1;

    while (left <= right) {
        const mid: number = Math.floor((left + right) / 2);

        if (trips[mid].tripId === tripId) return trips[mid];
        if (tripId < trips[mid].tripId) right = mid - 1;
        else left = mid + 1;
    }

    throw HTTPError(400, 'trip not found');
}

export function pastTrips(userId: number, numTrips?: number) {
    const data = getData();

    for (const user of data.users) {
        if (user.userId !== userId) {
            continue;
        }

        numTrips = typeof numTrips === 'undefined' ? user.trips.length : numTrips;
        const reverseTripIds = user.trips.reverse().slice(0, numTrips);
        
        // O(m * log(n)), where m = user.trips.length, n = data.trips.length.
        // It assumes data.trips is listed in ascending tripId.
        // An O(n) algorithm is possible, but we expect n >> m.
        let displayTrips: trip[] = [];
        reverseTripIds.forEach((tripId: number) => {
            displayTrips.push(tripsBinarySearch(data.trips, tripId));
        })
        return displayTrips;
    }
    
    // userId does not exist
    throw HTTPError(400, 'user not found');
}
import HTTPError from "http-errors";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";
import { isSameDay } from "date-fns";
import { getRouteById, getStopById } from "./helper";

import { Trip, TripBox, TripList } from "./interface";

export async function tripsList(routeId: ObjectId, departId: ObjectId, arriveId: ObjectId, date: string): Promise<TripList> {
    await connectToDatabase();
    
    if (!collections.trips || !collections.routes || !collections.stops) {
        throw HTTPError(500, 'Database collection is not initialized');
    }
    
    const lookUpDate = new Date(date)

    const route = await getRouteById(routeId)
    const trips: Trip[] = await collections.trips.find<Trip>({routeId: routeId}).toArray();
    
    const departStop = await getStopById(departId)
    const departIndex = route.stops.indexOf(departId)
    
    const arriveStop = await getStopById(arriveId)
    const arriveIndex = route.stops.indexOf(arriveId)
    
    const arriveName = arriveStop.name
    const departName = departStop.name
    
    // sample data for the frontend for a lookupDate (Creating 10 trips 30 interval from lookupDate)
    // we dont have trips on everyday in db yet
    // probs have a scheduler create new one daily
    for (let i= 1; i < 10; i++) {
        const stopTime1 = new Date(lookUpDate.getTime() + i * 30 * 60 * 1000);
        const stopTime2 = new Date(lookUpDate.getTime() + (i + 1) * 30 * 60 * 1000);
        trips.push(new Trip(new ObjectId(i+"a"), new ObjectId(1+"b"), routeId, [stopTime1, stopTime2]));
    } 

    // filter trips to contain only departures on lookUpDate
    const filteredTrips: Trip[] = trips.filter((t: Trip ) => {
        const tripDate = new Date(t.stopTimes[0])
        return isSameDay(tripDate, lookUpDate)
    })
     
    // convert dataStore info to tripBox(info needed by frontend)
    const tripBoxes: TripBox[] = filteredTrips.map((t: Trip) => ({
        tripId: t._id,
        departureTime: new Date(t.stopTimes[departIndex]),
        arrivalTime: new Date(t.stopTimes[arriveIndex]),
        // to be calculated using functions and vehicle info
        price: 20,
        curCapacity: 14,
        maxCapacity: 20,
        curLuggageCapacity: 5,
        maxLuggageCapacity: 10,
        luggagePrice: 20,
        disability: true, 
    }))

    return {
        departName,
        arriveName,
        trips: tripBoxes,
    }
}
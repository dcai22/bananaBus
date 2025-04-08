import HTTPError from "http-errors";
import { getData } from "./dataStore";
import { DataStore, Route, Stop, Trip, TripBox, TripList } from "./interface";
import { isSameDay } from "date-fns";

export function tripsList(routeId: number, departId: number, arriveId: number, date: string): TripList {
    //const data: dataStore = getData();

    // sample data used to test frontend
    const data: DataStore = {
        users: [],
        trips: [],
        bookings:[],
        routes: [ new Route(1, [1, 2], [0]) ],
        stops: [
            new Stop(1, "airport"),
            new Stop(2, "utama mall"),
        ],
    }
    

    
    const route = data.routes.find(r => r.routeId === routeId)
    if (!route) throw HTTPError(400, `RouteId ${routeId} not found`);
    
    const lookUpDate = new Date(date)
    
    // adding sample trips for testing frontend
    data.trips.push({
        tripId: 0,
        vehicleId: 1,
        routeId: 1,
        stopTimes:[
            new Date(lookUpDate.getTime()).toISOString(),
            new Date(lookUpDate.getTime() + 30 * 60 * 1000).toISOString()
        ],
        bookings: []
    })
    for (let i= 1; i < 10; i++) {
        route.trips.push(i)

        const stopTime1 = new Date(lookUpDate.getTime() + i *30 * 60 * 1000);
        const stopTime2 = new Date(lookUpDate.getTime() + (i + 1) * 30 * 60 * 1000);
        data.trips.push(new Trip(i, 1, 1, [stopTime1, stopTime2]));
    } 

    const departStop = data.stops.find(s => s.stopId === departId)
    if (!departStop) throw HTTPError(400, `DepartId ${departId} not found`);
    const departIndex = route.stops.indexOf(departId)
    const departName = departStop.name
    
    const arriveStop = data.stops.find(s => s.stopId === arriveId)
    if (!arriveStop) throw HTTPError(400, `ArriveId ${arriveId} not found`);
    const arriveIndex = route.stops.indexOf(arriveId)
    const arriveName = arriveStop.name
    
    const trips: Trip[] = data.trips
                              .filter((t: Trip ) => t.routeId === routeId)
                              .filter((t: Trip ) => {
                                const tripDate = new Date(t.stopTimes[0])
                                const searchDate = new Date(date)
                                return isSameDay(tripDate, searchDate)
                              })
     
    // convert dataStore info to tripBox(info needed by frontend)
    const tripBoxes: TripBox[] = trips.map((t: Trip) => ({
        tripId: t.tripId,
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
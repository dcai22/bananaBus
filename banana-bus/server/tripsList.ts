import HTTPError from "http-errors";
import { getData } from "./dataStore";
import { DataStore, Trip, TripBox, TripList } from "./interface";
import { isSameDay } from "date-fns";

export function tripsList(routeId: number, departId: number, arriveId: number, date: string): TripList {
    //const data: dataStore = getData();

    // sample data used to test frontend
    const data: DataStore = {
      users: [],
      trips: [],
      bookings:[],
      routes: [{
        routeId: 1,
        stops: [1, 2],
        trips: [0]
      }],
      stops: [
        {
          stopId: 1,
          name: "airport"
        },
        {
          stopId: 2,
          name: "utama mall"
        }
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
      data.trips.push({
        tripId: i,
        vehicleId: 1,
        routeId: 1,
        stopTimes:[
          new Date(lookUpDate.getTime() + i *30 * 60 * 1000).toISOString(),
          new Date(lookUpDate.getTime() + (i + 1) * 30 * 60 * 1000).toISOString()
        ],
        bookings: []
    })
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
    }))

    return {
      departName,
      arriveName,
      trips: tripBoxes,
    }
}
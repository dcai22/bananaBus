import HTTPError from "http-errors";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { findUserByToken, getRouteById, getStopById, getTripById, getVehicleById } from "./helper";
import { Booking, Trip, TripInfo, TripList, Vehicle } from "./interface";

const timezone = "Australia/Sydney"

export async function tripsList(token: string, routeId: ObjectId, departId: ObjectId, arriveId: ObjectId, date: string): Promise<TripList> {
    await connectToDatabase();
    
    if (!collections.trips || !collections.routes || !collections.stops) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    } 
    
    const route = await getRouteById(routeId)

    // define Start and end of date
    const dateStart = toZonedTime(date, timezone)
    dateStart.setHours(0,0,0,0);
    const dateEnd = toZonedTime(date, timezone)
    dateEnd.setHours(23,59,59,999);

    let trips: Trip[] = []
    // filters trips to the date
    trips = await collections.trips?.find<Trip>({
        routeId: routeId,
        "stopTimes.0": {"$gte": fromZonedTime(dateStart, timezone), "$lte": fromZonedTime(dateEnd, timezone)}
    }).toArray();

    // check if trips exist
    if (trips.length === 0) {
        trips = await generateTrips(routeId, date)
    }

    const departStop = await getStopById(departId)
    const departIndex = route.stops.findIndex(id => id.equals(departId))
    
    const arriveStop = await getStopById(arriveId)
    const arriveIndex = route.stops.findIndex(id => id.equals(arriveId))
    
    const arriveName = arriveStop.name
    const departName = departStop.name

    // convert dataStore info to tripBox(info needed by frontend)
    const tripBoxes = await Promise.all(
        trips.map(async (t) => {
            const vehicle = await getVehicleById(t.vehicleId);
        
            return {
            tripId: t._id,
            departId: departId,
            arriveId: arriveId,
            departureTime: new Date(t.stopTimes[departIndex]),
            arrivalTime: new Date(t.stopTimes[arriveIndex]),
            price: 20,
            curCapacity: await calcCurrentCapacity(t),
            maxCapacity: vehicle.maxCapacity,
            curLuggageCapacity: await calcCurrentLuggageCapacity(t),
            maxLuggageCapacity: vehicle.maxLuggageCapacity,
            luggagePrice: 20,
            hasAssist: vehicle.hasAssist,
            };
        })
    );

    return {
        departName,
        arriveName,
        trips: tripBoxes,
    }
}



// Used to generate trips for a given day if no fixed trips are on day
async function generateTrips(routeId: ObjectId, dateString: string) {
    await connectToDatabase();
    
    const route = await getRouteById(routeId)
    
    //create sample vehicle
    //to be replaced with actual vehicle
    
    const vehicle: Vehicle = {
        _id: new ObjectId(),
        maxCapacity: 20,
        maxLuggageCapacity: 20,
        hasAssist: true,
        numberPlate: "abc123"
    }

    await collections.vehicles?.insertOne(vehicle)

    let trips: Trip[] = []
    
    // generate a trip every hr from 8am - 5pm
    for (let hr = 8; hr <= 17; hr++) {
        const departDate = toZonedTime(dateString, timezone)
        departDate.setHours(hr, 0, 0 , 0)

        const stopTimes = route.stops.map((_, i) => {
            const stopTime = new Date(departDate.getTime() + i * 30 * 60 * 1000)
            return fromZonedTime(stopTime, timezone)
        })

        trips.push({
            _id: new ObjectId(),
            vehicleId: vehicle._id,
            routeId: routeId,
            stopTimes: stopTimes,					
            bookings: [],
        })
    }

    const tripIds = trips.map(t => t._id)
    await collections.routes?.updateOne(
        {_id: routeId},
        { $push: { trips: {$each: tripIds}}}
    )
    await collections.trips?.insertMany(trips)

    return trips
}

// Get a trips info (for booking page)
export async function getTrip(token: string, departId: ObjectId, arriveId: ObjectId, tripId: ObjectId): Promise<TripInfo> {
    await connectToDatabase();
    
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const trip = await getTripById(tripId)
    const route = await getRouteById(trip.routeId)
    const vehicle = await getVehicleById(trip.vehicleId);

    const departStop = await getStopById(departId)
    const departIndex = route.stops.findIndex(id => id.equals(departId))
    
    const arriveStop = await getStopById(arriveId)
    const arriveIndex = route.stops.findIndex(id => id.equals(arriveId))
    
    const arriveName = arriveStop.name
    const departName = departStop.name


    const tripBox = {
        tripId: tripId,
        departId: departId,
        arriveId: arriveId,
        departureTime: trip.stopTimes[departIndex],
        arrivalTime: trip.stopTimes[arriveIndex],
        price: 20,
        curCapacity: await calcCurrentCapacity(trip), 
        maxCapacity: vehicle.maxCapacity,
        curLuggageCapacity: await calcCurrentLuggageCapacity(trip),
        maxLuggageCapacity: vehicle.maxLuggageCapacity,
        luggagePrice: 10,
        hasAssist: vehicle.hasAssist, 
    }

    return ({
      departName,
      arriveName,
      trip: tripBox,
    })
}

async function calcCurrentCapacity(trip: Trip) {
  const bookings = await collections.bookings?.find<Booking>({ _id: { $in: trip.bookings } }).toArray();
  if (!bookings) throw HTTPError(400, "Cant get bookings")
  // could probs calc through max of the interval
  return bookings.reduce((sum, b) => sum + b.numTickets, 0)
}

async function calcCurrentLuggageCapacity(trip: Trip) {
  const bookings = await collections.bookings?.find<Booking>({ _id: { $in: trip.bookings } }).toArray();
  if (!bookings) throw HTTPError(400, "Cant get bookings")
  // could probs calc through max of the interval
  return bookings.reduce((sum, b) => sum + b.numLuggage, 0)
}

async function getPrice(){

}
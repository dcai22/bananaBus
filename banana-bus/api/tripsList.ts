import HTTPError from "http-errors";
import { collections, connectToDatabase } from "./mongoUtil";
import { ObjectId } from "mongodb";
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { findUserByToken, getRouteById, getStopById, getTripById, getVehicleById } from "./helper";
import { Booking, Trip, TripInfo, TripList, Vehicle } from "./interface";
import { differenceInCalendarDays } from 'date-fns';

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
    
    const route = await getRouteById(routeId);

    // define Start and end of date
    const dateStart = toZonedTime(date, timezone);
    dateStart.setHours(0,0,0,0);
    const dateEnd = toZonedTime(date, timezone);
    dateEnd.setHours(23,59,59,999);

    let trips: Trip[] = []
    // filters trips to the date
    trips = await collections.trips?.find<Trip>({
        routeId: routeId,
        "stopTimes.0": {"$gte": fromZonedTime(dateStart, timezone), "$lte": fromZonedTime(dateEnd, timezone)}
    }).toArray();

    
    const departStop = await getStopById(departId);
    const departIndex = route.stops.findIndex(id => id.equals(departId));
    
    const arriveStop = await getStopById(arriveId);
    const arriveIndex = route.stops.findIndex(id => id.equals(arriveId));
    
    const arriveName = arriveStop.name;
    const departName = departStop.name;
    
    // check if trips exist else generate some trips
    if (trips.length === 0) {
        const today = toZonedTime(new Date(), timezone);
        const dayDiff = differenceInCalendarDays(dateStart, today);

        // prevent generating trips more than a week ahead
        if (dayDiff > 7) {
            return {
                departName,
                arriveName,
                trips: [],
            }
        }

        trips = await generateTrips(routeId, date);
    }
    
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
    
    const route = await getRouteById(routeId);
    
    let trips: Trip[] = []
    // generate a trip every hr from 8am - 5pm
    for (let hr = 8; hr <= 17; hr++) {
        const departDate = toZonedTime(dateString, timezone);
        departDate.setHours(hr, 0, 0 , 0);

        // TODO replace with actual stopTimes
        const stopTimes = route.stops.map((_, i) => {
            const stopTime = new Date(departDate.getTime() + i * 30 * 60 * 1000);
            return fromZonedTime(stopTime, timezone);
        })

        const start = stopTimes[0];
        const end = stopTimes[stopTimes.length - 1];

        const vehicle = await findAvailableVehicle(start, end);
        console.log(vehicle)
        if (!vehicle) {
            // TODO alert manager somehow
            console.log(`no vehicle available for ${hr}`);
            continue;
        }
        
        const trip = {
            _id: new ObjectId(),
            vehicleId: vehicle._id,
            routeId: routeId,
            stopTimes: stopTimes,					
            bookings: [],
        }

        await collections.trips?.insertOne(trip);
        trips.push(trip);
    }

    // TODO: alert manager
    // checks if no trips are generates i.e no available vehicles
    /* if (trips.length === 0) {
    } */

    // add tripId to route
    const tripIds = trips.map(t => t._id);
    await collections.routes?.updateOne(
        {_id: routeId},
        { $push: { trips: {$each: tripIds}}}
    )

    return trips;
}

// finds any available vehicle (to assign to a trip)
async function findAvailableVehicle(start: Date, end: Date): Promise<Vehicle | null> {
    await connectToDatabase();

    if (!collections.trips || !collections.vehicles) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    // buffer time for vehicle (mins)
    const bufferTime = 60;
    
    const bufferedStart = new Date(start.getTime() - bufferTime * 60 * 1000);
    const bufferedEnd = new Date(end.getTime() + bufferTime * 60 * 1000);

    // find trips that overlap within the buffered times
    const overlappingTrips = await collections.trips.find<Trip>({
        $or: [
          { "stopTimes.0": { $lt: bufferedEnd }, "stopTimes": { $elemMatch: { $gt: bufferedStart } } }
        ]
      }).toArray();

    // extract vehicle ids from trips
    const unavailableVehiclesIds = overlappingTrips.map(t => t.vehicleId);

    // get any vehicle not in array
    const availableVehicle = await collections.vehicles.findOne<Vehicle>({
        _id: {$nin: unavailableVehiclesIds }
    })

    return availableVehicle
}

// Get a trips info (for booking page)
export async function getTrip(token: string, departId: ObjectId, arriveId: ObjectId, tripId: ObjectId): Promise<TripInfo> {
    await connectToDatabase();
    
    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);

    if (!user) {
        throw HTTPError(403, 'invalid token');
    }

    const trip = await getTripById(tripId);
    const route = await getRouteById(trip.routeId);
    const vehicle = await getVehicleById(trip.vehicleId);

    const departStop = await getStopById(departId)
    const departIndex = route.stops.findIndex(id => id.equals(departId));
    
    const arriveStop = await getStopById(arriveId)
    const arriveIndex = route.stops.findIndex(id => id.equals(arriveId));
    
    const arriveName = arriveStop.name;
    const departName = departStop.name;


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
  if (!bookings) throw HTTPError(400, "Cant get bookings");
  // could probs calc through max of the interval
  return bookings.reduce((sum, b) => sum + b.numTickets, 0)
}

async function calcCurrentLuggageCapacity(trip: Trip) {
  const bookings = await collections.bookings?.find<Booking>({ _id: { $in: trip.bookings } }).toArray();
  if (!bookings) throw HTTPError(400, "Cant get bookings");
  // could probs calc through max of the interval
  return bookings.reduce((sum, b) => sum + b.numLuggage, 0)
}
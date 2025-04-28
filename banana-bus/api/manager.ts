import HTTPError from "http-errors";
import { ObjectId, DeleteResult  } from "mongodb";
import { collections, connectToDatabase } from "./mongoUtil";
import { Vehicle } from "./interface";
import { findUserByToken } from "./helper";

/**
 * Adds a vehicle to the database
 * @param token                 token of user
 * @param maxCapacity           max passenger capacity of vehicle
 * @param maxLuggageCapacity    max luggage capacity of vehicle
 * @param hasAssist             whether vehicle has disability accessibility
 * @param numberPlate           number plate of vehicle
 * @param model                 model of vehicle
 * @returns                     vehicle object that was inserted to database
 */
export async function addVehicle(token: string, maxCapacity: number, maxLuggageCapacity: number, hasAssist: boolean, numberPlate: string, model: string): Promise<Vehicle> {
    await connectToDatabase();

    if (!collections.vehicles) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isManager) {
        throw HTTPError(403, "user is not a manager");
    }
    
    const checkVehicleExist = await collections.vehicles?.findOne({ numberPlate: numberPlate });
    if (checkVehicleExist) {
        throw HTTPError(409, 'Vehicle with number plate already in database');
    }    

    const newVehicle: Vehicle = {
        _id: new ObjectId(),
        maxCapacity: maxCapacity,
        maxLuggageCapacity: maxLuggageCapacity,
        hasAssist: hasAssist,
        numberPlate: numberPlate,
        model,
        reports: []
    };

    const added_vehicle = await collections.vehicles.insertOne(newVehicle);
    
    if (!added_vehicle) {
        throw HTTPError(500, 'Failed to add vehicle to database');
    }

    return newVehicle;
}


/**
 * Removes a vehicle from the database
 * @param token         token of user
 * @param vehicleId     id of vehicle to be deleted
 * @returns 
 */
export async function deleteVehicle(token: string, vehicleId: ObjectId) {
    await connectToDatabase();

    if (!collections.vehicles || !collections.trips) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isManager) {
        throw HTTPError(403, "user is not a manager");
    }

    const now = new Date();

    const conflictingTrip = await collections.trips.findOne({ vehicleId, stopTimes: { $gt: now }});

    if (conflictingTrip) {
        throw HTTPError(409, 'Vehicle is currently assigned to a trip');
    }
    const result: DeleteResult = await collections.vehicles.deleteOne({ _id: vehicleId });
    
    if (result.deletedCount === 0) {
        throw HTTPError(404, 'Vehicle not found');
    }
        
    return {};
}

/**
 * Edits a vehicle in database
 * @param token                 token of user
 * @param vehicleId             id of vehicle to be edited
 * @param maxCapacity           max passenger capacity of vehicle
 * @param maxLuggageCapacity    max luggage capacity of vehicle
 * @param hasAssist             whether vehicle has disability accessibility
 * @param numberPlate           number plate of vehicle
 * @param model                 model of vehicle
 * @returns                     vehicle object that was edited in database
 */
export async function editVehicle(token: string,  vehicleId: ObjectId, maxCapacity: number, maxLuggageCapacity: number, hasAssist: boolean, numberPlate: string, model: string): Promise<Vehicle>{
    await connectToDatabase();

    if (!collections.vehicles) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isManager) {
        throw HTTPError(403, "user is not a manager");
    }

    const existing = await collections.vehicles.findOne({ numberPlate, _id: { $ne: vehicleId }});
    if (existing) {
        throw HTTPError(409, 'Another vehicle with that number plate already exists');
    }

    const vehicle = await collections.vehicles.findOne({ _id: vehicleId });
    if (!vehicle) {
        throw HTTPError(404, 'Vehicle not found');
    }

    const result = await collections.vehicles.findOneAndUpdate(
        { _id: vehicleId },
        {
          $set: { maxCapacity, maxLuggageCapacity, hasAssist, numberPlate, model }
        },
        { returnDocument: 'after' }
      );
    
    if (!result) {
        throw HTTPError(500, 'Failed to update vehicle');
    }

    return result;
}

/**
 * Adds a route to the database
 * @param token     token of user
 * @param stops     stops in the route
 * @returns 
 */
export async function createRoute(token: string, stops: ObjectId[]) {
    await connectToDatabase();
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isManager) {
        throw HTTPError(403, "user is not a manager");
    }

    const dbRes = await collections.routes?.insertOne({
        _id: new ObjectId(),
        stops,
        trips: [],
    });
    return { insertedId: dbRes?.insertedId };
}

/**
 * Deletes a route from the database
 * @param token         token of user
 * @param routeId       route to be deleted
 * @returns 
 */
export async function deleteRoute(token: string, routeId: ObjectId) {
    await connectToDatabase();
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isManager) {
        throw HTTPError(403, "user is not a manager");
    }

    await collections.routes?.deleteOne({ _id: routeId });
    return {};
}

/**
 * Returns all stops in database
 * @param token     token of user
 * @returns         all stops in database
 */
export async function allStops(token: string) {
    await connectToDatabase();
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isManager) {
        throw HTTPError(403, "user is not a manager");
    }

    const stops = await collections.stops?.find().toArray();
    return stops;
}

/**
 * returns all vehicles in database
 * @param token     token of user
 * @returns         vehicles in database
 */
export async function allVehicles(token: string) {
    await connectToDatabase();
    const strippedToken = token.replace("Bearer ", "");
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, "invalid token");
    }
    if (!user.isManager) {
        throw HTTPError(403, "user is not a manager");
    }

    const vehicles = await collections.vehicles?.find().toArray();
    return { vehicles };
}

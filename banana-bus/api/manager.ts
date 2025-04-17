import HTTPError from "http-errors";
import { ObjectId  } from "mongodb";
import { collections, connectToDatabase } from "./mongoUtil";
import { User, Vehicle } from "./interface";
import { findUserByToken } from "./helper";

export async function addManager(token: string) {
    await connectToDatabase();

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    if (user.isManager) {
        throw HTTPError(400, 'user is already a manager');
    }
    user.isManager = true;
    await collections.users?.updateOne({ userId: user._id }, user);
    return user;
}

export async function removeManager(token: string) {
    await connectToDatabase();

    const strippedToken = token.replace('Bearer ', '');
    const user = await findUserByToken(strippedToken);
    if (!user) {
        throw HTTPError(403, 'invalid token');
    }
    if (!user.isManager) {
        throw HTTPError(403, 'user is not a manager');
    }
    user.isManager = false;
    await collections.users?.updateOne({ userId: user._id }, user);
    return user;
}


export async function addVehicle(maxCapacity: number, maxLuggageCapacity: number, hasAssist: boolean, numberPlate: string): Promise<Vehicle> {
    await connectToDatabase();

    if (!collections.vehicles) {
            throw HTTPError(500, 'Database collection is not initialized');
        }
    
    const checkVehicleExist = await collections.vehicles?.findOne({ numberPlate: numberPlate });
        if (checkVehicleExist) {
            throw HTTPError(400, 'Vehicle with number plate already in database');
        }

    

    const newVehicle: Vehicle = {
        _id: new ObjectId(),
        maxCapacity: maxCapacity,
        maxLuggageCapacity: maxLuggageCapacity,
        hasAssist: hasAssist,
        numberPlate: numberPlate
    };

    const added_vehicle = await collections.vehicles.insertOne(newVehicle);
    
    if (!added_vehicle) {
        throw HTTPError(500, 'Failed to add vehicle to database');
    }

    return newVehicle;
}



export async function deleteVehicle(vehicleId: ObjectId) {
    await connectToDatabase();

    if (!collections.vehicles) {
        throw HTTPError(500, 'Database collection is not initialized');
    }

    const vehicle = await collections.vehicles?.findOne({ _id: vehicleId });
    if (!vehicle) {
        throw HTTPError(400, 'vehicle not found');
    }
        
    user.isManager = false;
    await collections.users?.updateOne({ userId: user._id }, user);
    return user;

    
}

export async function editVehicle(){
    await connectToDatabase();

}



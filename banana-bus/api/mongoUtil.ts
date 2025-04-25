import * as mongoDB from "mongodb";
import dotenv from "dotenv";
import { Booking, Route, Stop, Trip, User, Vehicle } from "./interface";

dotenv.config();
let dbName = process.env.MONGO_DBNAME || "test";

export const collections: {
    users?: mongoDB.Collection<User>;
    trips?: mongoDB.Collection<Trip>;
    bookings?: mongoDB.Collection<Booking>;
    routes?: mongoDB.Collection<Route>;
    stops?: mongoDB.Collection<Stop>;
    vehicles?: mongoDB.Collection<Vehicle>;
} = {};

let mongoClient: mongoDB.MongoClient | null = null;
let database: mongoDB.Db | null = null;

export async function connectToDatabase() {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in the environment variables");
    }
    try {
        if (mongoClient && database) {
            console.log("Already connected to MongoDB");
        } else {
            mongoClient = new mongoDB.MongoClient(process.env.MONGODB_URI);
            await mongoClient.connect();
            database = mongoClient.db(dbName);
            console.log("New connection to MongoDB established");
        }
        collections.users = database.collection("users");
        collections.trips = database.collection("trips");
        collections.bookings = database.collection("bookings");
        collections.routes = database.collection("routes");
        collections.stops = database.collection("stops");
        collections.vehicles = database.collection("vehicles");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        throw new Error("Failed to connect to MongoDB");
    }
} 

export async function closeConnection() {
    if (mongoClient) {
        await mongoClient.close();
        console.log("MongoDB connection closed");
    } else {
        console.log("No MongoDB connection to close");
    }
}

import * as mongoDB from "mongodb";
let connectionString = "mongodb+srv://COMP3900_banana:MoOdnJX5rmjYAFDC@bananabus.f4d4u.mongodb.net/?retryWrites=true&w=majority&appName=bananabus";
let dbName = "banana";

export const collections: {
    users?: mongoDB.Collection;
    trips?: mongoDB.Collection;
    bookings?: mongoDB.Collection;
    routes?: mongoDB.Collection;
    stops?: mongoDB.Collection;
} = {};

export async function connectToDatabase() {
    const client = new mongoDB.MongoClient(connectionString);
    await client.connect();
    const db = client.db(dbName);
    collections.users = db.collection("users");
    collections.trips = db.collection("trips");
    collections.bookings = db.collection("bookings");
    collections.routes = db.collection("routes");
    collections.stops = db.collection("stops");
    console.log("Connected to MongoDB");
}
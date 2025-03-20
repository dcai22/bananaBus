import { DataStore } from "./interface";
import fs from 'fs';

let data: DataStore = {
    users: [],
    trips: [],
    bookings: [],
    routes: [],
    stops: [],
}

export function getData() {
    return data;
}

export function setData(newData: DataStore) {
    data = newData;
    // const dataOut = JSON.stringify(newData, null, 2);
    // fs.writeFileSync('./data.json', dataOut, { flag: 'w' }); // for testing
}
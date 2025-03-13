import { dataStore } from "./interface";
import fs from 'fs'

let data: dataStore = {
    users: [],
}

export function getData() {
    return data;
}

export function setData(newData: dataStore) {
    data = newData;
    const dataOut = JSON.stringify(newData, null, 2);
    fs.writeFileSync('./data.json', dataOut, { flag: 'w' }); // for testing
}
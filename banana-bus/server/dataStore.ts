import { dataStore } from "./interface";

let data: dataStore = {
    users: [],
}

export function getData() {
    return data;
}

export function setData(newData: dataStore) {
    data = newData;
}
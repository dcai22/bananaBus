/**
 * Interface File for Banana Bus App frontend
 * This file contains the interface definitions for various components and data structures used in the app.
 */

/**
 * TripBox interface
 * used for displaying trip information in the trip list
 */
export interface TripBox {
    tripId: string,
    departId: string,
    arriveId: string,
    departureTime: Date,
    arrivalTime: Date,
    price: number,
    curCapacity: number, 
    maxCapacity: number,
    curLuggageCapacity: number,
    maxLuggageCapacity: number,
    luggagePrice: number,
    hasAssist: boolean,
}

/**
 * Promotion interface
 * used for deals and promotions from 1 Utama mall
 */
export interface Promotion {
    title: string,
    description: string,
    location: string,
    img: string,
    validFrom: string,
    validTo: string
}

/**
 * Vehicle interface
 * used for displaying vehicle information in the manage vehicles
 */
export interface Vehicle {
    _id: string,
    maxCapacity: number,
    maxLuggageCapacity: number,
    hasAssist: boolean,
    model: string,
    numberPlate: string,
    reports: Report[],
}

export default {};
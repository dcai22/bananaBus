import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { format, formatDistance } from "date-fns";
import { router } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, Alert} from "react-native";

// produce text for time distance from now to departure time
interface TripBox {
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

function timeTillDepart(departureTime: Date) {
    const now = new Date()
    let text = formatDistance(departureTime, now, { addSuffix: true})
    text = text.replace("in ", "")
               .replace("minute", "min")
               .replace("hour", "hr")
               .replace("month", "mth")
               .replace("year", "yr")
               .replace("less than a ", "< 1 ")
               .replace("about ", "~")
    return text
} 

// (to be reused in booking page/ past trips)
export default function TripListBox({ trip, disabled = true}: { trip: TripBox; disabled?: boolean }) {
    const nowToDepart = timeTillDepart(trip.departureTime)

    const departed = nowToDepart.endsWith("ago")

    function handlePress() {
        if (!departed && !disabled) {
            router.push({
                pathname: '/booking',
                params: { 
                    departId: `${trip.departId}`,
                    arriveId: `${trip.arriveId}`,
                    tripId: `${trip.tripId}`
                },
            })
        } else {
            // make a pop up or something
            Alert.alert("Trip has already departed or is unavailable.");
        }
    }

    const isCapacityFull = trip.curCapacity === trip.maxCapacity

    // Used to determine luggage icon colours
    const isLuggageFull = trip.curLuggageCapacity === trip.maxLuggageCapacity
    const isLuggageLessThanThird = trip.curLuggageCapacity <= (trip.maxLuggageCapacity / 3) 
    const isLuggageEmpty = trip.curLuggageCapacity === 0
    
    return(
        <TouchableOpacity onPress={handlePress} testID="trip-list-box">
            <View style = {styles.tripListContainer}>
                <View style = {[styles.timeTillDepartContainer, departed && styles.departedContainer]}>
                    <Text style = {styles.timeTillDepartText}>{nowToDepart}</Text>
                </View>
                <View style = {styles.infoContainer}>
                    <View style = {styles.leftInfoContainer}>
                        <Text style = {styles.pickUpLocation}>Bus Stand</Text>
                        <Text style = {styles.departTime}>{format(trip.departureTime, "HH:mm")}</Text>
                        <View style = {styles.trackingContainer}>
                            {/* need to calc whether bus is late */}
                            <FontAwesome name="square" style= {styles.trackingSquare}></FontAwesome>
                            <Text style = {styles.trackingText}>On Time</Text>
                        </View>
                    </View>
                    <View style = {styles.rightInfoContainer}>
                        <Text style = {styles.price}>RM {trip.price}</Text>
                        <Text style = {styles.arriveTime}>{format(trip.arrivalTime, "HH:mm")}</Text>
                        <View style = {styles.capacityContainer}>
                            <FontAwesome name="wheelchair" 
                                style = {[
                                    styles.wheelchair,
                                    trip.hasAssist && styles.wheelchairAvailable
                                ]}
                            />
                            <View style = {styles.luggageContainer}>
                                <FontAwesome name="suitcase" 
                                    style = {[
                                        styles.luggage,
                                        isLuggageFull && styles.full,
                                        isLuggageEmpty && styles.luggageGrey
                                    ]}
                                />
                                <FontAwesome name="suitcase" 
                                    style = {[
                                        styles.luggage,
                                        isLuggageFull && styles.full,
                                        isLuggageLessThanThird && styles.luggageGrey
                                    ]}
                                />
                                <FontAwesome name="suitcase" 
                                    style = {[
                                        styles.luggage,
                                        styles.luggageGrey,
                                        isLuggageFull && styles.full,
                                    ]}
                                 />
                            </View>
                            <Text 
                                style = {[
                                    styles.personCapacity,
                                    isCapacityFull && styles.full
                                ]}
                            >
                                {trip.curCapacity}/{trip.maxCapacity}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    tripListContainer: {
        backgroundColor: "white",
        marginBottom: 15,
        boxShadow: "0px 2px 5px -2px grey",
        borderRadius: 10,     
        flexDirection: "row",
        height: 75,
        width: "100%"
    },
    timeTillDepartContainer: {
        backgroundColor: "#266ce5",
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        width: 75,
        justifyContent: "center",
    },
    departedContainer: {
        backgroundColor: "red",
    },
    timeTillDepartText: {
        color: "white",
        textAlign: "center",
        fontSize: 17,
    },
    infoContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
    },
    leftInfoContainer:{
        justifyContent: 'space-between',
    },
    pickUpLocation: {
        fontWeight: "200",
        fontSize: 12,
    },
    departTime: {
        fontWeight: "bold",
    },
    trackingContainer: {
        flexDirection: "row",
    },
    trackingSquare: {
        color: "green",
        padding: 2,
    },
    trackingText: {
        fontWeight: "200",
        fontSize: 12,
        paddingLeft: 3,
    },
    rightInfoContainer: {
        justifyContent: "space-between",
    },
    price: {
        textAlign: "right",
        fontWeight: "200",
        fontSize: 12,
    },
    arriveTime: {
        textAlign: "right",
        fontWeight: "bold",
    },
    capacityContainer: {
        flexDirection: "row"
    },
    wheelchair: {
        fontSize: 10,
        margin: 2,
        paddingRight: 2,
        color: "red"
    },
    wheelchairAvailable: {
        color: "green"
    },
    luggageContainer: {
        flexDirection: "row",
        padding: 2,
    },
    luggage: {
        fontSize: 10,
        margin: 1,
        color: "black"
    },
    luggageGrey: {
        color: "grey"
    },
    full: {
        color: "red"
    },
    personCapacity: {
        fontWeight: "200",
        fontSize: 12,
        paddingLeft: 3,
    }
});
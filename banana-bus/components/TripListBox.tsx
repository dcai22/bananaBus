import FontAwesome from "@expo/vector-icons/FontAwesome";
import { format, formatDistance } from "date-fns";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, StyleSheet} from "react-native";

// produce text for time distance from now to departure time
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

// move to a component (to be reused in booking page/ past trips)
export default function TripListBox(trip) {
    // TODO: get actual numbers from backend
    const vehicleCur = 14 // needs to be calculated depending on bookings
    const vehicleMax = 16 // should store in vehicle and get vehicle from id

    const nowToDepart = timeTillDepart(trip.departureTime)

    return(
        <View style = {styles.tripListContainer}>
            <View style = {[styles.timeTillDepartContainer, nowToDepart.endsWith("ago") && styles.departedContainer]}>
                {/* to be replaced with function time till depart*/}
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
                    <Text style = {styles.price}>{trip.price}RM</Text>
                    <Text style = {styles.arriveTime}>{format(trip.arrivalTime, "HH:mm")}</Text>
                    <View style = {styles.capacityContainer}>
                        {/* calc disabled space */}
                        <FontAwesome name="wheelchair" style = {styles.wheelchair}></FontAwesome>
                        <View style = {styles.luggageContainer}>
                            {/* calc luggage space */}
                            <FontAwesome name="suitcase" style = {styles.luggage1}></FontAwesome>
                            <FontAwesome name="suitcase" style = {styles.luggage2}></FontAwesome>
                            <FontAwesome name="suitcase" style = {styles.luggage3}></FontAwesome>
                        </View>
                        <Text style = {styles.personCapacity}>{vehicleCur}/{vehicleMax}</Text>
                    </View>
                </View>
            </View>
        </View>
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
    },
    luggageContainer: {
        flexDirection: "row",
        padding: 2,
    },
    luggage1: {
        fontSize: 10,
        margin: 1,
        color: "black"
    },
    luggage2: {
        fontSize: 10,
        margin: 1,
        color: "black"
    },
    luggage3: {
        fontSize: 10,
        margin: 1,
        color: "black"
    },
    personCapacity: {
        fontWeight: "200",
        fontSize: 12,
        paddingLeft: 3,
    }
});
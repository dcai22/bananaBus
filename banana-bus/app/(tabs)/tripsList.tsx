import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, StyleSheet} from "react-native";
import { format } from "date-fns"
import TripListBox from "@/components/TripListBox";

// TODO: fix up stack/tabs so router back works properly

// sample routes
// TODO: redo data storage
const currentTime = new Date()
const routes = [{
    routeId: 1,
    stops: [
        {
            id: 1,
            name: "airport"
        },
        {
            id: 2,
            name: "utama mall"
        }
    ],
    trips: [
        {
            id: 123,
            vehicleId: 1,
            price: 20,
            departureTime: currentTime,
            arrivalTime: currentTime,
        }
    ]
}]


export default function tripsList() {
    const { routeId, departId, arriveId, date } = useLocalSearchParams<{routeId: string; departId: string; arriveId: string, date: string}>()

    const lookUpDate = new Date(date)
    // TODO: to be moved to backend that returns object with info
    const route = routes.find(r => r.routeId === parseInt(routeId))
    if (!route) return <Text>unknown routeid</Text>

    const arriveName = route.stops.find(s => s.id === parseInt(arriveId))?.name
    const departName = route.stops.find(s => s.id === parseInt(departId))?.name
    ///////////////////////////////////////////////////////////

    // TODO: make more responsive to screen size and create stylesheets
    
    route?.trips.push({
        id: 123,
        vehicleId: 1,
        price: 20,
        departureTime: new Date(lookUpDate.getTime() + 1 * 60 * 1000),
        arrivalTime: new Date(lookUpDate.getTime() + 2 * 60 * 1000),
    })
    // simulate trips data with 30 min interval 
    for (let i= 1; i < 10; i++) {
        route?.trips.push({
            id: 123,
            vehicleId: 1,
            price: 20,
            departureTime: new Date(lookUpDate.getTime() + i *30 * 60 * 1000),
            arrivalTime: new Date(lookUpDate.getTime() + (i + 1) * 30 * 60 * 1000),
        })
    }

    // TODO: add refresh

    
    
    return (
        <View style={styles.screen}>
            <View style= {styles.header}>
                <View style={styles.goBackContainer}>
                    <FontAwesome name="arrow-left" style = {styles.goBackArrow} onPress={() => router.back()}></FontAwesome>
                    <Text style = {styles.goBackText} onPress={() => router.back()}>go back</Text>
                </View>
                <View style = {styles.locationContainer}>
                    <Text style = {styles.departText}>{departName}</Text>
                    <View style={styles.arriveContainer}>
                        <FontAwesome name="arrow-right" style = {styles.arriveArrow}></FontAwesome>
                        <Text style = {styles.arriveText}>{arriveName}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.tripListContainer}>   
            <Text style = {styles.tripListDate}>{format(date, "E, do LLL y")}</Text>
                <View>
                    {route.trips.map(t => TripListBox(t))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        height: "100%",
        backgroundColor: "lightblue",
        overflowY: "scroll",
    },
    header: {
        backgroundColor: "white",
        height: "20%",
        padding: 20,
        boxShadow: "0px 0px 5px grey"
    },
    goBackContainer: {
        height: "20%",
        flexDirection: "row",
    },
    goBackArrow: {
        paddingTop: 5,
        color: "#009cff",
        fontSize: 20,
    },
    goBackText: {   
        fontWeight: "bold",
        fontSize: 20,
        color: "#009cff",
        paddingLeft: 10,
    },
    locationContainer: {
        justifyContent: "center",
        height: "80%" 
    }, 
    departText: {
        fontWeight: "bold",
        fontSize: 25,
        marginTop: 10,
    },
    arriveContainer: {
        flexDirection: "row"
    },
    arriveArrow: {
        paddingTop: 5,
        fontSize: 25,
    },
    arriveText: {
        fontWeight: "bold",
        fontSize: 25,
        paddingLeft: 10,
    },
    tripListContainer: {
        height: "80%",
        margin: 20,
    },
    tripListDate: {
        fontWeight: "bold",
        fontSize: 20,
        paddingBottom: 20,
        paddingLeft: 10,
    }
});
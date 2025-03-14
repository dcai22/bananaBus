import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, useLocalSearchParams, router } from "expo-router";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";

// TODO: fix up stack/tabs so router back works properly

// sample routes
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
const date = new Date
export default function tripsList() {

    const { routeId, departId, arriveId } = useLocalSearchParams<{routeId: string; departId: string; arriveId: string}>()
    
    // TODO: to be moved to backend that returns object with info
    const route = routes.find(r => r.routeId === parseInt(routeId))
    if (!route) return <Text>unknown routeid</Text>

    const arriveName = route.stops.find(s => s.id === parseInt(arriveId))?.name
    const departName = route.stops.find(s => s.id === parseInt(departId))?.name
    ///////////////////////////////////////////////////////////

    // TODO: make more responsive to screen size and create stylesheets
    // TODO: replace schedule box with function goes through all trips
    
    // simulate trips data with 30 min interval 
    for (let i= 1; i < 5; i++) {
        route?.trips.push({
            id: 123,
            vehicleId: 1,
            price: 20,
            departureTime: new Date(currentTime.getTime() + i *30 * 60 * 1000),
            arrivalTime: new Date(currentTime.getTime() + (i + 1) * 30 * 60 * 1000),
        })
    }

    // TODO: backend get trips (maybe also filter out dates to be for one day or change how data stored)
    // TODO: function to sort trip times and to filter ones that have already left

    // TODO: display date nicely
    // TODO: add refresh

    function tripBox(trip) {
        // TODO: make it look nice
        return(
            <View
            style = {{
                backgroundColor: "lightgrey",
                margin: 5,
             }}
            >
                <Text>{(trip.departureTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60)}hrs</Text>
                <Text>{trip.departureTime.getHours()}:{trip.departureTime.getMinutes()}</Text>
                <Text>{trip.arrivalTime.getHours()}:{trip.arrivalTime.getMinutes()}</Text>
            </View>
        ) 
            
    }    
    return (
        <View
            style={{
                display: "flex",
                height: "100%",
                backgroundColor: "lightblue"
            }}
        >
            <View style= {{
                backgroundColor: "white",
                height: "20%",
                padding: 15,
            }}>
                <TouchableHighlight
                    style={{
                        height: "20%"
                    }}
                    onPress={() => router.back()}
                >
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                        }}
                    >
                        <FontAwesome name="arrow-left" style = {{
                            paddingTop: 5,
                            color: "#009cff",
                            fontSize: 20,
                        }}
                        onPress={() => router.back()}></FontAwesome>
                        
                        <Text style = {{
                            fontWeight: "bold",
                            fontSize: 20,
                            color: "#009cff",
                            paddingLeft: 10,
                        }}
                        onPress={() => router.back()}>go back</Text>

                    </View>
                </TouchableHighlight>
                <View
                    style = {{
                        display: "flex",
                        justifyContent: "center",
                        height: "80%" 
                    }}
                >
                    <Text style = {{
                                fontWeight: "bold",
                                fontSize: 25,
                                marginTop: 10,
                            }}
                    >{departName}</Text>
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                        }}
                    >
                        <FontAwesome name="arrow-right" style = {{
                                paddingTop: 5,
                                fontSize: 25,
                            }}></FontAwesome>
                        <Text style = {{
                                fontWeight: "bold",
                                fontSize: 25,
                                paddingLeft: 10,
                            }}
                        >{arriveName}</Text>
                    </View>
                </View>
            </View>
            <View
                style={{
                    height: "80%",
                    margin: 20,
                }}
            >   
            <Text>{currentTime.getDate()}/{currentTime.getMonth()}/{currentTime.getFullYear()}</Text>
                
                <View
                >
                    {route.trips.map(t => tripBox(t))}
                </View>
            </View>
        </View>
    );
}
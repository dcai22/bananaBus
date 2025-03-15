import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { format } from "date-fns"
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

    const { routeId, departId, arriveId } = useLocalSearchParams<{routeId: string; departId: string; arriveId: string}>()
    
    // TODO: to be moved to backend that returns object with info
    const route = routes.find(r => r.routeId === parseInt(routeId))
    if (!route) return <Text>unknown routeid</Text>

    const arriveName = route.stops.find(s => s.id === parseInt(arriveId))?.name
    const departName = route.stops.find(s => s.id === parseInt(departId))?.name
    ///////////////////////////////////////////////////////////

    // TODO: make more responsive to screen size and create stylesheets
    
    // simulate trips data with 30 min interval 
    for (let i= 1; i < 10; i++) {
        route?.trips.push({
            id: 123,
            vehicleId: 1,
            price: 20,
            departureTime: new Date(currentTime.getTime() + i *30 * 60 * 1000),
            arrivalTime: new Date(currentTime.getTime() + (i + 1) * 30 * 60 * 1000),
        })
    }

    // TODO: add refresh

    // TODO: make proper function to format the time till depart
    // i.e 30min, 1hr, 1 day, etc 
    // also need ago for past trips
    function timeTillDepart(departureTime: Date) {
        
    }

    // move to a component (to be reused in booking page/ past trips)
    function tripBox(trip) {
        // TODO: get actual numbers from backend
        const vehicleCur = 14 // needs to be calculated depending on bookings
        const vehicleMax = 16 // should store in vehicle and get vehicle from id
        return(
            <View
            style = {{
                backgroundColor: "white",
                marginBottom: 15,
                boxShadow: "0px 2px 5px -2px grey",
                borderRadius: 10,     
                flexDirection: "row",
                height: 75,
             }}
            >
                <View
                    style = {{
                        backgroundColor: "#266ce5",
                        padding: 10,
                        borderTopLeftRadius: 10,
                        borderBottomLeftRadius: 10,
                        width: 75,
                        justifyContent: "center",
                    }}
                >
                    {/* to be replaced with function time till depart*/}
                    <Text
                        style = {{
                            color: "white",
                            textAlign: "center",
                            fontSize: 17,
                        }}
                    >{(trip.departureTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60)}hrs</Text>
                </View>
                <View
                    style = {{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 10
                    }}
                >
                    <View style = {{justifyContent: 'space-between'}}>
                        <Text style = {{fontWeight: "200", fontSize: 12}}>Bus Stand</Text>
                        <Text style = {{fontWeight: "bold"}}>{format(trip.departureTime, "kk:mm")}</Text>
                        <View style = {{flexDirection: "row"}}>
                            {/* need to calc whether bus is late */}
                            <FontAwesome name="square" style= {{color: "green", padding: 2}}></FontAwesome>
                            <Text style = {{fontWeight: "200", fontSize: 12, paddingLeft: 3}}>On Time</Text>
                        </View>
                    </View>
                    <View style = {{justifyContent: 'space-between'}}>
                        <Text style = {{textAlign: "right", fontWeight: "200", fontSize: 12}}>{trip.price}RM</Text>
                        <Text style = {{textAlign: "right", fontWeight: "bold"}}>{format(trip.arrivalTime, "kk:mm")}</Text>
                        <View style = {{flexDirection: "row"}}>
                            {/* calc disabled space */}
                            <FontAwesome name="wheelchair" style = {{fontSize: 10, margin: 2, paddingRight: 2}}></FontAwesome>
                            <View style = {{ flexDirection: "row", padding: 2}}>
                                {/* calc luggage space */}
                                <FontAwesome name="suitcase" style = {{fontSize: 10, margin: 1}}></FontAwesome>
                                <FontAwesome name="suitcase" style = {{fontSize: 10, margin: 1}}></FontAwesome>
                                <FontAwesome name="suitcase" style = {{fontSize: 10, margin: 1}}></FontAwesome>
                            </View>
                            <Text style = {{fontWeight: "200", fontSize: 12, paddingLeft: 3}}>{vehicleCur}/{vehicleMax}</Text>
                        </View>
                    </View>
                </View>
            </View>
        ) 
            
    }
    
    
    return (
        <View
            style={{
                height: "100%",
                backgroundColor: "lightblue",
                overflowY: "scroll"
            }}
        >
            <View style= {{
                backgroundColor: "white",
                height: "20%",
                padding: 20,
                boxShadow: "0px 0px 5px grey"
            }}>
                <TouchableHighlight
                    style={{
                        height: "20%"
                    }}
                    onPress={() => router.back()}
                >
                    <View
                        style={{
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
            <Text
                style = {{
                    fontWeight: "bold",
                    fontSize: 20,
                    paddingBottom: 20,
                    paddingLeft: 10,
                }}
            
            >{format(currentTime, "E, do LLL y")}</Text>
                <View>
                    {route.trips.map(t => tripBox(t))}
                </View>
            </View>
        </View>
    );
}
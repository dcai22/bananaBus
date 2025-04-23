import Container from "@/components/Container";
import { Header } from "@/components/Header";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { format } from "date-fns";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Text, FlatList, TouchableOpacity, View, StyleSheet } from "react-native";
import { getItem } from "../helper";
import axios from "axios";
import { LoadingPage } from "@/components/LoadingPage";
import { API_BASE } from '@env';

export default function driverTrip() {
    interface Vehicle {
        _id: string,
        maxCapacity: number,
        maxLuggageCapacity: number,
        hasAssist: boolean,
        numberPlate: string,
    }

    interface Stop {
        _id: string,
        name: string,
        stopTime: Date,
    }

    interface Passenger {
        firstName: string,
        lastName: string,
        numTickets: number,
        // needAssist: boolean,
    }

    const { tripId, departName, arriveName } = useLocalSearchParams<{tripId: string, departName: string, arriveName: string}>();

    const [refresh, setRefresh] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [vehicle, setVehicle] = useState<Vehicle>();
    const [stops, setStops] = useState<Stop[]>([]);
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    

    useFocusEffect(
        useCallback(() => { 
            setRefresh(true)
            setError("");
            // Makes sure to reload page upon leaving page
            return () => {
                setLoading(true)
            };
        }, [])
    )

    useEffect(() => {
        if (!refresh) return
        const fetchData = async () => {
            const token = await getItem("token");
            setLoading(true)
            axios.get(`${API_BASE}/driver/getTrip?tripId=${tripId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }).then((res) => {
                setVehicle(res.data.vehicle);
                setStops(res.data.stops);
                setPassengers(res.data.passengers);
            }).catch((err) => {
                setError(err.response.data.error);
            }).finally(() => {
                setLoading(false);
                setRefresh(false);
            });
        }

        fetchData();
    }, [tripId, refresh]);

    // make nicer or pop up
    if (error) {
        return(
            <Text>Error: {error}</Text>
        )
    }

    const handlePress = () => {
        router.push({
            pathname: "/driverReportProblem",
            params: {
                vehicleId: vehicle?._id,
                numberPlate: vehicle?.numberPlate,
                tripId,
                departName,
                arriveName,
            }
        });
    }

    return (
        <Container>
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
            {loading
                ? <LoadingPage />
                : <View style={styles.section}>
                    <View style={styles.upcomingList}>
                        {vehicle &&
                            <Text>Vehicle: {vehicle.numberPlate}. Capacity: {vehicle.maxCapacity}. Luggage capacity: {vehicle.maxLuggageCapacity}.</Text>
                        }
                        {stops && stops.length > 0 &&
                            <View>
                                {stops.map((s, i) => <Text key={i}>{i > 0 ? " -> " : ""}{s.name} ({format(s.stopTime, "hh:mm a")})</Text>)}
                            </View>
                        }
                        {passengers &&
                            <View>
                                <Text>
                                    Passengers:
                                </Text>
                                {passengers.map((e, i) => <Text key={i}>
                                    {e.firstName} {e.lastName} has {e.numTickets} ticket(s),
                                </Text>)}
                                <Text>
                                    Total passengers: {passengers.reduce((accumulator, p) => accumulator + p.numTickets, 0)}
                                </Text>
                            </View>
                        }
                        {vehicle &&
                            <TouchableOpacity onPress={handlePress}>
                                <Text>Report problem with vehicle</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            }
        </Container>
    )
}

const styles = StyleSheet.create({
    section: {
        flex: 1,
        paddingHorizontal: 30,
        marginBottom: 24,
    },
    sectionHeaderContainer:{
        flexDirection: "row"
    },
    sectionHeader: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    tripItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        minHeight: 60,
        alignItems: 'center',
    },
    route: {
        fontWeight: 'bold',
        fontSize: 22,
    },
    tripContent: {
        flex: 1,
        padding: 8,
        marginLeft: 10,
    },
    accent: {
        backgroundColor: '#2196F3',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        width: 12,
        alignSelf: 'stretch',
    },
    watchList: {
        flex: 1,
        height: '55%',
    },
    upcomingList: {
        flex: 1,
        height: "60%",
    },
    arrow: {
        fontSize: 18,
    },
    topLeftButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        padding: 10,
        backgroundColor: '#007aff',
        borderRadius: 10,
        elevation: 20,
    },
    topLeftButtonText: {
        color: 'white',
        fontSize: 12,
    },
    header: {
        backgroundColor: "white",
        height: "22%",
        padding: 20,
        boxShadow: "0px 0px 5px grey"
    },
    goBackContainer: {
        height: "20%",
        flexDirection: "row",
    },
    goBackArrow: {
        paddingTop: 5,
        color: "#74b9f1",
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
    screen: {
        height: "100%",
        backgroundColor: "#e5f0fa",
    },
});

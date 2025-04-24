import Container from "@/components/Container";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { format } from "date-fns";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView } from "react-native";
import { getItem } from "../helper";
import axios from "axios";
import { LoadingPage } from "@/components/LoadingPage";
import { WarnButton, YesButton } from "@/components/Buttons";

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
            axios.get(`${process.env.EXPO_PUBLIC_API_BASE}/driver/getTrip?tripId=${tripId}`, {
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
            <View style={styles.header}>
                <Text style={styles.goBackText} onPress={() => router.back()}>
                    <FontAwesome name="arrow-left" style={styles.goBackArrow}/> go back
                </Text>
                <View style={styles.locationContainer}>
                    <Text style={styles.departText}>{departName}</Text>
                    <View style={styles.arriveContainer}>
                        <FontAwesome name="arrow-right" style={styles.arriveArrow} />
                        <Text style={styles.arriveText}>{arriveName}</Text>
                    </View>
                </View>
            </View>
            {loading ? (
                <LoadingPage />
            ) : (
                <ScrollView style={styles.content}>
                    {vehicle && (
                        <View style={[styles.infoCard, styles.vehicleInfo]}>
                            <Text style={styles.sectionTitle}>Vehicle:</Text>
                            <Text style={styles.numberPlate}>{vehicle.numberPlate}{"\n"}</Text>
                            <Text style={styles.infoText}>
                                Capacity: {vehicle.maxCapacity}{"\n"}
                                Luggage Capacity: {vehicle.maxLuggageCapacity}
                            </Text>
                        </View>
                    )}
                    {stops && stops.length > 0 && (
                        <View style={styles.infoCard}>
                            <Text style={styles.sectionTitle}>Stops:</Text>
                            {stops.map((s, i) => (
                                <Text key={i} style={styles.infoText}>
                                    {i > 0 ? " -> " : ""}
                                    {s.name} ({format(s.stopTime, "hh:mm a")})
                                </Text>
                            ))}
                        </View>
                    )}
                    {passengers && (
                        <View style={styles.infoCard}>
                            <Text style={styles.sectionTitle}>Passengers:</Text>
                            {passengers.length > 0 ? (
                                passengers.map((e, i) => (
                                    <Text key={i} style={styles.infoText}>
                                        {e.firstName} {e.lastName} has {e.numTickets} ticket(s)
                                    </Text>
                                ))
                            ) : (
                                <Text style={styles.noPassengersText}>No passengers yet</Text>
                            )}
                            <Text style={styles.totalPassengers}>
                                Total Passengers:{" "}
                                {passengers.reduce(
                                    (accumulator, p) => accumulator + p.numTickets,
                                    0
                                )}
                            </Text>
                        </View>
                    )}
                    {vehicle && (
                        <WarnButton
                            text="Report Problem with Vehicle"
                            onPress={handlePress}
                            style={styles.buttons}
                        />
                    )}
                </ScrollView>
            )}
        </Container>
    )
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: "white",
        height: "22%",
        padding: 20,
        boxShadow: "0px 0px 5px grey",
    },
    goBackArrow: {
        fontSize: 15,
    },
    goBackText: {   
        fontWeight: "bold",
        fontSize: 20,
        color: "#74b9f1",
    },
    locationContainer: {
        marginTop: 20,
    },
    departText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
    },
    arriveContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    arriveArrow: {
        fontSize: 20,
        color: "#333",
    },
    arriveText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginLeft: 10,
    },
    content: {
        paddingHorizontal: 20,
        flex: 1,
    },
    infoCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flex: 0,
    },
    vehicleInfo: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#4399dc",
    },
    infoText: {
        fontSize: 16,
    },
    numberPlate: {
        fontWeight: "bold",
        fontSize: 20,
    },
    totalPassengers: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
        color: "#333",
    },
    buttons: {
        flex: 0,
        marginHorizontal: 0,
    },
    noPassengersText: {
        fontSize: 16,
        color: "#999",
        fontStyle: "italic",
    },
});
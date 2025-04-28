import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, Alert, StyleSheet, Text, View } from "react-native";
import Container from "@/app/components/Container";
import React from "react";
import { Header } from "@/app/components/Header";
import { FontAwesome } from "@expo/vector-icons";
import { format } from "date-fns";
import axios from "axios";
import { getItem } from "../helper";
import { LoadingPage } from "@/app/components/LoadingPage";

/**
 * Past Bookings Screen
 * 
 * Displays a list of past bookings made by the user.
 * Shows trip details including departure time and route.
 */
export default function pastBookings() {
    interface Trip {
        bookingId: number;
        userId: number;
        tripId: number;
        originName: string;
        destName: string;
        departureTime: string;
    }

    const [refresh, setRefresh] = useState(true);
    const [pastTrips, setPastTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    
    /**
     * Refreshes the page on every visit.
     */
    useFocusEffect(
        useCallback(() => { 
            setRefresh(true)
            return () => {
                setLoading(true)
            };
        }, [])
    )
    
    /**
     * Fetches past bookings from the backend.
     */
    useEffect(() => {
        if (!refresh) return;
        const fetchData = async () => {
            const token = await getItem("token");
            axios.get(`${process.env.EXPO_PUBLIC_API_BASE}/bookings/past`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }).then((res) => {
                setPastTrips(res.data.bookings);
            }).catch((err) => {
                Alert.alert("Error", err.response.data.error);
            }).finally(() => {
                setLoading(false);
                setRefresh(false);
            })
        }
        fetchData();
    }, [refresh]);

    // Show loading page while fetching data
    if (loading) {
        return (
            <Container>
                <Header title="Past Bookings" icon={<FontAwesome name="calendar"/>}/>
                <LoadingPage/>
            </Container>
        )
    }

    return(
        <Container>
            {/* Header */}
            <Header title="Past Bookings" icon={<FontAwesome name="calendar"/>}/>
            {/* List of Past Bookings */}
            <ScrollView style={styles.bookingsContainer}>
                {pastTrips && pastTrips.length > 0 ? (
                    pastTrips.map((item, index) => (
                        <View style={styles.tripItem} key={index}>
                            <View style={styles.accent} />
                            <View style={styles.tripContent}>
                                {/* Departure Time */}
                                <Text>
                                    {format(
                                        new Date(item.departureTime),
                                        "hh:mm a, do MMMM yyyy"
                                    )}
                                </Text>
                                {/* Route Information, origin and destination*/}
                                <Text style={styles.route}>
                                    {item.originName}{" "}
                                    <FontAwesome
                                        name="arrow-right"
                                        style={styles.arrow}
                                    />{" "}
                                    {item.destName}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    // Message when no past bookings are available
                    <Text style={styles.emptyMessage}>Book some trips!</Text>
                )}
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    bookingsContainer: {
        paddingHorizontal: 16,
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
    accent: {
        backgroundColor: '#2196F3',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        width: 12,
        alignSelf: 'stretch',
    },
    route: {
        fontWeight: 'bold',
        fontSize: 22,
    },
    arrow: {
        fontSize: 18,
    },
    tripContent: {
        flex: 1,
        padding: 8,
        marginLeft: 10,
    },
    emptyMessage: {
        fontSize: 18,
        fontStyle: "italic",
        color: "#888",
        textAlign: "center",
        marginBottom: 14,
    },
});
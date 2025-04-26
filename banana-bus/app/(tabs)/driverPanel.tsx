import Container from "@/components/Container";
import { Header } from "@/components/Header";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import axios from "axios";
import { format } from "date-fns";
import { useFocusEffect, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native";
import { getItem } from "../helper";

/**
 * Driver Panel Screen
 * 
 * Displays a list of upcoming trips assigned to the driver. Drivers can view trip details
 * and navigate to a specific trip's page for more information.
 */
export default function driverPanel() {
    // TODO Interface for the trip object
    interface Trip {
        _id: string,
        stopTimes: Date[],
        originName: string,
        destName: string,
    }

    const [error, setError] = useState("")
    const [refresh, setRefresh] = useState(true);
    
    const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
    const [upcomingLoading, setUpcomingLoading] = useState(true);
    
    /**
     * Handles navigation to the trip details page.
     * 
     * @param trip - The trip object containing details of the selected trip.
     */
    const handlePress = (trip: Trip) => {
        router.push({
            pathname: '/driverTrip',
            params: {
                tripId: trip._id,
                departName: trip.originName,
                arriveName: trip.destName,
            },
        });
    };

    /**
     * Refreshes the page on every visit.
     */
    useFocusEffect(
        useCallback(() => { 
            setRefresh(true)
            setError("");
            // Makes sure to reload page upon leaving page
            return () => {
                setUpcomingLoading(true)
            };
        }, [])
    )

    /**
     * Fetches upcoming trips from the API when the page is refreshed.
     */
    useEffect(() => {
        if (!refresh) return;
        setError("");
        async function init() {
            const token = await getItem("token");
            await axios.get(`${process.env.EXPO_PUBLIC_API_BASE}/driver/getUpcomingTrips`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            }).then((res) => {
                setUpcomingTrips(res.data.upcomingTrips);
            }).catch((err) => {
                Alert.alert(`Error ${err.response.data.error}`)
            }).finally(() => {
                setUpcomingLoading(false);
                setRefresh(false);
            });
        }

        init();
    }, [refresh]);
    
    return (
        <Container>
            {/* Header */}
            <Header title="Driver Panel" />
            {/* Upcoming Trips Section */}
            <ScrollView style={styles.section}>
                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeader}>Designated Trips</Text>
                    { upcomingLoading &&
                        <ActivityIndicator size="small" color="#007AFF" style={{marginBottom: 14, paddingHorizontal: 10}}/>
                    }
                </View>
                <View style={styles.upcomingList}>
                    {upcomingTrips.length > 0
                        ? upcomingTrips.map((item, i) => (
                            <TouchableOpacity onPress={() => handlePress(item)} key={i}>
                                <View style={styles.tripItem}>
                                    <View style={styles.accent} />
                                    <View style={styles.tripContent}>
                                        <Text>
                                            {format(
                                                new Date(item.stopTimes[0]),
                                                "hh:mm a, do MMMM yyyy"
                                            )}
                                        </Text>
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
                            </TouchableOpacity>
                        ))
                        : <Text style={styles.emptyMessage}>No upcoming trips</Text>
                    }
                </View>
            </ScrollView>
        </Container>
    )
}

const styles = StyleSheet.create({
    section: {
        flex: 1,
        paddingHorizontal: 30,
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
    upcomingList: {
        flex: 1,
        height: "60%",
    },
    arrow: {
        fontSize: 18,
    },
    emptyMessage: {
        fontSize: 18,
        fontStyle: "italic",
        color: "#888",
        textAlign: "center",
        marginBottom: 14,
    },
});

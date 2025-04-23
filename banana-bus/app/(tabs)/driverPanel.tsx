import Container from "@/components/Container";
import { Header } from "@/components/Header";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import axios from "axios";
import { format } from "date-fns";
import { useFocusEffect, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Text, FlatList, TouchableOpacity, View, StyleSheet, ActivityIndicator } from "react-native";
import { API_BASE } from "@env";
import { getItem } from "../helper";

export default function driverPanel() {
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
    
    useEffect(() => {
        if (!refresh) return;
        async function init() {
            const token = await getItem("token");
            await axios.get(`${API_BASE}/driver/getUpcomingTrips`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            }).then((res) => {
                setUpcomingTrips(res.data.upcomingTrips);
            }).catch((err) => {
                setError(err.response.data.error);
            }).finally(() => {
                setUpcomingLoading(false);
                setRefresh(false);
            });
        }

        init();
    }, [refresh]);

    if (error) {
        return (
            <Text>Error: {error}</Text>
        )
    }
    
    return (
        <Container>
            <Header title="Driver Panel" showGoBack={false} />
            <View style={styles.section}>
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
            </View>
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
    emptyMessage: {
        fontSize: 18,
        fontStyle: "italic",
        color: "#888",
        textAlign: "center",
        marginBottom: 14,
    },
});

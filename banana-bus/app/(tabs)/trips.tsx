import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { format } from "date-fns";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import axios from "axios";
import { getItem } from "../helper";
import { Header } from "@/components/Header";
import Container from "@/components/Container";
import { ScrollView } from "react-native";

export default function Trips() {
    interface Trip {
        bookingId: number;
        userId: number;
        tripId: number;
        originName: string;
        destName: string;
        departureTime: string;
    }
    
    interface Route {
        route: {
            routeId: number;
            stops: number[];
            trips: number[];
        };
        originIndex: number;
        originName: string;
        destIndex: number;
        destName: string;
    }
    const [error, setError] = useState("")
    const [refresh, setRefresh] = useState(true);
    
    const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
    const [upcomingLoading, setUpcomingLoading] = useState(true)

    const [watchlistRoutes, setWatchlistRoutes] = useState<Route[]>([]);

    const fetchWatchlistRoutes = async () => {
        // TODO fetch actual data
        
        return [
            {
                route: {
                    routeId: 0,
                    stops: [0, 1],      // route visits stop0 (1utama) -> stop1 (terminal 1)
                    trips: [0, 1, 2, 3, 4],
                },
                originIndex: 0,         // user intends to board at stops[0], i.e., stop0 (1utama)
                originName: '1utama Shopping Mall',
                destIndex: 1,           // user intends to disembark at stops[1], i.e., stop1 (terminal 1)
                destName: 'Kuala Lumpur Intl. T1',
            },
            {
                route: {
                    routeId: 1,
                    stops: [2, 1, 0],   // route visits stop2 (terminal 2) -> stop1 (terminal 1) -> stop0 (1utama)
                    trips: [5, 6, 7, 8, 9],
                },
                originIndex: 0,         // user intends to board at stops[0], i.e., stop2 (terminal 2)
                originName: 'Kuala Lumpur Intl. T2',
                destIndex: 2,           // user intends to disembark at stops[2], i.e., stop0 (1utama)
                destName: '1utama Shopping Mall',
            },
            {
                route: {
                    routeId: 1,
                    stops: [2, 1, 0],   // route visits stop2 (terminal 2) -> stop1 (terminal 1) -> stop0 (1utama)
                    trips: [5, 6, 7, 8, 9],
                },
                originIndex: 0,         // user intends to board at stops[0], i.e., stop2 (terminal 2)
                originName: 'Kuala Lumpur Intl. T2',
                destIndex: 2,           // user intends to disembark at stops[2], i.e., stop0 (1utama)
                destName: '1utama Shopping Mall',
            },
            {
                route: {
                    routeId: 1,
                    stops: [2, 1, 0],   // route visits stop2 (terminal 2) -> stop1 (terminal 1) -> stop0 (1utama)
                    trips: [5, 6, 7, 8, 9],
                },
                originIndex: 0,         // user intends to board at stops[0], i.e., stop2 (terminal 2)
                originName: 'Kuala Lumpur Intl. T2',
                destIndex: 2,           // user intends to disembark at stops[2], i.e., stop0 (1utama)
                destName: '1utama Shopping Mall',
            },
            {
                route: {
                    routeId: 1,
                    stops: [2, 1, 0],   // route visits stop2 (terminal 2) -> stop1 (terminal 1) -> stop0 (1utama)
                    trips: [5, 6, 7, 8, 9],
                },
                originIndex: 0,         // user intends to board at stops[0], i.e., stop2 (terminal 2)
                originName: 'Kuala Lumpur Intl. T2',
                destIndex: 2,           // user intends to disembark at stops[2], i.e., stop0 (1utama)
                destName: '1utama Shopping Mall',
            },
            {
                route: {
                    routeId: 1,
                    stops: [2, 1, 0],   // route visits stop2 (terminal 2) -> stop1 (terminal 1) -> stop0 (1utama)
                    trips: [5, 6, 7, 8, 9],
                },
                originIndex: 0,         // user intends to board at stops[0], i.e., stop2 (terminal 2)
                originName: 'Kuala Lumpur Intl. T2',
                destIndex: 2,           // user intends to disembark at stops[2], i.e., stop0 (1utama)
                destName: '1utama Shopping Mall',
            },
        ];
    };

    useFocusEffect(
        useCallback(() => { 
            setRefresh(true)
            // Makes sure to reload page upon leaving page
            return () => {
                setUpcomingLoading(true)
            };
        }, [])
    )
        
    useEffect(() => {
        if (!refresh) return
        const getTrips = async () => {
            const token = await getItem("token");
            axios.get("https://banana-bus.vercel.app/upcomingBookings", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }).then((res) => {
                setUpcomingTrips(res.data)
            }).catch((err) => {
                setError(err.response.data.error)
            }).finally(() => {
                setUpcomingLoading(false)
                setRefresh(false)
            })

            const watchlist = await fetchWatchlistRoutes();
            setWatchlistRoutes(watchlist);
        };

        getTrips();
    }, [refresh]);

    if (error) {
        return(
            <Text>Error: {error}</Text>
        )
    }
    const handlePress = (route: Route) => {
        router.push({
            pathname: '/tripsList',
            params: {
                routeId: "67f678743fb87d7a2df89c40",
                departId: "67f6789907015b5d0c6ab38f",
                arriveId: "67f678d207015b5d0c6ab391",
                date: new Date().toISOString(),
            }
        })
    };

    return (
        <Container>
            <Header title="My Trips" icon={<FontAwesome name="calendar"/>} showGoBack={false} />
            <ScrollView>
                <View style={styles.section}>
                    <View style={styles.sectionHeaderContainer}>
                        <Text style={styles.sectionHeader}>My Upcoming Trips</Text>
                        { upcomingLoading &&
                            <ActivityIndicator size="small" color="#007AFF" style={{marginBottom: 14, paddingHorizontal: 10}}/>
                        }
                    </View>
                    {upcomingTrips.length > 0 ? (
                        upcomingTrips.map((item) => (
                            <View style={styles.tripItem}>
                                <View style={styles.accent} />
                                <View style={styles.tripContent}>
                                    <Text>
                                        {format(
                                            new Date(item.departureTime),
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
                        ))
                    ) : (
                        <Text style={styles.emptyMessage}>Book some trips!</Text>
                    )}
                    <Text style={styles.sectionHeader}>My Watchlist</Text>
                    {watchlistRoutes.length > 0 ? (
                        watchlistRoutes.map((item, index) => (
                            <TouchableOpacity
                                key={item.route.routeId + "-" + index}
                                onPress={() => handlePress(item)}
                            >
                                <View style={styles.tripItem}>
                                    <View style={styles.accent} />
                                    <View style={styles.tripContent}>
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
                    ) : (
                        <Text style={styles.emptyMessage}>Watchlist some trips!</Text>
                    )}
                </View>
            </ScrollView>
        </Container>
    );
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

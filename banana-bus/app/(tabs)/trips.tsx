import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
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
    interface Booking {
        bookingId: string;
        userId: string;
        tripId: string;
        originName: string;
        destName: string;
        departureTime: Date;
    }

    interface Route {
        route: {
            _id: string;
            stops: string[];
            trips: string[];
        };
        originIndex: number;
        originName: string;
        destIndex: number;
        destName: string;
    }

    const [error, setError] = useState("");
    const [refresh, setRefresh] = useState(true);

    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [upcomingLoading, setUpcomingLoading] = useState(true);

    const [watchlistRoutes, setWatchlistRoutes] = useState<Route[]>([]);
    const [watchlistLoading, setWatchlistLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setRefresh(true);
            // Makes sure to reload page upon leaving page
            return () => {
                setUpcomingLoading(true);
                setWatchlistLoading(true);
            };
        }, [])
    );

    useEffect(() => {
        if (!refresh) return;
        setError("");

        const fetchData = async () => {
            const token = await getItem("token");
            axios
                .get(`${process.env.EXPO_PUBLIC_API_BASE}/upcomingBookings`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((tripsResponse) => {
                    setUpcomingBookings(tripsResponse.data);
                })
                .catch((err) => {
                    setError(err.response?.data?.error || "An error occurred");
                })
                .finally(() => {
                    setUpcomingLoading(false);
                });

            axios
                .get(`${process.env.EXPO_PUBLIC_API_BASE}/getSavedRoutes`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((watchlistResponse) => {
                    setWatchlistRoutes(watchlistResponse.data.savedRoutes);
                })
                .catch((err) => {
                    setError(err.response?.data?.error || "An error occurred");
                })
                .finally(() => {
                    setWatchlistLoading(false);
                    setRefresh(false);
                });
        };

        fetchData();
    }, [refresh]);

    if (error) {
        Alert.alert(`Error ${error}`)
        return(
            <Container>
                <Header/>
            </Container>
        )
    }

    const handlePress = (route: Route) => {
        router.push({
            pathname: "/tripsList",
            params: {
                routeId: route.route._id,
                departId: route.route.stops[route.originIndex],
                arriveId: route.route.stops[route.destIndex],
            },
        });
    };

    return (
        <Container>
            <Header
                title="My Trips"
                icon={<FontAwesome name="calendar" />}
                showGoBack={false}
            />
            <ScrollView>
                <View style={styles.section}>
                    <View style={styles.sectionHeaderContainer}>
                        <Text style={styles.sectionHeader}>
                            My Upcoming Trips
                        </Text>
                        {upcomingLoading && (
                            <ActivityIndicator
                                size="small"
                                color="#007AFF"
                                style={{
                                    marginBottom: 14,
                                    paddingHorizontal: 10,
                                }}
                            />
                        )}
                    </View>
                    {upcomingBookings.length > 0 ? (
                        upcomingBookings.map((item, index) => (
                            <View style={styles.tripItem} key={index}>
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
                        <Text style={styles.emptyMessage}>
                            Book some trips!
                        </Text>
                    )}
                    <View style={styles.sectionHeaderContainer}>
                        <Text style={styles.sectionHeader}>My Watchlist</Text>
                        {watchlistLoading && (
                            <ActivityIndicator
                                size="small"
                                color="#007AFF"
                                style={{
                                    marginBottom: 14,
                                    paddingHorizontal: 10,
                                }}
                            />
                        )}
                    </View>
                    {watchlistRoutes.length > 0 ? (
                        watchlistRoutes.map((item, index) => (
                            <TouchableOpacity
                                key={index}
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
                        <Text style={styles.emptyMessage}>
                            Watchlist some trips!
                        </Text>
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
    sectionHeaderContainer: {
        flexDirection: "row",
    },
    sectionHeader: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 16,
    },
    tripItem: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        minHeight: 60,
        alignItems: "center",
    },
    route: {
        fontWeight: "bold",
        fontSize: 22,
    },
    tripContent: {
        flex: 1,
        padding: 8,
        marginLeft: 10,
    },
    accent: {
        backgroundColor: "#2196F3",
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        width: 12,
        alignSelf: "stretch",
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

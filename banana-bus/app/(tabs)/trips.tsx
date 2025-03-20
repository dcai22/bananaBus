import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { router } from "expo-router";
import { format } from "date-fns";

export default function Trips() {
    interface Trip {
        bookingId: number;
        userId: number;
        tripId: number;
        originName: string;
        destName: string;
        bookingTime: string;
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

    const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
    const [watchlistRoutes, setWatchlistRoutes] = useState<Route[]>([]);

    const fetchUpcomingTrips = async () => {
        // TODO fetch actual data
        return [
            {
                bookingId: 0,
                userId: 0,
                tripId: 0,
                originName: '1utama Shopping Mall',
                destName: 'Kuala Lumpur Intl. T1',
                bookingTime: new Date(0).toISOString(),
                departureTime: new Date(0).toISOString(),
            },
            {
                bookingId: 1,
                userId: 0,
                tripId: 5,
                originName: 'Kuala Lumpur Intl. T2',
                destName: '1utama Shopping Mall',
                bookingTime: new Date(0).toISOString(),
                departureTime: new Date(0).toISOString(),
            },
        ];
    };
    
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
        ];
    };

    useEffect(() => {
        const getTrips = async () => {
            const upcoming = await fetchUpcomingTrips();
            const watchlist = await fetchWatchlistRoutes();
            setUpcomingTrips(upcoming);
            setWatchlistRoutes(watchlist);
        };

        getTrips();
    }, []);

    const handlePress = (route: Route) => {
        // router.push({
        //     pathname: '/tripsList',
        //     params: {
        //         routeId: route.route.routeId,
        //         departId: route.originIndex,
        //         arriveId: route.destIndex,
        //         date: new Date().toISOString(),
        //     }
        // })
        router.push({
            pathname: '/tripsList',
            params: {
                routeId: 1,
                departId: 1,
                arriveId: 2,
                date: new Date().toISOString(),
            }
        })
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.header}>Saved Trips</Text>
                {/* TODO change this icon */}
                <Text style={styles.header}>🚌</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>My Upcoming Trips</Text>
                <FlatList
                    data={upcomingTrips}
                    renderItem={({ item }) => (
                        <TouchableOpacity>
                            <View style={styles.tripItem}>
                                <View style={styles.accent} />
                                <View style={styles.tripContent}>
                                    <Text>{format(new Date(item.bookingTime), "hh:mm a, do MMMM yyyy")}</Text>
                                    <Text style={styles.route}>{item.originName} → {item.destName}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>My Watchlist</Text>
                <FlatList
                    data={watchlistRoutes}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handlePress(item)}>
                            <View style={styles.tripItem}>
                                <View style={styles.accent} />
                                <View style={styles.tripContent}>
                                    <Text style={styles.route}>{item.originName} → {item.destName}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dff4ff',
    },
    headerBox: {
        backgroundColor: '#fff',
        marginBottom: 24,
        padding: 35,
        minHeight: 150,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 30,
        marginBottom: 24,
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
    }
});

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "expo-router";

export default function Trips() {
    interface Trip {
        id: string;
        time?: string;
        terminal?: string;
        route: string;
    }

    const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
    const [watchlistTrips, setWatchlistTrips] = useState<Trip[]>([]);

    const fetchUpcomingTrips = async () => {
        // TODO fetch actual data
        return [
            {
                id: '1',
                time: '12:46 PM, 12th July 2025',
                terminal: 'Bus Terminal B',
                route: 'Kuala Lumpur Intl. T1 → 1utama Shopping Mall'
            }
        ];
    };
    
    const fetchWatchlistTrips = async () => {
        // TODO fetch actual data
        return [
            {
                id: '1',
                route: 'Kuala Lumpur Intl. T1 → 1utama Shopping Mall'
            },
            {
                id: '2',
                route: 'Kuala Lumpur Intl. T1 → 1utama Shopping Mall'
            },
            {
                id: '3',
                route: 'Kuala Lumpur Intl. T1 → 1utama Shopping Mall'
            },
            {
                id: '4',
                route: 'Kuala Lumpur Intl. T1 → 1utama Shopping Mall'
            },
            {
                id: '5',
                route: 'Kuala Lumpur Intl. T1 → 1utama Shopping Mall'
            },
            {
                id: '6',
                route: 'Kuala Lumpur Intl. T1 → 1utama Shopping Mall'
            },
            {
                id: '7',
                route: 'Kuala Lumpur Intl. T1 → 1utama Shopping Mall'
            }
        ];
    };

    useEffect(() => {
        const getTrips = async () => {
            const upcoming = await fetchUpcomingTrips();
            const watchlist = await fetchWatchlistTrips();
            setUpcomingTrips(upcoming);
            setWatchlistTrips(watchlist);
        };

        getTrips();
    }, []);

    const navigation = useNavigation();
    const handlePress = (tripId: string) => {
        navigation.navigate(`/tripsList/${tripId}`);
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
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handlePress(item.id)}>
                            <View style={styles.tripItem}>
                                <View style={styles.accent} />
                                <View style={styles.tripContent}>
                                    <Text>{item.time} @ {item.terminal}</Text>
                                    <Text style={styles.route}>{item.route}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>My Watchlist</Text>
                <FlatList
                    data={watchlistTrips}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handlePress(item.id)}>
                            <View style={styles.tripItem}>
                                <View style={styles.accent} />
                                <View style={styles.tripContent}>
                                    <Text style={styles.route}>{item.route}</Text>
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

import Container from "@/components/Container";
import { Header } from "@/components/Header";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, FlatList, TouchableOpacity, View, StyleSheet } from "react-native";

export default function driverPanel() {
    interface Trip {
        vehicleId: number,
        route: {
            routeId: number,
            stops: number[],
        },
        stopTimes: Date[],
        bookings: number[],
        originIndex: number,
        originName: string,
        destIndex: number,
        destName: string,
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

    const router = useRouter();

    const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);

    const handlePress = (trip: Trip) => {
        router.push({
            pathname: '/driverTrip',
            params: {
                routeId: trip.route.routeId,
                originName: trip.originName,
                destName: trip.destName,
            }
        });
    };

    // TODO: fetch trips from database
    const fetchUpcomingTrips = () => {
        return [
            {
                vehicleId: 0,
                route: {
                    routeId: 0,
                    stops: [0, 1],
                },
                stopTimes: [new Date(0), new Date(1)],
                bookings: [0, 1, 2],
                originIndex: 0,
                originName: '1utama Shopping Mall',
                destIndex: 1,
                destName: 'Kuala Lumpur Intl. T1',
            },
        ];
    }

    useEffect(() => {
        function init() {
            setUpcomingTrips(fetchUpcomingTrips());
        }
        init();
    }, []);

    return (
        <Container>
            <Header title="Driver Panel" showGoBack={false} />
            <View style={styles.section}>
                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeader}>Designated Trips</Text>
                </View>
                <View style={styles.upcomingList}>
                    <FlatList
                        data={upcomingTrips}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handlePress(item)}>
                                <View style={styles.tripItem}>
                                    <View style={styles.accent} />
                                    <View style={styles.tripContent}>
                                        <Text>{format(new Date(item.stopTimes[0]), "hh:mm a, do MMMM yyyy")}</Text>
                                        <Text style={styles.route}>
                                            {item.originName} <FontAwesome name="arrow-right" style={styles.arrow}/> {item.destName}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
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
    }
});

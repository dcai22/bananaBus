import Container from "@/components/Container";
import { Header } from "@/components/Header";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, FlatList, TouchableOpacity, View, StyleSheet } from "react-native";

export default function driverView() {
    interface Trip {
        bookingId: number;
        userId: number;
        tripId: number;
        originName: string;
        destName: string;
        departureTime: string;
    }

    const router = useRouter();

    const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);

    // TODO: fetch trips from database

    return (
        <Container>
            <Header title="Driver View" showGoBack={false} />
            <TouchableOpacity style={styles.topLeftButton} onPress={() => {
                console.log('Top-left button pressed');
                router.navigate("/");
            }}>
                <Text style={styles.topLeftButtonText}>User view</Text>
            </TouchableOpacity>
            <View style={styles.section}>
                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeader}>My Upcoming Trips</Text>
                </View>
                <View style={styles.upcomingList}>
                    <FlatList
                        data={upcomingTrips}
                        renderItem={({ item }) => (
                            <TouchableOpacity>
                                <View style={styles.tripItem}>
                                    <View style={styles.accent} />
                                    <View style={styles.tripContent}>
                                        <Text>{format(new Date(item.departureTime), "hh:mm a, do MMMM yyyy")}</Text>
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

import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, Alert, StyleSheet, Text, View } from "react-native";
import Container from "@/components/Container";
import React from "react";
import { Header } from "@/components/Header";
import { FontAwesome } from "@expo/vector-icons";
import { format } from "date-fns";
import axios from "axios";
import { getItem } from "../helper";
import { LoadingPage } from "@/components/LoadingPage";

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
    
    useFocusEffect(
        useCallback(() => { 
            setRefresh(true)
            return () => {
                setLoading(true)
            };
        }, [])
    )
    

    useEffect(() => {
        if (!refresh) return;
        const fetchData = async () => {
            const token = await getItem("token");
            axios.get("https://banana-bus.vercel.app/pastBookings", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }).then((res) => {
                setPastTrips(res.data);
            }).catch((err) => {
                Alert.alert("Error", err.response.data.error);
            }).finally(() => {
                setLoading(false)
            })
        }
        fetchData();
    }, [refresh]);

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
            <Header title="Past Bookings" icon={<FontAwesome name="calendar"/>}/>
            <ScrollView>
                {pastTrips.length > 0 ? (
                    pastTrips.map((item) => (
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
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
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
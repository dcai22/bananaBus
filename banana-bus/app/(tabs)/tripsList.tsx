import React, { useCallback, useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import { format } from "date-fns";
import TripListBox from "@/components/TripListBox";
import axios from "axios";
import { TripBox } from "@/api/interface";
import { LoadingPage } from "@/components/LoadingPage";
import { getItem } from "../helper";
import DatePicker from "react-native-date-picker";
import Container from "@/components/Container";

interface IRouteSection {
    routeId: number;
    originId: number;
    destId: number;
}
export default function tripsList() {
    const { routeId, departId, arriveId } = useLocalSearchParams<{
        routeId: string;
        departId: string;
        arriveId: string;
    }>();

    const [refresh, setRefresh] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [departName, setDepartName] = useState("Loading");
    const [arriveName, setArriveName] = useState("");
    const [trips, setTrips] = useState<TripBox[]>([]);
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setRefresh(true);
            setError("");
            // Makes sure to reload page upon leaving page
            return () => {
                setLoading(true);
            };
        }, [])
    );

    // Check if the route is saved on load
    useEffect(() => {
        const checkRouteSaved = async () => {
            try {
                const token = await getItem("token");
                const response = await axios.get(
                    `${process.env.EXPO_PUBLIC_API_BASE}/getSavedRoutes`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const savedRoutes = response.data.savedRoutes;
                setIsSaved(
                    savedRoutes.some(
                        (route: IRouteSection) =>
                            route.routeId === Number(routeId)
                    )
                );
            } catch (err) {
                console.error("Error checking route save:", err);
            }
        };
        checkRouteSaved();
    }, []);

    useEffect(() => {
        setRefresh(true);
    }, [date]);

    useEffect(() => {
        if (!refresh) return;
        setError("");
        const fetchData = async () => {
            const token = await getItem("token");
            setLoading(true);
            axios
                .get(`${process.env.EXPO_PUBLIC_API_BASE}/tripsList`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        routeId,
                        departId,
                        arriveId,
                        date,
                    },
                })
                .then((res) => {
                    setDepartName(res.data.departName);
                    setArriveName(res.data.arriveName);
                    setTrips(res.data.trips);
                })
                .catch((err) => {
                    setError(err.response.data.error);
                })
                .finally(() => {
                    setLoading(false);
                    setRefresh(false);
                });
        };

        fetchData();
    }, [date, routeId, departId, arriveId, refresh]);

    const toggleSaveRoute = async () => {
        try {
            const token = await getItem("token");
            const endpoint = isSaved ? "/unsaveRoute" : "/saveRoute";

            await axios.post(
                `https://banana-bus.vercel.app${endpoint}`,
                {
                    routeId: Number(routeId),
                    departId: Number(departId),
                    arriveId: Number(arriveId),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setIsSaved(!isSaved);
        } catch (err) {
            console.error("Error toggling route save:", err);
            Alert.alert("Error", "Failed to save/unsave route");
        }
    };

    function Header() {
        return (
            <View style={styles.header}>
                <Text style={styles.goBackText} onPress={() => router.back()}>
                    <FontAwesome name="arrow-left" style={styles.goBackArrow} />{" "}
                    go back
                </Text>
                <View style={styles.locationContainer}>
                    <Text style={styles.departText}>{departName}</Text>
                    <View style={styles.arriveContainer}>
                        <FontAwesome
                            name="arrow-right"
                            style={styles.arriveArrow}
                        ></FontAwesome>
                        <Text style={styles.arriveText}>{arriveName}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={toggleSaveRoute}
                        style={styles.starButton}
                    >
                        <FontAwesome
                            name={isSaved ? "star" : "star-o"}
                            style={styles.starIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <Container>
                <Header />
                <LoadingPage />
            </Container>
        );
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <Container>
            <Header />
            <ScrollView style={styles.tripListContainer}>
                <TouchableOpacity
                    style={styles.tripListDate}
                    onPress={() => setOpen(true)}
                >
                    <Text style={styles.tripListDateText}>
                        {format(date, "E, do LLL y")}
                    </Text>
                    <FontAwesome
                        name="chevron-down"
                        style={styles.tripDateArrow}
                    ></FontAwesome>
                </TouchableOpacity>
                {trips.length > 0 ? (
                    <View>
                        {trips.map((t, index) => (
                            <TripListBox
                                key={index}
                                trip={t}
                                disabled={false}
                            />
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyMessage}>
                        No available trips for this date! {"\n"} Please try
                        again later.
                    </Text>
                )}
            </ScrollView>
            <DatePicker
                modal
                open={open}
                date={date}
                mode="date"
                minimumDate={new Date()}
                onConfirm={(date) => {
                    setOpen(false);
                    setDate(date);
                }}
                onCancel={() => {
                    setOpen(false);
                }}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: "white",
        height: "22%",
        padding: 28,
        boxShadow: "0px 0px 5px grey",
    },
    goBackArrow: {
        fontSize: 20,
    },
    goBackText: {
        fontWeight: "bold",
        fontSize: 20,
        color: "#74b9f1",
    },
    locationContainer: {
        justifyContent: "center",
        height: "80%",
    },
    departText: {
        fontWeight: "bold",
        fontSize: 25,
        marginTop: 10,
    },
    arriveContainer: {
        flexDirection: "row",
    },
    arriveArrow: {
        paddingTop: 5,
        fontSize: 25,
    },
    arriveText: {
        fontWeight: "bold",
        fontSize: 25,
        paddingLeft: 10,
    },
    tripListContainer: {
        paddingHorizontal: 20,
    },
    tripListDate: {
        marginVertical: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingRight: 20,
    },
    tripListDateText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    tripDateArrow: {
        fontSize: 20,
        alignSelf: "center",
        color: "#74b9f1",
    },
    // Star styles
    starButton: {
        padding: 8,
    },
    starIcon: {
        fontSize: 24,
        color: "#FFD700",
    },
    emptyMessage: {
        fontSize: 18,
        fontStyle: "italic",
        color: "#888",
        textAlign: "center",
        marginBottom: 14,
    },
});

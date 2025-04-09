import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { format } from "date-fns"
import TripListBox from "@/components/TripListBox";
import axios from "axios";
import { TripBox } from "@/api/interface";
import { LoadingPage } from "@/components/LoadingPage";

export default function tripsList() {
    const { routeId, departId, arriveId, date } = useLocalSearchParams<{routeId: string; departId: string; arriveId: string, date: string}>()

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")
    const [departName, setDepartName] = useState("Loading");
    const [arriveName, setArriveName] = useState("");
    const [trips, setTrips] = useState<TripBox[]>([]);

    useEffect(() => {
        setLoading(true)
        axios.get("https://banana-bus.vercel.app/tripsList", {
            params: {
                routeId,
                departId,
                arriveId,
                date
            }
        }).then((res) => {
            setDepartName(res.data.departName)
            setArriveName(res.data.arriveName)
            setTrips(res.data.trips)
        }).catch((err) => {
            setError(err.response.data.error)
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    function Header() {
        return(
            <View style= {styles.header}>
                <View style={styles.goBackContainer}>
                    <FontAwesome name="arrow-left" style = {styles.goBackArrow} onPress={() => router.back()}></FontAwesome>
                    <Text style = {styles.goBackText} onPress={() => router.back()}>go back</Text>
                </View>
                <View style = {styles.locationContainer}>
                    <Text style = {styles.departText}>{departName}</Text>
                    <View style={styles.arriveContainer}>
                        <FontAwesome name="arrow-right" style = {styles.arriveArrow}></FontAwesome>
                        <Text style = {styles.arriveText}>{arriveName}</Text>
                    </View>
                </View>
            </View>
        )
    }

    // TODO: add refresh

    if (loading) {
        return(
            <View style={styles.screen}>
                <Header/>
                <LoadingPage/>
            </View>
        )
    }

    // make nicer or pop up
    if (error) {
        return(
            <Text>Error: {error}</Text>
        )
    }

    return(
        <View style={styles.screen}>
            <Header/>
            <ScrollView style={styles.tripListContainer}>   
            <Text style = {styles.tripListDate}>{format(date, "E, do LLL y")}</Text>
                <View>
                    {trips.map((t, index )=> <TripListBox key={index} trip={t} disabled={false}/>)}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        height: "100%",
        backgroundColor: "lightblue",
    },
    header: {
        backgroundColor: "white",
        height: "22%",
        padding: 20,
        boxShadow: "0px 0px 5px grey"
    },
    goBackContainer: {
        height: "20%",
        flexDirection: "row",
    },
    goBackArrow: {
        paddingTop: 5,
        color: "#009cff",
        fontSize: 20,
    },
    goBackText: {   
        fontWeight: "bold",
        fontSize: 20,
        color: "#009cff",
        paddingLeft: 10,
    },
    locationContainer: {
        justifyContent: "center",
        height: "80%" 
    }, 
    departText: {
        fontWeight: "bold",
        fontSize: 25,
        marginTop: 10,
    },
    arriveContainer: {
        flexDirection: "row"
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
        padding: 20,
    },
    tripListDate: {
        fontWeight: "bold",
        fontSize: 20,
        paddingBottom: 20,
        paddingLeft: 10,
    }
});
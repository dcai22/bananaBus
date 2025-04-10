import React, { useCallback, useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Touchable, TouchableOpacity } from "react-native";
import { format } from "date-fns"
import TripListBox from "@/components/TripListBox";
import axios from "axios";
import { TripBox } from "@/api/interface";
import { LoadingPage } from "@/components/LoadingPage";
import { getItem } from "../helper";
import DatePicker from 'react-native-date-picker'

export default function tripsList() {
    const { routeId, departId, arriveId } = useLocalSearchParams<{routeId: string; departId: string; arriveId: string}>()

     const [refresh, setRefresh] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")
    const [departName, setDepartName] = useState("Loading");
    const [arriveName, setArriveName] = useState("");
    const [trips, setTrips] = useState<TripBox[]>([]);
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    
    useFocusEffect(
        useCallback(() => { 
            setRefresh(true)
            // Makes sure to reload page upon leaving page
            return () => {
                setLoading(true)
            };
        }, [])
    )
    
    useEffect(() => {
        setRefresh(true);
    }, [date]);

    useEffect(() => {
        if (!refresh) return
        const fetchData = async () => {
            const token = await getItem("token");
            setLoading(true)
            axios.get("https://banana-bus.vercel.app/tripsList", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                params: {
                    routeId,
                    departId,
                    arriveId,
                    date
                }
            }).then((res) => {
                setDepartName(res.data.departName)
                setArriveName(res.data.arriveName)
                console.log(res.data.trips)
                setTrips(res.data.trips)
            }).catch((err) => {
                setError(err.response.data.error)
            }).finally(() => {
                setLoading(false)
                setRefresh(false)
            })
        }

        fetchData();
    }, [date, routeId, departId, arriveId, refresh])


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
                <TouchableOpacity style={styles.tripListDate} onPress={() => setOpen(true)}>
                    <Text style={styles.tripListDateText}>{format(date, "E, do LLL y")}</Text>
                    <FontAwesome name="chevron-down" style={styles.tripDateArrow}></FontAwesome>
                </TouchableOpacity>
                <View>
                    {trips.map((t, index )=> <TripListBox key={index} trip={t} disabled={false}/>)}
                </View>
            </ScrollView>
            <DatePicker
                modal
                open={open}
                date={date}
                minimumDate={new Date()}
                onConfirm={(date) => {
                    setOpen(false)
                    setDate(date)
                }}
                onCancel={() => {
                    setOpen(false)
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        height: "100%",
        backgroundColor: "#e5f0fa",
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
        color: "#74b9f1",
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
        marginBottom: 20,
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
});
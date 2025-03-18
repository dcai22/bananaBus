import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, StyleSheet} from "react-native";
import { format, set } from "date-fns"
import TripListBox from "@/components/TripListBox";
import { useEffect, useState } from "react";
import axios from "axios";
import { tripBox } from "@/server/interface";

// TODO: fix up stack/tabs so router back works properly


export default function tripsList() {
    const { routeId, departId, arriveId, date } = useLocalSearchParams<{routeId: string; departId: string; arriveId: string, date: string}>()

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")
    const [departName, setDepartName] = useState("");
    const [arriveName, setArriveName] = useState("");
    const [trips, setTrips] = useState<tripBox[]>([]);

    useEffect(() => {
        setLoading(true)
        axios.get("http://localhost:3000/tripsList", {
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
            console.log(err.response.data.error);
            console.log(err.response.status);
            setError(err.response.data.error)
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    // TODO: make more responsive to screen size and create stylesheets

    // TODO: add refresh

    // make nicer
    if (loading) {
        return(
            <Text>Loading.... asdsadasd</Text>
        )
    }

    // make nicer or pop up
    if (error) {
        return(
            <Text>{error}</Text>
        )
    }

    return(
        <View style={styles.screen}>
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
            <View style={styles.tripListContainer}>   
            <Text style = {styles.tripListDate}>{format(date, "E, do LLL y")}</Text>
                <View>
                    {trips.map((t, index )=> <TripListBox key={index} {...t}/>)}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        height: "100%",
        backgroundColor: "lightblue",
        overflowY: "scroll",
    },
    header: {
        backgroundColor: "white",
        height: "20%",
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
        height: "80%",
        margin: 20,
    },
    tripListDate: {
        fontWeight: "bold",
        fontSize: 20,
        paddingBottom: 20,
        paddingLeft: 10,
    }
});
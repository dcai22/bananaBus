import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, StyleSheet} from "react-native";
import { format, set } from "date-fns"
import TripListBox from "@/components/TripListBox";
import { useEffect, useState } from "react";
import axios from "axios";
import { tripBox } from "@/server/interface";

// TODO: fix up stack/tabs so router back works properly


export default function booking() {
    const { routeId, departId, arriveId, tripId } = useLocalSearchParams<{routeId: string; departId: string; arriveId: string, tripId: string}>()

    return(
        <View style={styles.screen}>
            <View style= {styles.header}>
                <View style={styles.goBackContainer}>
                    <FontAwesome name="arrow-left" style = {styles.goBackArrow} onPress={() => router.back()}></FontAwesome>
                    <Text style = {styles.goBackText} onPress={() => router.back()}>go back</Text>
                </View>
                <Text>Booking</Text>
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
    }
});
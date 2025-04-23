import Container from "@/components/Container";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import axios from "axios";
import { API_BASE } from '@env';
import { NoButton } from "@/components/Buttons";
import { getItem } from "../helper";

export default function driverReportProblem() {
    const { vehicleId, numberPlate } = useLocalSearchParams<{vehicleId: string, numberPlate: string}>();

    const [error, setError] = useState("");
    const [reportText, setReportText] = useState("");
    const [done, setDone] = useState(false);
    
    useFocusEffect(
        useCallback(() => { 
            setError("");
            setReportText("");
            setDone(false);
        }, [])
    )
    
    useEffect(() => {
        if (done) router.back();
    }, [done]);
    
    const handleSend = async () => {
        if (reportText === "") {
            setError("report cannot be empty");
            return;
        }

        const token = await getItem("token");
        console.log(token);
        
        axios.put(
            `${API_BASE}/driver/reportVehicle`,
            {
                vehicleId,
                reportText,
            },
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        ).then(() => {
            setDone(true);
        }).catch((err) => {
            setError(err.response.data.error);
        });
    }

    // make nicer or pop up
    if (error) {
        return(
            <Text>Error: {JSON.stringify(error)}</Text>
        )
    }
    
    return (
        <Container>
            <View style= {styles.header}>
                <View style={styles.goBackContainer}>
                    <FontAwesome name="arrow-left" style = {styles.goBackArrow} onPress={() => router.back()}></FontAwesome>
                    <Text style = {styles.goBackText} onPress={() => router.back()}>go back</Text>
                </View>
                <View style = {styles.locationContainer}>
                    <Text style = {styles.departText}>Vehicle Report: {numberPlate.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.section}>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Type your enquiry here..."
                    value={reportText}
                    onChangeText={setReportText}
                    multiline
                />
                <NoButton text="Send Report" onPress={handleSend} />
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
    screen: {
        height: "100%",
        backgroundColor: "#e5f0fa",
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
});

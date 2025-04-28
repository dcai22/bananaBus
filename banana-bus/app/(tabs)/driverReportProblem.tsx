import Container from "@/app/components/Container";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, TextInput, Alert } from "react-native";
import axios from "axios";
import { YesButton } from "@/app/components/Buttons";
import { getItem } from "../helper";
import { Header } from "@/app/components/Header";

/**
 * Driver Report Problem Screen
 * 
 * Allows drivers to report issues with their assigned vehicles. Drivers can enter
 * a description of the problem and submit it to the database.
 */
export default function driverReportProblem() {
    const { vehicleId, numberPlate } = useLocalSearchParams<{vehicleId: string, numberPlate: string}>();

    const [error, setError] = useState("");
    const [reportText, setReportText] = useState("");
    const [done, setDone] = useState(false);

    /**
     * Resets the form and error state on every visit.
     */
    useFocusEffect(
        useCallback(() => { 
            setError("");
            setReportText("");
            setDone(false);
        }, [])
    )

    /**
     * Handles the submission of the report. If the report is successful, it navigates back to the previous screen.
     */
    useEffect(() => {
        if (done) router.back();
    }, [done]);
    
    /**
     * Handles the submission of the report. It checks if the report text is empty, and if not, sends it to the backend API.
     * If an error occurs, it sets the error state to display an alert.
     */
    const handleSend = async () => {
        if (reportText === "") {
            setError("Please enter a report text.");
            return;
        }

        const token = await getItem("token");
        console.log(token);
        
        axios.put(
            `${process.env.EXPO_PUBLIC_API_BASE}/driver/reportVehicle`,
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

    if (error) {
        Alert.alert(`Error ${error}`)
        setError("");
    }
    
    return (
        <Container>
            {/* Header */}
            <Header title="Report Problem" icon={<FontAwesome name="exclamation-circle"/>} />
            {/* Report Form */}
            <View style={styles.section}>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Type your enquiry here..."
                    value={reportText}
                    onChangeText={setReportText}
                    multiline
                />
                <YesButton text="Send Report" onPress={handleSend} style={styles.button}/>
            </View>
        </Container>
    )
}

const styles = StyleSheet.create({
    section: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        paddingTop: 0,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
        width: "100%",
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        flex: 0,
        marginHorizontal: 0,
        width: "100%",
    }
});

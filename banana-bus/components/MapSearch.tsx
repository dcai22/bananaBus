import { Text, View, StyleSheet } from "react-native";
import React, { useState } from "react";

export default function MapSearch() {
    const [fromLoc, setFromLoc] = useState("Kuala Lumpur Intl. T1");
    const [toLoc, setToLoc] = useState("1utama Shopping Mall");

    return (
        <View style={styles.container}>
            <View style={styles.fromSection}>
                <Text style={styles.label}>From</Text>
                <Text style={styles.location}>Kuala Lumpur Intl. T1</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.toSection}>
                <Text style={styles.label}>To</Text>
                <Text style={styles.location}>1utama Shopping Mall</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    fromSection: {
        flex: 1,
        padding: 16,
    },
    toSection: {
        flex: 1,
        padding: 16,
    },
    divider: {
        width: 1,
        backgroundColor: "#e0e0e0",
    },
    label: {
        fontSize: 14,
        color: "#000",
        fontWeight: "600",
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: "#666",
    },
});

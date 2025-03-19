import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Redirect } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import Mapbox from "@rnmapbox/maps";
import { Camera } from "@rnmapbox/maps";
import { SafeAreaView } from "react-native-safe-area-context";
import MapSearch from "@/components/MapSearch";
import { FontAwesome } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";

Mapbox.setAccessToken(
    "pk.eyJ1IjoiMzkwMGYxNWFiYW5hbmEyNSIsImEiOiJjbTg3ZWhxNmMwNzF6MmxvYjg3Z2dwdmx6In0.PlMxV_sUySfYSA3UNzuglA"
);

export default function Index() {
    const [location, setLocation] = useState({
        latitude: 2.7567602,
        longitude: 101.7007533, // Default to Bus Terminal, KLIA 1
    });

    const cameraRef = useRef<Camera>(null);
    const locationTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchLocation = async () => {
        try {
            // Set location permission
            const { status } =
                await ExpoLocation.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Please allow location access to use this feature",
                    [{ text: "OK" }]
                );
                return;
            }

            // Get current location
            const currentLocation =
                await ExpoLocation.getCurrentPositionAsync();

            const newLocation = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };
            setLocation(newLocation);
        } catch (error) {
            console.error("Error getting location:", error);
            Alert.alert(
                "Something went wrong!",
                "Unable to get your current location",
                [{ text: "OK" }]
            );
        }
    };

    const pinpoint = async () => {
        try {
            await fetchLocation();
            if (cameraRef.current) {
                cameraRef.current.setCamera({
                    centerCoordinate: [location.longitude, location.latitude],
                    zoomLevel: 16,
                    animationDuration: 1000,
                });
            }
        } catch (error) {
            console.error("Error pinpointing location:", error);
            Alert.alert(
                "Pinpoint failed!",
                "Unable to get your current location",
                [{ text: "OK" }]
            );
        }
    };

    useEffect(() => {
        // Initial location fetch
        fetchLocation();

        // Update location every 10 seconds (10000 ms)
        // You can change this value to your preferred interval
        locationTimerRef.current = setInterval(fetchLocation, 2000);

        // Clean up function to clear interval when component unmounts
        return () => {
            if (locationTimerRef.current) {
                clearInterval(locationTimerRef.current);
                locationTimerRef.current = null;
            }
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mapContainer}>
                <Mapbox.MapView
                    style={styles.map}
                    styleURL={Mapbox.StyleURL.Street}
                >
                    <Mapbox.Camera
                        ref={cameraRef}
                        // zoomLevel={14}
                        // centerCoordinate={[
                        //     location.longitude,
                        //     location.latitude,
                        // ]}
                        // animationDuration={300}
                    />

                    {/* Location marker */}
                    <Mapbox.PointAnnotation
                        id="currentLocation"
                        coordinate={[location.longitude, location.latitude]}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.marker} />
                        </View>
                    </Mapbox.PointAnnotation>
                </Mapbox.MapView>
            </View>

            {/* Location Update */}
            <TouchableOpacity style={styles.locationButton} onPress={pinpoint}>
                <FontAwesome name="location-arrow" size={20} color="white" />
            </TouchableOpacity>

            <View style={styles.MapSearchContainer}>
                <MapSearch />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    map: {
        flex: 1,
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    locationButton: {
        position: "absolute",
        right: 20,
        bottom: 100,
        backgroundColor: "#1a73e8",
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    markerContainer: {
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    marker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "blue",
        borderWidth: 2,
        borderColor: "white",
    },
    MapSearchContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
});

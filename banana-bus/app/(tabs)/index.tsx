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
    const locationWatcherRef = useRef<ExpoLocation.LocationSubscription | null>(
        null
    );

    const requestLocationPermission = async () => {
        try {
            const { status } =
                await ExpoLocation.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Please allow location access to use this feature",
                    [{ text: "OK" }]
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error requesting location permission:", error);
            return false;
        }
    };

    const startLocationTracking = async () => {
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) return;

            locationWatcherRef.current = await ExpoLocation.watchPositionAsync(
                {
                    accuracy: ExpoLocation.Accuracy.High,
                    distanceInterval: 10,
                    timeInterval: 1000,
                },
                (newLocation) => {
                    console.log("Location updated:", newLocation.coords);
                    setLocation({
                        latitude: newLocation.coords.latitude,
                        longitude: newLocation.coords.longitude,
                    });
                }
            );
        } catch (error) {
            console.error("Error watching location:", error);
            Alert.alert(
                "Something went wrong!",
                "Unable to track your location",
                [{ text: "OK" }]
            );
        }
    };

    const pinpoint = async () => {
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) return;

            const currentLocation = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.High,
            });

            const newLocation = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };

            setLocation(newLocation);

            if (cameraRef.current) {
                cameraRef.current.setCamera({
                    centerCoordinate: [
                        newLocation.longitude,
                        newLocation.latitude,
                    ],
                    zoomLevel: 15,
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
        console.log("Starting location tracking");
        startLocationTracking();

        return () => {
            if (locationWatcherRef.current) {
                locationWatcherRef.current.remove();
                locationWatcherRef.current = null;
                console.log("Location tracking stopped");
            }
        };
    }, []);

    // TODO: Change this so it doesnt autoupdate when location updates, only when pinpoint
    useEffect(() => {
        if (cameraRef.current && location) {
            cameraRef.current.setCamera({
                centerCoordinate: [location.longitude, location.latitude],
                zoomLevel: 15,
                animationDuration: 1000,
            });
        }
    }, [location]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mapContainer}>
                <Mapbox.MapView
                    style={styles.map}
                    styleURL={Mapbox.StyleURL.Street}
                >
                    <Mapbox.Camera
                        ref={cameraRef}
                        defaultSettings={{
                            centerCoordinate: [
                                location.longitude,
                                location.latitude,
                            ],
                            zoomLevel: 14,
                        }}
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

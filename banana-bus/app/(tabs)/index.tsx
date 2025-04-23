import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Mapbox, { Camera } from "@rnmapbox/maps";
import { SafeAreaView } from "react-native-safe-area-context";
import MapSearch from "@/components/MapSearch";
import * as ExpoLocation from "expo-location";
import { useNavigation } from "expo-router";
import { router } from "expo-router";

// Icons
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { getItem } from "../helper";
import axios from "axios";
import { API_BASE } from "../index";

const MAPBOX_TOKEN =
    "pk.eyJ1IjoiMzkwMGYxNWFiYW5hbmEyNSIsImEiOiJjbTg3ZWhxNmMwNzF6MmxvYjg3Z2dwdmx6In0.PlMxV_sUySfYSA3UNzuglA";
Mapbox.setAccessToken(MAPBOX_TOKEN);

export interface IRoute {
    routeId: number;
    stops: number[];
    trips: number[];
}

export interface IStop {
    _id: string | null;
    name: string | null;
    lat: number | null;
    lng: number | null;
}

interface RouteGeometry {
    type: "LineString";
    coordinates: number[][];
}

// async function getRouteId(departId: string, arriveId: string) {
//     try {
//         const token = await getItem("token");
//         const response = await axios.get(
//             `${API_BASE}/routes/fromSection`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//                 params: {
//                     departId,
//                     arriveId,
//                 },
//             }
//         );
//         return response.data[0]._id; // TODO: Fix this later to use more than one
//     } catch (error) {
//         console.error("Error fetching route id:", error);
//         Alert.alert("Something went wrong!", "Error fetching destinations", [
//             { text: "OK" },
//         ]);
//     }
// }

export default function Index() {
    const [location, setLocation] = useState({
        lat: 2.7567602,
        lng: 101.7007533, // Default to Bus Terminal, KLIA 1
    });
    const [compassHeading, setCompassHeading] = useState(0);
    const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(
        null
    );
    const [fromLoc, setFromLoc] = useState<IStop>({
        _id: null,
        name: null,
        lng: null,
        lat: null,
    });
    const [toLoc, setToLoc] = useState<IStop>({
        _id: null,
        name: null,
        lng: null,
        lat: null,
    });
    const [routeId, setRouteId] = useState<string | null>(null);

    const cameraRef = useRef<Camera>(null);
    const locationWatcherRef = useRef<ExpoLocation.LocationSubscription | null>(
        null
    );

    const navigation = useNavigation();

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
                    // TODO console.log("Location updated:", newLocation.coords);
                    setLocation({
                        lat: newLocation.coords.latitude,
                        lng: newLocation.coords.longitude,
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

    // TODO: Debug its a little glitchy sometimes idk why
    const pinpoint = async () => {
        try {
            if (cameraRef.current) {
                cameraRef.current.setCamera({
                    centerCoordinate: [location.lng, location.lat],
                    zoomLevel: 15,
                    animationDuration: 1000,
                });
            }

            const hasPermission = await requestLocationPermission();
            if (!hasPermission) return;

            const currentLocation = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.High,
            });

            const newLocation = {
                lat: currentLocation.coords.latitude,
                lng: currentLocation.coords.longitude,
            };

            setLocation(newLocation);

            if (cameraRef.current) {
                cameraRef.current.setCamera({
                    centerCoordinate: [location.lng, location.lat],
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

    const onCameraChange = (event : any) => {
        if (event.properties.heading !== undefined) {
            setCompassHeading(event.properties.heading);
        }
    };

    // Function to fetch route between two points
    const fetchRoute = async () => {
        if (!fromLoc.lng || !fromLoc.lat || !toLoc.lng || !toLoc.lat) {
            Alert.alert(
                "Error",
                "Please select both start and destination locations"
            );
            return;
        }

        try {
            const startCoord = `${fromLoc.lng},${fromLoc.lat}`;
            const endCoord = `${toLoc.lng},${toLoc.lat}`;
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${startCoord};${endCoord}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                setRouteGeometry({
                    coordinates: data.routes[0].geometry.coordinates,
                    type: "LineString",
                });

                // Adjust camera to fit the route
                fitToRoute(data.routes[0].geometry.coordinates);
            } else {
                Alert.alert(
                    "Route Error",
                    "No route found between these locations"
                );
            }
        } catch (error) {
            console.error("Error fetching route:", error);
            Alert.alert("Error", "Failed to fetch route directions");
        }
    };

    // Fit camera to route
    const fitToRoute = (coordinates: number[][]) => {
        if (coordinates.length < 2 || !cameraRef.current) return;

        let minLng = coordinates[0][0];
        let maxLng = coordinates[0][0];
        let minLat = coordinates[0][1];
        let maxLat = coordinates[0][1];

        coordinates.forEach((coord) => {
            minLng = Math.min(minLng, coord[0]);
            maxLng = Math.max(maxLng, coord[0]);
            minLat = Math.min(minLat, coord[1]);
            maxLat = Math.max(maxLat, coord[1]);
        });

        const paddingFactor = 0.1;
        const lngDelta = maxLng - minLng;
        const latDelta = maxLat - minLat;

        minLng -= lngDelta * paddingFactor;
        maxLng += lngDelta * paddingFactor;
        minLat -= latDelta * paddingFactor;
        maxLat += latDelta * paddingFactor;

        cameraRef.current.fitBounds(
            [minLng, minLat],
            [maxLng, maxLat],
            100,
            1000
        );
    };

    useEffect(() => {
        const fetchRouteId = async () => {
            try {
                const token = await getItem("token");
                const response = await axios.get(
                    `${API_BASE}/routes/fromSection`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            departId: fromLoc._id,
                            arriveId: toLoc._id,
                        },
                    }
                );
                // TODO console.log(response.data.routes[0]);
                setRouteId(response.data.routes[0]._id); // TODO: Fix this later to use more than one route
            } catch (error) {
                console.error("Error fetching route id:", error);
                Alert.alert(
                    "Something went wrong!",
                    "Error fetching destinations",
                    [{ text: "OK" }]
                );
            }
        };

        if (fromLoc.lng && fromLoc.lat && toLoc.lng && toLoc.lat) {
            fetchRoute();
            fetchRouteId();
        }
    }, [fromLoc, toLoc]);

    useEffect(() => {
        // TODO console.log("Starting location tracking");
        startLocationTracking();

        return () => {
            if (locationWatcherRef.current) {
                locationWatcherRef.current.remove();
                locationWatcherRef.current = null;
                // TODO console.log("Location tracking stopped");
            }
        };
    }, []);

    // TODO: Change this so it doesnt autoupdate when location updates, only when pinpoint
    // useEffect(() => {
    //     if (cameraRef.current && location) {
    //         cameraRef.current.setCamera({
    //             centerCoordinate: [location.lng, location.lat],
    //             zoomLevel: 15,
    //             animationDuration: 1000,
    //         });
    //     }
    // }, [location]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mapContainer}>
                <Mapbox.MapView
                    style={styles.map}
                    styleURL={Mapbox.StyleURL.Street}
                    onCameraChanged={onCameraChange}
                >
                    <Mapbox.Camera
                        ref={cameraRef}
                        defaultSettings={{
                            centerCoordinate: [location.lng, location.lat],
                            zoomLevel: 14,
                        }}
                    />

                    {/* Route Line */}
                    {routeGeometry && (
                        <Mapbox.ShapeSource
                            id="routeSource"
                            shape={routeGeometry}
                        >
                            <Mapbox.LineLayer
                                id="routeLine"
                                style={{
                                    lineColor: "#2196F3",
                                    lineWidth: 4,
                                    lineCap: "round",
                                    lineJoin: "round",
                                }}
                            />
                        </Mapbox.ShapeSource>
                    )}

                    {/* Location marker */}
                    <Mapbox.PointAnnotation
                        id="currentLocation"
                        coordinate={[location.lng, location.lat]}
                    >
                        <View style={styles.marker} />
                    </Mapbox.PointAnnotation>

                    {/* From marker */}
                    {fromLoc.lng !== null && fromLoc.lat !== null && (
                        <>
                            <Mapbox.PointAnnotation
                                id="fromLocation"
                                coordinate={[fromLoc.lng, fromLoc.lat]}
                            >
                                <View
                                    style={[styles.marker, styles.fromMarker]}
                                />
                            </Mapbox.PointAnnotation>

                            {/* Booking label - only show when both to and from are set*/}

                            {fromLoc._id && toLoc._id && (
                                <Mapbox.MarkerView
                                    id="bookingLabel"
                                    coordinate={[fromLoc.lng, fromLoc.lat]}
                                    anchor={{ x: 0.5, y: 1 }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.labelContainer,
                                            styles.bookingContainer,
                                        ]}
                                        hitSlop={{
                                            top: 20,
                                            bottom: 20,
                                            left: 20,
                                            right: 20,
                                        }}
                                        onPressIn={() => {
                                            // TODO console.log("Button pressed!");
                                            router.push({
                                                pathname: "/tripsList",
                                                params: {
                                                    routeId: routeId,
                                                    departId: fromLoc._id,
                                                    arriveId: toLoc._id,
                                                },
                                            });
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.labelText,
                                                styles.bookingText,
                                            ]}
                                        >
                                            Confirm Booking
                                        </Text>
                                        <FontAwesome
                                            name="arrow-right"
                                            size={12}
                                            color="black"
                                        />
                                    </TouchableOpacity>
                                </Mapbox.MarkerView>
                            )}
                        </>
                    )}

                    {/* To marker */}
                    {toLoc.lng !== null && toLoc.lat !== null && (
                        <>
                            <Mapbox.PointAnnotation
                                id="toLocation"
                                coordinate={[toLoc.lng, toLoc.lat]}
                            >
                                <View
                                    style={[styles.marker, styles.toMarker]}
                                />
                            </Mapbox.PointAnnotation>

                            {/* Destination label */}
                            <Mapbox.MarkerView
                                id="toLocationLabel"
                                coordinate={[toLoc.lng, toLoc.lat]}
                                anchor={{ x: 0.5, y: 1 }}
                            >
                                <View style={styles.labelContainer}>
                                    <Text style={styles.labelText}>
                                        {toLoc.name || "Destination"}
                                    </Text>
                                </View>
                            </Mapbox.MarkerView>
                        </>
                    )}
                </Mapbox.MapView>
            </View>

            {/* Location Update */}
            <TouchableOpacity style={styles.locationButton} onPress={pinpoint}>
                <FontAwesome name="location-arrow" size={20} color="white" />
            </TouchableOpacity>

            {/* Compass, click to reset north */}
            <TouchableOpacity
                style={styles.compassButton}
                onPress={() => {
                    if (cameraRef.current) {
                        cameraRef.current.setCamera({
                            heading: 0, // Reset to north
                            animationDuration: 500,
                        });
                    }
                }}
            >
                <View
                    style={[
                        styles.compassWrapper,
                        { transform: [{ rotate: `${compassHeading}deg` }] },
                    ]}
                >
                    <Entypo
                        name="triangle-up"
                        size={20}
                        color="#ff5959"
                        style={styles.triangleUp}
                    />

                    <Entypo
                        name="triangle-down"
                        size={20}
                        color="#d1d1d1"
                        style={styles.triangleDown}
                    />
                </View>
            </TouchableOpacity>

            <View style={styles.MapSearchContainer}>
                <MapSearch
                    fromLoc={fromLoc}
                    toLoc={toLoc}
                    setFromLoc={setFromLoc}
                    setToLoc={setToLoc}
                />
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
        backgroundColor: "#2196F3",
        borderWidth: 2,
        borderColor: "white",
    },
    fromMarker: {
        // backgroundColor: "2196F3",
    },
    toMarker: {
        borderRadius: 0,
    },
    MapSearchContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    labelContainer: {
        backgroundColor: "#2196F3",
        padding: 5,
        borderWidth: 1,
        borderColor: "#ddd",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 15,
        flexDirection: "row",
        gap: 8,
    },
    bookingContainer: {
        backgroundColor: "#E1FF00",
        padding: 6,
    },
    bookingText: {
        color: "black",
    },
    labelText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "white",
    },
    compassButton: {
        position: "absolute",
        right: 20,
        top: 20,
        backgroundColor: "white",
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    compassWrapper: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    triangleUp: {
        position: "absolute",
        top: 5,
    },
    triangleDown: {
        position: "absolute",
        bottom: 5,
    },
});

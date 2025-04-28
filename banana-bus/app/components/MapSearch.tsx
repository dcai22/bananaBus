import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
    FlatList,
    Keyboard,
    BackHandler,
} from "react-native";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesome } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { IStop } from "@/app/(tabs)";
import { getItem } from "@/app/helper";
import axios from "axios";
import { useFocusEffect } from "expo-router";

// Helper function to fetch all stops
async function getAllStops(): Promise<IStop[]> {
    try {
        const token = await getItem("token");
        const response = await axios.get(
            `${process.env.EXPO_PUBLIC_API_BASE}/manager/allStops`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching stops:", error);
        Alert.alert("Something went wrong!", "Error fetching stops", [
            { text: "OK" },
        ]);
        return [];
    }
}

// Helper function to get possible destinations from a selected stop
async function getPossibleDestinations(
    fromStopId: string,
    allStops: IStop[]
): Promise<IStop[]> {
    console.log("Attempting to fetch");

    try {
        const token = await getItem("token");
        const response = await axios.get(
            `${process.env.EXPO_PUBLIC_API_BASE}/stops/reachableFrom`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    fromId: fromStopId,
                },
            }
        );
        console.log(response.data);

        const destinationIds = response.data.stops || [];

        const destinations = destinationIds
            .map((id: string) => allStops.find((stop) => stop._id === id))
            .filter((stop: IStop) => stop._id !== fromStopId) as IStop[];

        console.log("Constructed destinations:", destinations);
        return destinations;
    } catch (error) {
        console.error("Error fetching destinations:", error);
        Alert.alert("Something went wrong!", "Error fetching destinations", [
            { text: "OK" },
        ]);
        return [];
    }
}

// Helper function to calculate distance from two sets of coordinates
function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
) {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
    // Haversine formula
    // a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
    // c = 2 ⋅ atan2( √a, √(1−a) )
    // d = R ⋅ c

    const R = 6371000; // earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
}

// Helper function that takes a distance in meters and returns a formatted string
function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${meters.toLocaleString()} m`;
    } else {
        const kilometers = (meters / 1000).toFixed(2);
        return `${Number(kilometers).toLocaleString()} km`;
    }
}

interface MapProps {
    fromLoc: IStop;
    toLoc: IStop;
    setFromLoc: (stopID: IStop) => void;
    setToLoc: (stopID: IStop) => void;
    currentLocation: {
        lat: number | null;
        lng: number | null;
    };
}

export default function MapSearch({
    fromLoc,
    toLoc,
    setFromLoc,
    setToLoc,
    currentLocation,
}: MapProps) {
    const [fromSearchActive, setFromSearchActive] = useState(false);
    const [toSearchActive, setToSearchActive] = useState(false);
    const [fromSearchQuery, setFromSearchQuery] = useState("");
    const [toSearchQuery, setToSearchQuery] = useState("");
    const [loadingQuery, setLoadingQuery] = useState(false);

    // State for storing fetched data
    const [allStops, setAllStops] = useState<IStop[]>([]);
    const [possibleDestinations, setPossibleDestinations] = useState<IStop[]>(
        []
    );

    const isSearchActive = fromSearchActive || toSearchActive;

    const fromInputRef = useRef<TextInput>(null);
    const toInputRef = useRef<TextInput>(null);

    const getStopDistance = (stop: IStop) => {
        if (
            currentLocation.lat == null ||
            currentLocation.lng == null ||
            !currentLocation ||
            !stop.lat ||
            !stop.lng
        ) {
            return null;
        }

        const distance = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            stop.lat,
            stop.lng
        );

        return formatDistance(distance);
    };

    // Fetch stops on component mount
    useEffect(() => {
        const fetchStops = async () => {
            try {
                const stops = await getAllStops();
                setAllStops(stops);
            } catch (error) {
                console.error("Failed to load stops:", error);
            }
        };

        fetchStops();
    }, []);

    // Update possible destinations on fromLoc update
    useEffect(() => {
        if (fromLoc._id) {
            const fetchDestinations = async () => {
                try {
                    const destinations = await getPossibleDestinations(
                        fromLoc._id as string,
                        allStops
                    );
                    setPossibleDestinations(destinations);
                } catch (error) {
                    console.error("Failed to load destinations:", error);
                }
            };

            fetchDestinations();
        } else {
            setPossibleDestinations([]);
        }
    }, [fromLoc._id]);

    const filteredFromStops = fromSearchQuery
        ? allStops.filter((stop) =>
              stop.name?.toLowerCase().includes(fromSearchQuery.toLowerCase())
          )
        : allStops;

    const filteredToStops = toSearchQuery
        ? possibleDestinations.filter((stop) =>
              stop.name?.toLowerCase().includes(toSearchQuery.toLowerCase())
          )
        : possibleDestinations;

    const handleFromSelect = (stop: IStop) => {
        console.log(stop);
        setFromLoc(stop);
        setFromSearchQuery("");

        activateToSearch();
    };

    const handleToSelect = (stop: IStop) => {
        console.log(stop);
        setToLoc(stop);
        setToSearchActive(false);
        Keyboard.dismiss();
    };

    const activateFromSearch = () => {
        console.log("from search selected");
        setFromSearchActive(true);
        setToSearchActive(false);

        // Focus the from input after a short delay to ensure the component has updated
        setTimeout(() => {
            if (fromInputRef.current) {
                fromInputRef.current.focus();
            }
        }, 50);
    };

    const activateToSearch = () => {
        console.log("to search selected");
        setToSearchActive(true);
        setFromSearchActive(false);

        setTimeout(() => {
            if (toInputRef.current) {
                toInputRef.current.focus();
            }
        }, 50);
    };

    const closeSearch = useCallback(() => {
        setFromSearchActive(false);
        setToSearchActive(false);
        Keyboard.dismiss();
        return true;
    }, []);

    useFocusEffect(
        useCallback(() => {
            // close search when user leaves screen
            return () => {
                closeSearch();
            };
        }, [closeSearch])
    );

    // Handle Back button
    useEffect(() => {
        if (isSearchActive) {
            BackHandler.addEventListener("hardwareBackPress", closeSearch);
        }

        return () => {
            BackHandler.removeEventListener("hardwareBackPress", closeSearch);
        };
    }, [isSearchActive]);

    // Search result component
    const renderStopItem = (
        { item, index }: { item: IStop; index: number },
        onSelect: (stop: IStop) => void,
        distance: string | null
    ) => (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => onSelect(item)}
        >
            <View style={styles.locationRow}>
                <FontAwesome
                    name="map-marker"
                    size={16}
                    color="#888"
                    style={styles.locationIcon}
                />
                <Text style={styles.listItemText}>{item.name}</Text>
            </View>
            {distance !== null && (
                <View style={styles.distanceInfo}>
                    <Text style={styles.distanceText}>{distance}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    // List Foot component
    const ListFooter = () => {
        return (
            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>No more results</Text>
            </View>
        );
    };

    const ITEM_HEIGHT = 45;
    const VISIBLE_ITEMS = 3.5;
    const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

    return (
        <View style={[styles.outerContainer]}>
            <View
                style={[
                    styles.container,
                    isSearchActive
                        ? styles.containerVertical
                        : styles.containerHorizontal,
                ]}
            >
                <TouchableOpacity
                    testID="from-section"
                    style={[
                        styles.fromSection,
                        isSearchActive ? styles.fullWidth : styles.halfWidth,
                        isSearchActive && styles.horizontalField,
                    ]}
                    onPress={activateFromSearch}
                >
                    <Text style={styles.label}>From</Text>
                    <TextInput
                        ref={fromInputRef}
                        testID="from-input"
                        style={styles.input}
                        value={fromSearchQuery}
                        onChangeText={setFromSearchQuery}
                        placeholder={fromLoc.name ?? "Search locations..."}
                        returnKeyType="next"
                        onFocus={activateFromSearch}
                        // autoFocus
                    />
                    {fromSearchActive && fromSearchQuery.length > 0 && (
                        <TouchableOpacity
                            testID="from-clear-button"
                            onPress={() => setFromSearchQuery("")}
                            style={styles.clearButton}
                        >
                            <FontAwesome6 name="xmark" size={16} color="#888" />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                <View
                    style={
                        isSearchActive
                            ? styles.horizontalDivider
                            : styles.verticalDivider
                    }
                />

                <TouchableOpacity
                    testID="to-section"
                    style={[
                        styles.toSection,
                        isSearchActive ? styles.fullWidth : styles.halfWidth,
                        isSearchActive && styles.horizontalField,
                    ]}
                    onPress={activateToSearch}
                >
                    <Text style={styles.label}>To</Text>
                    <TextInput
                        testID="to-input"
                        ref={toInputRef}
                        style={styles.input}
                        value={toSearchQuery}
                        onChangeText={setToSearchQuery}
                        placeholder={toLoc.name ?? "Search locations..."}
                        returnKeyType="done"
                        onFocus={activateToSearch}
                        // autoFocus
                    />
                    {toSearchActive && toSearchQuery.length > 0 && (
                        <TouchableOpacity
                            testID="to-clear-button"
                            onPress={() => setToSearchQuery("")}
                            style={styles.clearButton}
                        >
                            <FontAwesome6 name="xmark" size={16} color="#888" />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </View>

            {/* Results panel */}
            {isSearchActive && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsHeader}>
                        Closest Based on Location
                    </Text>
                    <FlatList
                        keyboardShouldPersistTaps="always"
                        data={
                            fromSearchActive
                                ? filteredFromStops.slice(0, 4)
                                : filteredToStops.slice(0, 4)
                        }
                        keyExtractor={(item) => item._id!.toString()}
                        renderItem={(props) =>
                            renderStopItem(
                                { ...props, index: props.index },
                                fromSearchActive
                                    ? handleFromSelect
                                    : handleToSelect,
                                getStopDistance(props.item)
                            )
                        }
                        style={[styles.list, { height: LIST_HEIGHT }]}
                        getItemLayout={(data, index) => ({
                            length: ITEM_HEIGHT,
                            offset: ITEM_HEIGHT * index,
                            index,
                        })}
                        ListFooterComponent={ListFooter}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        marginHorizontal: 16,
        // borderColor: "#F00",
        // borderWidth: 1,
        flex: 1,
    },
    container: {
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
        marginTop: 16,
        marginBottom: 16,
    },
    containerHorizontal: {
        flexDirection: "row",
    },
    containerVertical: {
        flexDirection: "column",
    },
    fromSection: {
        padding: 12,
    },
    toSection: {
        padding: 12,
    },
    halfWidth: {
        flex: 1,
    },
    fullWidth: {
        width: "100%",
    },
    horizontalField: {
        flexDirection: "row",
        alignItems: "center",
    },
    verticalDivider: {
        width: 1,
        backgroundColor: "#e0e0e0",
    },
    horizontalDivider: {
        height: 1,
        backgroundColor: "#e0e0e0",
        width: "100%",
    },
    label: {
        width: 48,
        fontSize: 14,
        color: "#000",
        fontWeight: "600",
        marginBottom: 4,
        marginRight: 12,
    },
    location: {
        fontSize: 14,
        color: "#666",
    },
    input: {
        fontSize: 14,
        color: "#333",
        padding: 0,
        flex: 1,
    },
    clearButton: {
        marginLeft: 4,
    },
    resultsContainer: {
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
        marginBottom: 16,
    },
    resultsHeader: {
        fontSize: 14,
        fontWeight: "600",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    list: {
        maxHeight: 250,
    },
    listItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationIcon: {
        marginRight: 8,
    },
    listItemText: {
        fontSize: 14,
    },
    distanceInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    distanceText: {
        fontSize: 14,
        color: "#666",
        marginRight: 8,
    },
    starIcon: {
        marginRight: 4,
    },
    footerContainer: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        alignItems: "center",
    },
    footerText: {
        fontSize: 13,
        color: "#888",
        fontStyle: "italic",
    },
});

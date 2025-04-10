import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
    FlatList,
    Keyboard,
    Animated,
    BackHandler,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Stop, Route } from "@/api/interface";
import { FontAwesome } from "@expo/vector-icons";
import { IStop, IRoute } from "@/app/(tabs)";
import { mockRoutes, mockStops } from "./temp";

// Helper function to fetch all stops
export function getAllStops(): Stop[] {
    return mockStops;
}

// Helper function to get possible destinations from a selected stop
export function getPossibleDestinations(fromStopId: number): Stop[] {
    // Find all routes that contain the fromStopId
    const relevantRoutes = mockRoutes.filter((route) =>
        route.stops.includes(fromStopId)
    );

    // Get all possible destination stop IDs from those routes
    const possibleStopIds = new Set<number>();

    relevantRoutes.forEach((route) => {
        const fromIndex = route.stops.indexOf(fromStopId);

        // Add all stops that come after the fromStop in each route
        for (let i = fromIndex + 1; i < route.stops.length; i++) {
            possibleStopIds.add(route.stops[i]);
        }
    });

    // Convert the stop IDs to actual Stop objects
    return mockStops.filter((stop) => possibleStopIds.has(stop.stopId));
}

// Helper function to get stopId from name
function getNameFromID(stopID: number): string | null {
    const stop = mockStops.find((stop) => stop.stopId === stopID);
    return stop ? stop.name : null;
}

interface MapProps {
    fromLoc: IStop;
    toLoc: IStop;
    setFromLoc: (stopID: IStop) => void;
    setToLoc: (stopID: IStop) => void;
}

export default function MapSearch({
    fromLoc,
    toLoc,
    setFromLoc,
    setToLoc,
}: MapProps) {
    const [fromSearchActive, setFromSearchActive] = useState(false);
    const [toSearchActive, setToSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fromInputRef = useRef(null);
    const toInputRef = useRef(null);

    const isSearchActive = fromSearchActive || toSearchActive;
    const allStops = getAllStops();

    const possibleDestinations = fromLoc.stopId
        ? getPossibleDestinations(fromLoc.stopId)
        : [];

    const filteredFromStops = searchQuery
        ? allStops.filter((stop) =>
              stop.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : allStops;

    const filteredToStops = searchQuery
        ? possibleDestinations.filter((stop) =>
              stop.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : possibleDestinations;

    const handleFromSelect = (stop: IStop) => {
        console.log(stop);
        setFromLoc(stop);
        activateToSearch();
        setSearchQuery("");
        // Keyboard.dismiss();
    };

    const handleToSelect = (stop: IStop) => {
        console.log(stop);
        setToLoc(stop);
        setToSearchActive(false);
        // setSearchQuery("");
        Keyboard.dismiss();
    };

    const activateFromSearch = () => {
        console.log("from search selected");
        setFromSearchActive(true);
        setToSearchActive(false);
        // TODO: Set to selected option, update search component to have clear button when the from/toloc has already been set
        setSearchQuery(fromLoc.name || "");

        // Focus the from input after a short delay to ensure the component has updated
        setTimeout(() => {
            if (fromInputRef.current) {
                fromInputRef.current.focus();
            }
        }, 50);
    };

    const activateToSearch = () => {
        console.log("from search selected");
        setToSearchActive(true);
        setFromSearchActive(false);
        setSearchQuery(toLoc.name || "");

        setTimeout(() => {
            if (toInputRef.current) {
                toInputRef.current.focus();
            }
        }, 50);
    };

    const closeSearch = () => {
        setFromSearchActive(false);
        setToSearchActive(false);
        Keyboard.dismiss();
        return true;
    };

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
    const renderStopItem = ({ item, index }, onSelect, distance = null) => (
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

                    {/* TODO: TouchableOpacity + Add logic to save trip */}
                    <FontAwesome
                        name="star-o"
                        size={16}
                        color="#888"
                        style={styles.starIcon}
                    />
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
                    style={[
                        styles.fromSection,
                        isSearchActive ? styles.fullWidth : styles.halfWidth,
                        isSearchActive && styles.horizontalField,
                    ]}
                    onPress={activateFromSearch}
                >
                    <Text style={styles.label}>From</Text>
                    {fromSearchActive ? (
                        <TextInput
                            ref={fromInputRef}
                            style={styles.input}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder={fromLoc.name ?? "Search locations..."}
                            returnKeyType="next"
                            // autoFocus
                        />
                    ) : (
                        <Text style={styles.location}>
                            {fromLoc.name ?? "Select Location"}
                        </Text>
                    )}
                </TouchableOpacity>

                {isSearchActive ? (
                    <View style={styles.horizontalDivider} />
                ) : (
                    <View style={styles.verticalDivider} />
                )}

                <TouchableOpacity
                    style={[
                        styles.toSection,
                        isSearchActive ? styles.fullWidth : styles.halfWidth,
                        isSearchActive && styles.horizontalField,
                    ]}
                    onPress={activateToSearch}
                >
                    <Text style={styles.label}>To</Text>
                    {toSearchActive ? (
                        <TextInput
                            ref={toInputRef}
                            style={styles.input}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder={toLoc.name ?? "Search locations..."}
                            returnKeyType="done"
                            // autoFocus
                        />
                    ) : (
                        <Text style={styles.location}>
                            {toLoc.name ?? "Select Location"}
                        </Text>
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
                        keyExtractor={(item) => item.stopId.toString()}
                        renderItem={(props) =>
                            renderStopItem(
                                { ...props, index: props.index },
                                fromSearchActive
                                    ? handleFromSelect
                                    : handleToSelect,
                                fromSearchActive ? "-1m" : "" // TODO: Fix this to actually calculate length
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
        borderColor: "#F00",
        borderWidth: 1,
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
        borderColor: "red",
        borderWidth: 1,
        width: "100%",
        height: "100%",
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
    // redBar: {
    //     width: 24,
    //     height: 4,
    //     backgroundColor: "red",
    //     borderRadius: 2,
    //     marginLeft: 4,
    // },
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

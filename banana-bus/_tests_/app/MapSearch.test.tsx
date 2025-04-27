import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import MapSearch from "@/app/components/MapSearch";
import { IStop } from "@/app/(tabs)/index";
import axios from "axios";

jest.mock("expo-font", () => ({
    loadAsync: jest.fn(),
    isLoaded: jest.fn(() => true),
}));

// Mock  Mapbox
jest.mock("@rnmapbox/maps", () => {
    const { View } = require("react-native");
    return {
        Mapbox: {
            MapView: ({ children }: { children: any }) => (
                <View>{children}</View>
            ),
            Camera: () => null,
        },
    };
});

// Mock expo-location
jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: jest.fn(() =>
        Promise.resolve({ status: "granted" })
    ),
    watchPositionAsync: jest.fn(() => ({
        remove: jest.fn(),
    })),
    getCurrentPositionAsync: jest.fn(() =>
        Promise.resolve({
            coords: {
                latitude: 2.7567602,
                longitude: 101.7007533, // Bus Terminal, KLIA 1
            },
        })
    ),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
    },
    useRouter: () => ({
        push: jest.fn(),
    }),
    useFocusEffect: jest.fn((cb) => cb()),
}));

// Test Mock Values
const mockStops: IStop[] = [
    { _id: "1", name: "KLIA Terminal 1", lat: 2.7567602, lng: 101.7007533 },
    { _id: "2", name: "KLIA Terminal 2", lat: 2.7456123, lng: 101.7091234 },
    { _id: "3", name: "KL Sentral", lat: 3.1341984, lng: 101.6859732 },
];

const emptyStop: IStop = { _id: null, name: null, lat: null, lng: null };

const mockCurrentLocation = [
    { lat: null, lng: null },
    { lat: 2.7567602, lng: 101.7007533 },
];

const mockReachableStops = ["1", "3"];

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("MapSearch Component", () => {
    const mockSetFromLoc = jest.fn();
    const mockSetToLoc = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        mockedAxios.get.mockImplementation((url) => {
            if (url.includes("allStops")) {
                return Promise.resolve({ data: mockStops });
            } else if (url.includes("reachableFrom")) {
                return Promise.resolve({
                    data: {
                        stops: mockReachableStops,
                    },
                });
            }
            return Promise.reject(new Error("Unknown URL"));
        });
    });

    it("renders correctly with null props", () => {
        const { getByTestId, getAllByPlaceholderText, getByText } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={{ lat: null, lng: null }}
            />
        );

        expect(getByTestId("from-section")).toBeTruthy();
        expect(getByTestId("to-section")).toBeTruthy();

        const searchInputs = getAllByPlaceholderText("Search locations...");
        expect(searchInputs).toHaveLength(2);

        expect(getByText("From")).toBeTruthy();
        expect(getByText("To")).toBeTruthy();
    });

    it("activates from search and shows results", async () => {
        const { getByTestId, findByText } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={{ lat: null, lng: null }}
            />
        );

        const fromInput = getByTestId("from-input");

        await act(async () => {
            fireEvent.changeText(fromInput, "KLIA");
        });

        await act(async () => {
            fireEvent(fromInput, "focus");
        });

        await waitFor(() => {
            expect(findByText("KLIA Terminal 1")).toBeTruthy();
            expect(findByText("KLIA Terminal 2")).toBeTruthy();
        });
    });

    // it("renders correctly with location props", () => {
    //     const { getAllByPlaceholderText, getByText } = render(
    //         <MapSearch
    //             fromLoc={mockStops[0]}
    //             toLoc={mockStops[2]}
    //             setFromLoc={mockSetFromLoc}
    //             setToLoc={mockSetToLoc}
    //             currentLocation={{ lat: null, lng: null }}
    //         />
    //     );

    //     const searchInputs = getAllByPlaceholderText("...");
    //     expect(searchInputs).toHaveLength(2);

    //     // Check that "From" and "To" labels exist
    //     expect(getByText("From")).toBeTruthy();
    //     expect(getByText("To")).toBeTruthy();
    // });
});

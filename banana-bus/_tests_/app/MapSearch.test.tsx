import React from "react";
import {
    render,
    fireEvent,
    waitFor,
    act,
    cleanup,
} from "@testing-library/react-native";
import MapSearch from "@/app/components/MapSearch";
import { IStop } from "@/app/(tabs)/index";
import axios from "axios";
import { Alert } from "react-native";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

// Mock Alert
jest.mock("react-native/Libraries/Alert/Alert", () => ({
    alert: jest.fn(),
}));

// Test Mock Values
const mockStops: IStop[] = [
    { _id: "1", name: "KLIA Terminal 1", lat: 2.7567602, lng: 101.7007533 },
    { _id: "2", name: "KLIA Terminal 2", lat: 2.7456123, lng: 101.7091234 },
    { _id: "3", name: "KL Sentral", lat: 3.1341984, lng: 101.6859732 },
    { _id: "4", name: "1utama Shopping Mall", lat: 3.1481, lng: 101.6165 },
];

const emptyStop: IStop = { _id: null, name: null, lat: null, lng: null };

const mockCurrentLocation = [
    { lat: null, lng: null },
    { lat: 2.7567602, lng: 101.7007533 },
];

const mockReachableStops = ["3", "4"];

describe("MapSearch Component", () => {
    const mockSetFromLoc = jest.fn();
    const mockSetToLoc = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        mockedAxios.get.mockImplementation((url) => {
            if (url.includes("allStops")) {
                return Promise.resolve({ data: mockStops });
            } else if (url.includes("reachableFrom")) {
                return Promise.resolve({ data: { stops: mockReachableStops } });
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
                currentLocation={mockCurrentLocation[0]}
            />
        );

        expect(getByTestId("from-section")).toBeTruthy();
        expect(getByTestId("to-section")).toBeTruthy();

        const searchInputs = getAllByPlaceholderText("Search locations...");
        expect(searchInputs).toHaveLength(2);

        expect(getByText("From")).toBeTruthy();
        expect(getByText("To")).toBeTruthy();
    });

    it("renders correctly with locations props", () => {
        const { getByPlaceholderText } = render(
            <MapSearch
                fromLoc={mockStops[2]}
                toLoc={mockStops[3]}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        expect(getByPlaceholderText("KL Sentral")).toBeTruthy();
        expect(getByPlaceholderText("1utama Shopping Mall")).toBeTruthy();
    });

    it("activates from search and shows results", async () => {
        const { getByTestId, findByText } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
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

    it("selects a location from search results", async () => {
        const { getByTestId, findByText } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        const fromInput = getByTestId("from-input");

        await act(async () => {
            fireEvent.changeText(fromInput, "KLIA");
        });

        await act(async () => {
            fireEvent(fromInput, "focus");
        });

        await waitFor(async () => {
            const location = await findByText("KLIA Terminal 1");
            await act(async () => {
                fireEvent.press(location);
            });
            expect(mockSetFromLoc).toHaveBeenCalledWith(mockStops[0]);
        });
    });

    it("activates to search after selecting from location", async () => {
        const { getByTestId, findByText, queryByText } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        const fromInput = getByTestId("from-input");

        await act(async () => {
            fireEvent.changeText(fromInput, "KLIA");
            fireEvent(fromInput, "focus");
        });

        await waitFor(async () => {
            const location = await findByText("KLIA Terminal 1");
            await act(async () => {
                fireEvent.press(location);
            });
        });

        expect(mockSetFromLoc).toHaveBeenCalledWith(mockStops[0]);

        // verify that "to" search is now activated
        await waitFor(() => {
            expect(findByText("Closest Based on Location")).toBeTruthy();
        });

        // verify results are correct
        await waitFor(() => {
            expect(findByText("KL Sentral")).toBeTruthy();
            expect(findByText("1utama Shopping Mall")).toBeTruthy();
            expect(queryByText("KLIA Terminal 2")).toBeNull();
        });

        // verify "to" input
        const toInput = getByTestId("to-input");
        expect(toInput).toBeTruthy();
    });

    // Distance Tests
    it("no distances when current location is null", async () => {
        const { getByTestId, queryByText } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        const fromInput = getByTestId("from-input");

        await act(async () => {
            fireEvent.changeText(fromInput, "KL");
            fireEvent(fromInput, "focus");
        });

        await waitFor(() => {
            // Should not find any distance text
            expect(queryByText(/\d+ km/)).toBeNull();
            expect(queryByText(/\d+ m/)).toBeNull();
        });
    });

    it("show  distances when current location is not null", async () => {
        const { getByTestId, queryByText } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[1]}
            />
        );

        const fromInput = getByTestId("from-input");

        await act(async () => {
            fireEvent.changeText(fromInput, "KL");
            fireEvent(fromInput, "focus");
        });

        await waitFor(() => {
            // Should not find any distance text
            expect(queryByText("42 km")).toBeTruthy();
            expect(queryByText("1.55 km")).toBeTruthy();
            expect(queryByText("0 m")).toBeTruthy();
        });
    });

    // Clear button tests
    it("should not show clear button when not focused", () => {
        const { queryByTestId } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        expect(queryByTestId("from-clear-button")).toBeNull();
        expect(queryByTestId("to-clear-button")).toBeNull();
    });

    it("should not show clear button when focused but input empty", async () => {
        const { getByTestId, queryByTestId } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        const fromInput = getByTestId("from-input");

        await act(async () => {
            fireEvent(fromInput, "focus");
        });

        expect(queryByTestId("from-clear-button")).toBeNull();
    });

    it("should show clear button when focused and input not empty", async () => {
        const { getByTestId, queryByTestId } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        const fromInput = getByTestId("from-input");

        await act(async () => {
            fireEvent(fromInput, "focus");
        });

        await act(async () => {
            fireEvent.changeText(fromInput, "KLIA");
        });

        await waitFor(() => {
            expect(queryByTestId("from-clear-button")).not.toBeNull();
        });
    });

    it("correctly clears input when clear button is pressed", async () => {
        const { getByTestId, queryByTestId } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        const fromInput = getByTestId("from-input");
        const toInput = getByTestId("to-input");

        await act(async () => {
            fireEvent(fromInput, "focus");
            fireEvent.changeText(fromInput, "KLIA");
        });

        await waitFor(() => {
            expect(queryByTestId("from-clear-button")).not.toBeNull();
            expect(queryByTestId("to-clear-button")).toBeNull();
        });

        await act(async () => {
            fireEvent(toInput, "focus");
            fireEvent.changeText(toInput, "Sentral");
        });

        await waitFor(() => {
            expect(queryByTestId("from-clear-button")).toBeNull();
            expect(queryByTestId("to-clear-button")).not.toBeNull();
        });

        await waitFor(() => {
            const toClearButton = getByTestId("to-clear-button");
            fireEvent.press(toClearButton);
        });

        expect(toInput.props.value).toBe("");
    });
});

describe("MapSearch -- Alerts Testing", () => {
    const mockSetFromLoc = jest.fn();
    const mockSetToLoc = jest.fn();
    const spyAlert = jest.spyOn(Alert, "alert");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("should display an alert when fetching stops fails", async () => {
        // Mock the API call to fail
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes("allStops")) {
                return Promise.reject(new Error("error"));
            }
            return Promise.reject(new Error("error"));
        });

        render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith(
                "Something went wrong!",
                "Error fetching stops",
                [{ text: "OK" }]
            );
        });
    });

    it("should display an alert when fetching destinations fails", async () => {
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes("allStops")) {
                return Promise.resolve({ data: mockStops });
            } else if (url.includes("reachableFrom")) {
                return Promise.reject(new Error("error"));
            }
            return Promise.reject(new Error("error"));
        });

        const { rerender } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining("allStops"),
                expect.any(Object)
            );
        });

        rerender(
            <MapSearch
                fromLoc={{ ...mockStops[0] }}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining("reachableFrom"),
                expect.any(Object)
            );
            expect(spyAlert).toHaveBeenCalledWith(
                "Something went wrong!",
                "Error fetching destinations",
                [{ text: "OK" }]
            );
        });
    });

    it("gracefully handle when a destination fetch returns empty data", async () => {
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes("allStops")) {
                return Promise.resolve({ data: mockStops });
            } else if (url.includes("reachableFrom")) {
                return Promise.resolve({ data: { stops: [] } });
            }
            return Promise.reject(new Error("Unknown URL"));
        });

        const { rerender } = render(
            <MapSearch
                fromLoc={emptyStop}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining("allStops"),
                expect.any(Object)
            );
        });

        rerender(
            <MapSearch
                fromLoc={{ ...mockStops[0] }}
                toLoc={emptyStop}
                setFromLoc={mockSetFromLoc}
                setToLoc={mockSetToLoc}
                currentLocation={mockCurrentLocation[0]}
            />
        );

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining("reachableFrom"),
                expect.any(Object)
            );
        });

        expect(spyAlert).not.toHaveBeenCalledWith(
            "Something went wrong!",
            "Error fetching destinations",
            [{ text: "OK" }]
        );
    });
});

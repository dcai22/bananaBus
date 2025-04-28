import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TripListBox from "@/app/components/TripListBox";
import { router } from "expo-router";

jest.mock('@expo/vector-icons', () => {
	const { Text } = require('react-native');
	return {
		FontAwesome: ({ name, style }: { name: string; style: any }) => (
			<Text style={style}>{name}</Text>
		),
	};
});

jest.mock('expo-font', () => ({
	loadAsync: jest.fn(),
	isLoaded: jest.fn(() => true),
}));

jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
    },
}));

describe("TripListBox", () => {
	const mockTrip = {
		departId: "1",
		arriveId: "2",
		tripId: "3",
		departureTime: new Date(Date.now() + 3600000),
		arrivalTime: new Date(Date.now() + 7200000),
		curCapacity: 5,
		maxCapacity: 10,
		curLuggageCapacity: 2,
		maxLuggageCapacity: 6,
		price: 50,
		luggagePrice: 10,
		hasAssist: true,
	};

	it("renders correctly with required props", () => {
		const { getByText } = render(<TripListBox trip={mockTrip} />);
		expect(getByText("Bus Stand")).toBeTruthy();
		expect(getByText("RM 50")).toBeTruthy();
		expect(getByText("5/10")).toBeTruthy();
	});

	it("does not navigate when disabled is true", () => {
	    const { getByTestId } = render(<TripListBox trip={mockTrip} disabled={true} />);
	    fireEvent.press(getByTestId("trip-list-box"));
	    expect(router.push).not.toHaveBeenCalled();
	});

	it("navigates when disabled is false", () => {
	    const { getByText } = render(<TripListBox trip={mockTrip} disabled={false} />);
	    fireEvent.press(getByText("Bus Stand"));
	    expect(router.push).toHaveBeenCalledWith({
	        pathname: "/booking",
	        params: {
	            departId: "1",
	            arriveId: "2",
	            tripId: "3",
	        },
	    });
	});

	it("applies departed styles when the trip has already departed", () => {
	    const departedTrip = { ...mockTrip, departureTime: new Date(Date.now() - 3600000) };
	    const { getByText } = render(<TripListBox trip={departedTrip} />);
	    const timeText = getByText(/ago/);
	    expect(timeText).toBeTruthy();
	});

	it("applies correct styles for capacity indicators", () => {
	    const fullTrip = {
	        ...mockTrip,
	        curCapacity: 10,
	        maxCapacity: 10,
	        curLuggageCapacity: 6,
	        maxLuggageCapacity: 6,
	    };
	    const { getByText } = render(<TripListBox trip={fullTrip} />);
	    const capacityText = getByText("10/10");
	    expect(capacityText.props.style).toContainEqual(expect.objectContaining({ color: "red" }));
	});
});
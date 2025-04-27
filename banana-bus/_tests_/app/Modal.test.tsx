import React, { act } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { CustomModal } from "@/app/components/Modal";
import { Text } from "react-native";

describe("CustomModal Component", () => {
	it("renders correctly when visible", () => {
		const { getByTestId, getByText } = render(
			<CustomModal visible={true} onCancel={jest.fn()} headerText="Test Header" infoText="Test Info">
				<Text>Child Content</Text>
			</CustomModal>
		);

		getByTestId("modal-container");
		getByText("Test Header");
		getByText("Test Info");
		getByText("Child Content");
	});

	it("does not render when not visible", () => {
		const { queryByTestId } = render(
			<CustomModal visible={false} onCancel={jest.fn()} headerText="Test Header">
				<Text>Child Content</Text>
			</CustomModal>
		);

		expect(queryByTestId("modal-container")).toBeNull();
	});

	// it("modal renders based on state change", async () => {
	// 	const ParentComponent = () => {
	// 		const [isVisible, setIsVisible] = React.useState(false);
	// 		return (
	// 			<>
	// 				<CustomModal visible={isVisible} onCancel={() => setIsVisible(false)} headerText="Test Header">
	// 					<Text>Child Content</Text>
	// 				</CustomModal>
	// 				<Text testID="toggle-button" onPress={() => setIsVisible(true)}>
	// 					Show Modal
	// 				</Text>
	// 			</>
	// 		);
	// 	};

	// 	const { getByTestId, queryByTestId } = render(<ParentComponent />);
	// 	// Make sure the modal is not visible initially
	// 	let modalContainer = await queryByTestId("modal-container");
	// 	expect(modalContainer).toBeNull();
		
	// 	// Simulate a button press to show the modal
	// 	const toggleButton = await getByTestId("toggle-button");
	// 	act(() => {
	// 		fireEvent.press(toggleButton);
	// 	});
		
	// 	// Make sure the modal is now visible
	// 	modalContainer = await getByTestId("modal-container");
	// 	expect(modalContainer).toBeTruthy();
	// });
});

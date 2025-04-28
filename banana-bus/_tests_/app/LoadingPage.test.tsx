import React from "react";
import { render } from "@testing-library/react-native";
import { LoadingPage } from "@/app/components/LoadingPage";

describe("LoadingPage Component", () => {
	it("renders the ActivityIndicator and has correct style", () => {
		const { getByTestId } = render(<LoadingPage />);
		const container = getByTestId("container");
		const activityIndicator = getByTestId("loading-icon");

		expect(container).toBeTruthy();
		expect(container.props.style).toEqual(
            expect.objectContaining({ flex: 1 })
        );

		expect(activityIndicator).toBeTruthy();
		expect(activityIndicator.props.style).toEqual(
            expect.objectContaining({ flex: 1 })
        );
	});
});
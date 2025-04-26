import React from "react";
import { render } from "@testing-library/react-native";
import { LoadingPage } from "../LoadingPage";

describe("LoadingPage Component", () => {
	it("renders the ActivityIndicator and has correct style", () => {
		const { getByTestId } = render(<LoadingPage />);
		const container = getByTestId("container");
		const activityIndicator = getByTestId("loading-icon");

		expect(container).toBeTruthy();
		expect(container).toHaveStyle({ flex: 1 });

		expect(activityIndicator).toBeTruthy();
		expect(activityIndicator).toHaveStyle({ flex: 1 });
	});
});
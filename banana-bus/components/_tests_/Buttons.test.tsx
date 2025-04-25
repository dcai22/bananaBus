import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { LoadingButton, NoButton, StandardButton, WarnButton, YesButton } from '../Buttons';

describe('StandardButton component', () => {
test('calls onPress when pressed', () => {
	const mockOnPress = jest.fn();
	const { getByText } = render(
	<StandardButton onPress={mockOnPress} text="Click Me" />
	);

	const button = getByText('Click Me');
	fireEvent.press(button);

	expect(mockOnPress).toHaveBeenCalledTimes(1);
});
});
describe('YesButton component', () => {
	test('renders with correct styles and calls onPress when pressed', () => {
		const mockOnPress = jest.fn();
		const { getByText } = render(
			<YesButton onPress={mockOnPress} text="Yes" />
		);

		const button = getByText('Yes');
		expect(button).toBeTruthy();
		expect(button.props.style).toContainEqual({ color: '#2A8AE4' });

		fireEvent.press(button);
		expect(mockOnPress).toHaveBeenCalledTimes(1);
	});
});

describe('NoButton component', () => {
	test('renders with correct styles and calls onPress when pressed', () => {
		const mockOnPress = jest.fn();
		const { getByText } = render(
			<NoButton onPress={mockOnPress} text="No" />
		);

		const button = getByText('No');
		expect(button).toBeTruthy();
		expect(button.props.style).toContainEqual({ color: '#fff' });

		fireEvent.press(button);
		expect(mockOnPress).toHaveBeenCalledTimes(1);
	});
});

describe('WarnButton component', () => {
	test('renders with correct styles and calls onPress when pressed', () => {
		const mockOnPress = jest.fn();
		const { getByText } = render(
			<WarnButton onPress={mockOnPress} text="Warn" />
		);

		const button = getByText('Warn');
		expect(button).toBeTruthy();
		expect(button.props.style).toContainEqual({ color: '#fff' });

		fireEvent.press(button);
		expect(mockOnPress).toHaveBeenCalledTimes(1);
	});
});

describe('LoadingButton component', () => {
	test('renders with correct styles for "yes" type', () => {
		const { getByTestId } = render(<LoadingButton type="yes" />);
		const activityIndicator = getByTestId('loading-indicator');

		expect(activityIndicator.props.color).toBe('#2A8AE4');
		expect(getByTestId('button')).toHaveStyle({ backgroundColor: '#ccff00' });
	});

	test('renders with correct styles for "no" type', () => {
		const { getByTestId } = render(<LoadingButton type="no" />);
		const activityIndicator = getByTestId('loading-indicator');

		expect(activityIndicator.props.color).toBe('#2A8AE4');
		expect(getByTestId('button')).toHaveStyle({ backgroundColor: '#2A8AE4' });
	});

	test('renders with correct styles for "warn" type', () => {
		const { getByTestId } = render(<LoadingButton type="warn" />);
		const activityIndicator = getByTestId('loading-indicator');
	
		expect(activityIndicator.props.color).toBe('white');
		expect(getByTestId('button')).toHaveStyle({ backgroundColor: 'red' });
	});
});
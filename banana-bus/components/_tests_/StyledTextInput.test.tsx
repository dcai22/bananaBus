import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StyledTextInput from '../StyledTextInput';

jest.mock('@expo/vector-icons', () => {
	const { View } = require('react-native');
	return {
		Ionicons: ({ name, size, color }: {name: string, size: number, color: string}) => (
			<View testID={`icon-${name}`} style={{ width: size, height: size, backgroundColor: color }} />
		),
	};
});

jest.mock('expo-font', () => ({
	loadAsync: jest.fn(),
	isLoaded: jest.fn(() => true),
}));

describe('StyledTextInput', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	it('renders correctly with default props', () => {
		const { getByTestId } = render(<StyledTextInput />);
		expect(getByTestId('text-input')).toBeTruthy();
	});

	it('renders with a value', () => {
		const { getByTestId } = render(<StyledTextInput value="test@example.com" />);
		const textInput = getByTestId('text-input');
		expect(textInput.props.value).toBe('test@example.com');
	});

	it('calls onChangeText when text changes', () => {
		const mockOnChangeText = jest.fn();
		const { getByTestId } = render(
			<StyledTextInput onChangeText={mockOnChangeText} />
		);
		const textInput = getByTestId('text-input');
		fireEvent.changeText(textInput, 'new input');
		expect(mockOnChangeText).toHaveBeenCalledWith('new input');
	});

	it('renders with password visibility toggle', () => {
		const { getByTestId } = render(
			<StyledTextInput
				password={true}
				label="password"
				value="testpassword"
				onChangeText={jest.fn()}
			/>
		);
		const textInput = getByTestId('text-input');
		const eyeIcon = getByTestId('eye-icon');
	
		// Initially, the text should be hidden
		expect(textInput.props.secureTextEntry).toBe(true);
	
		// Toggle visibility
		fireEvent.press(eyeIcon);
		expect(textInput.props.secureTextEntry).toBe(false);
	
		// Toggle back to hidden
		fireEvent.press(eyeIcon);
		expect(textInput.props.secureTextEntry).toBe(true);
	});
	
	it('does not render the eye icon if password prop is false', () => {
		const { queryByTestId } = render(<StyledTextInput />);
		const eyeIcon = queryByTestId('eye-icon');
		expect(eyeIcon).toBeNull();
	});
});
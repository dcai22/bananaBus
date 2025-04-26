import React from 'react';
import { render } from '@testing-library/react-native';
import { Header, CheckoutHeader } from '../Header';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

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

describe('Header component', () => {
	test('renders with default props', () => {
		const { getByTestId } = render(<Header />);
		getByTestId("go-back-button");
	});

	test('renders with a custom title', () => {
		const { getByTestId } = render(<Header title="Custom Title" />);
		expect(getByTestId('header-title').props.children).toBe('Custom Title');
	});

	test('renders without the "go back" button when showGoBack is false', () => {
		const { queryByTestId } = render(<Header showGoBack={false} />);
		expect(queryByTestId('go-back-button')).toBeNull();
	});

	test('calls resetPage and navigates back when "go back" is pressed', () => {
		const resetPageMock = jest.fn();
		const routerBackMock = jest.spyOn(router, 'back').mockImplementation(() => {});
		const { getByTestId } = render(<Header resetPage={resetPageMock} />);

		getByTestId('go-back-button').props.onPress();

		expect(resetPageMock).toHaveBeenCalled();
		expect(routerBackMock).toHaveBeenCalled();

		routerBackMock.mockRestore();
	});

	test('navigates back when "go back" is pressed and resetPage is not provided', () => {
		const resetPageMock = jest.fn();
		const routerBackMock = jest.spyOn(router, 'back').mockImplementation(() => {});
		const { getByTestId } = render(<Header />);

		getByTestId('go-back-button').props.onPress();

		expect(routerBackMock).toHaveBeenCalled();
		expect(resetPageMock).not.toHaveBeenCalled();

		routerBackMock.mockRestore();
	});

	test('renders with a custom icon', () => {
		const { getByTestId } = render(
			<Header icon={<FontAwesome name="star" style={{ fontSize: 20 }} />} />
		);
		getByTestId('header-icon');
	});

	test('applies custom styles to the header container', () => {
		const { getByTestId } = render(
			<Header style={{ backgroundColor: 'red' }} />
		);
		expect(getByTestId('header-container')).toHaveStyle({
			backgroundColor: 'red',
		});
	});
});

describe('CheckoutHeader component', () => {
	test('renders with default props', () => {
		const { getByTestId } = render(<CheckoutHeader />);
		expect(getByTestId('header-title').props.children).toBe('Secure Checkout');
		getByTestId('go-back-button');
	});

	test('renders with a custom title', () => {
		const { getByTestId } = render(<CheckoutHeader title="Payment Details" />);
		expect(getByTestId('header-title').props.children).toBe('Payment Details');
	});

	test('renders without the "go back" button when showGoBack is false', () => {
		const { queryByTestId } = render(<CheckoutHeader showGoBack={false} />);
		expect(queryByTestId('go-back-button')).toBeNull();
	});

	test('calls resetPage and navigates back when "go back" is pressed', () => {
		const resetPageMock = jest.fn();
		const routerBackMock = jest.spyOn(router, 'back').mockImplementation(() => {});
		const { getByTestId } = render(<CheckoutHeader resetPage={resetPageMock} />);

		getByTestId('go-back-button').props.onPress();

		expect(resetPageMock).toHaveBeenCalled();
		expect(routerBackMock).toHaveBeenCalled();

		routerBackMock.mockRestore();
	});

	test('navigates back when "go back" is pressed and resetPage is not provided', () => {
		const resetPageMock = jest.fn();
		const routerBackMock = jest.spyOn(router, 'back').mockImplementation(() => {});
		const { getByTestId } = render(<CheckoutHeader />);

		getByTestId('go-back-button').props.onPress();

		expect(routerBackMock).toHaveBeenCalled();
		expect(resetPageMock).not.toHaveBeenCalled();

		routerBackMock.mockRestore();
	});

	test('applies custom styles to the header container', () => {
		const { getByTestId } = render(
			<CheckoutHeader style={{ backgroundColor: 'blue' }} />
		);
		expect(getByTestId('header-container')).toHaveStyle({
			backgroundColor: 'blue',
		});
	});
});
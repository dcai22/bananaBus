import React from 'react';
import { render } from '@testing-library/react-native';
import Container from '../Container';
import { Text } from 'react-native';

describe('Container Component', () => {
	it('renders children correctly', () => {
		const { getByText } = render(
			<Container>
				<Text>hi</Text>
			</Container>
		);

		expect(getByText('hi')).toBeTruthy();
	});

	it('applies default styles', () => {
		const { getByTestId } = render(
			<Container>
				<Text>hi</Text>
			</Container>
		);

		const container = getByTestId('container');
		expect(container).toHaveStyle({ flex: 1, backgroundColor: '#e5f0fa' });
	});

	it('applies custom styles when provided', () => {
		const customStyle = { backgroundColor: '#ff0000' };
		const { getByTestId } = render(
			<Container style={customStyle}>
				<Text>hi</Text>
			</Container>
		);

		const container = getByTestId('container');
		expect(container.props.style).toContainEqual(customStyle);
	});
});
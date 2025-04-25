import React from 'react';
import { render } from '@testing-library/react-native';

// Mock @expo/vector-icons to prevent font loading issues
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    FontAwesome: ({ name, style }: { name: string; style: any }) => (
      <Text style={style}>{name}</Text>
    ),
  };
});

// Mock expo-font to prevent font loading issues
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

import { Header } from '../Header';

describe('Header component', () => {
  test('Text renders correctly on HomeScreen', () => {
    const { getByText } = render(<Header title="hello" />);

    getByText('hello');
  });
});
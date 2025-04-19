import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle; // Optional prop to allow additional styles
}

/**
 * Container Component
 * 
 * A standardised container component mainly for keeping the background colour consistent.
 * 
 * Props:
 * - `style` (ViewStyle, optional): Custom styles to apply to the container e.g. colour what not.
 * 
 * Example Usage:
 * <Container>
 *   <The page/>
 * </Container>
 * 
 */
const Container: React.FC<ContainerProps> = ({ children, style }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5f0fa',
  },
});

export default Container;
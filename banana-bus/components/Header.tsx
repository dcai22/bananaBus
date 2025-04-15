import React from 'react';
import { Text, View, StyleSheet, ViewStyle } from 'react-native';
import { router } from "expo-router";

interface HeaderProps {
  title: string;
  showGoBack?: boolean;
  emoji?: string;
  style?: ViewStyle
}

const Header: React.FC<HeaderProps> = ({ title, emoji, showGoBack = true, style }) => {
  return (
    <View style={[styles.headerBox, style]}>
      {showGoBack && (
        <Text onPress={() => router.back()} style={styles.goBack}>
          ← go back
        </Text>
      )}
      <View style={styles.titleContainer}>
        <Text style={styles.header}>{title}</Text>
        {emoji && <Text style={styles.header}>{emoji}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBox: {
    backgroundColor: '#fff',
    marginBottom: 22,
    paddingTop: 72,
    padding: 32,
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
    justifyContent: 'flex-end',
  },
  goBack: {
    color: '#74b9f1',
    fontWeight: 'bold',
    fontSize: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4399dc',
  },
});

export default Header;
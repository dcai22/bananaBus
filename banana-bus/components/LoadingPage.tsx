import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

/**
 * LoadingPage Component
 * 
 * A component that displays a loading indicator.
 * It is typically used to indicate that a process or operation is in progress.
 * 
 * Example Usage:
 * <Conatiner>
 *    <Header title="Whatever page"/>
 *    <LoadingPage />
 * </Conatiner>
 * 
 */
export function LoadingPage() {
  return (
    <View style={styles.indicatorContainer} testID="container">
        <ActivityIndicator size="large" color="#007AFF" style={styles.indicator} testID="loading-icon"/>
    </View>
  )
}

const styles = StyleSheet.create({
    indicatorContainer: {
        flex: 1,
    },
    indicator: {
        flex: 1,
    }
})
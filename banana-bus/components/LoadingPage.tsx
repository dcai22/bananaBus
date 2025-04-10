import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function LoadingPage() {
  return (
    <View style={{flex: 1}}>
        <ActivityIndicator size="large" color="#007AFF" style={{flex: 1}}/>
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
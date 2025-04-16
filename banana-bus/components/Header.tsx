import React from 'react';
import { Text, View, StyleSheet, ViewStyle } from 'react-native';
import { router } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface HeaderProps {
    title?: string;
    showGoBack?: boolean;
    emoji?: string;
    style?: ViewStyle
}

export const Header: React.FC<HeaderProps> = ({ title = '', emoji, showGoBack = true, style }) => {
    return (
        <View style={[styles.headerBox, style]}>
            {showGoBack && (
                <Text onPress={() => router.back()} style={styles.goBack}>
                    <FontAwesome name="arrow-left" style={styles.goBackArrow}/> go back
                </Text>
            )}
            <View style={styles.titleContainer}>
                <Text style={styles.header}>{title}</Text>
                {emoji && <Text style={styles.header}>{emoji}</Text>}
            </View>
        </View>
    );
};

export const CheckoutHeader: React.FC<HeaderProps> = ({ title = 'Secure Checkout', showGoBack = true, style }) => {
    return (
        <View style= {styles.checkoutHeader}>
            {showGoBack && (
                <Text onPress={() => router.back()} style={styles.goBack}>
                    <FontAwesome name="arrow-left" style={styles.goBackArrow}/> go back
                </Text>
            )}
            <Text style ={styles.checkoutText}>{title}</Text>
        </View>
    )
}

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
    goBackArrow: {
        fontSize: 15,
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
    checkoutHeader: {
        backgroundColor: "#060c40",
        minHeight: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    checkoutText: {
        color: "white",
        fontSize: 22,
        alignContent: "center"
    }
});
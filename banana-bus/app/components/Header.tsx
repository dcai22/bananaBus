import React from 'react';
import { Text, View, StyleSheet, ViewStyle } from 'react-native';
import { router } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface HeaderProps {
    title?: string;
    showGoBack?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle
    resetPage?: () => void;
}

/**
 * Header Component
 * 
 * A reusable header component for displaying a title, optional emoji, and a "go back" button.
 * 
 * Props:
 * - `title` (string, optional): The title text to display in the header. Defaults to an empty string to only show the goback.
 * - `showGoBack` (boolean, optional): Whether to show the "go back" button. Defaults to `true`.
 * - `emoji` (string, optional): An optional emoji to display alongside the title, positioned on the right.
 * - `style` (ViewStyle, optional): Custom styles to apply to the header container.
 * - `resetPage` (function, optional): A callback function to reset the page state when the "go back" button is pressed.
 * 
 * Example Usage:
 * <Header title="Home" icon="🏠" showGoBack={false} />
 * 
 */
export const Header: React.FC<HeaderProps> = ({ title = '', icon, showGoBack = true, style, resetPage }) => {
    return (
        <View style={[styles.headerBox, style]} testID="header-container">
            {showGoBack && (
                <Text
                    onPress={() => {
                        if (resetPage) resetPage();
                        router.back();
                    }}
                    style={styles.goBack}
                    testID="go-back-button"
                >
                    <FontAwesome name="arrow-left" style={styles.goBackArrow}/> go back
                </Text>
            )}
            <View style={styles.titleContainer} testID="title-container">
                <Text style={styles.header} testID="header-title">{title}</Text>
                {icon && <View testID="header-icon">{React.cloneElement(icon as React.ReactElement, { style: styles.header })}</View>}
            </View>
        </View>
    );
};

/**
 * CheckoutHeader Component
 * 
 * A specialized header component for checkout screens, with a default title of "Secure Checkout".
 * 
 * Props:
 * - `title` (string, optional): The title text to display in the header. Defaults to "Secure Checkout".
 * - `showGoBack` (boolean, optional): Whether to show the "go back" button. Defaults to `true`.
 * - `style` (ViewStyle, optional): Custom styles to apply to the header container.
 * - `resetPage` (function, optional): A callback function to reset the page state when the "go back" button is pressed.
 * 
 * Example Usage:
 * <CheckoutHeader title="Payment Details" />
 * 
 */
export const CheckoutHeader: React.FC<HeaderProps> = ({ title = 'Secure Checkout', showGoBack = true, style, resetPage }) => {
    return (
        <View style= {[styles.checkoutHeader, style]} testID="header-container">
            {showGoBack && (
                <Text 
                    onPress={() => {
                        if (resetPage) resetPage();
                        router.back();
                    }}
                    style={styles.goBack}
                    testID="go-back-button"
                >
                    <FontAwesome name="arrow-left" style={styles.goBackArrow}/> go back
                </Text>
            )}
            <Text style ={styles.checkoutText} testID="header-title">{title}</Text>
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
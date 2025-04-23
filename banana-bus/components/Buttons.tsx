import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';

interface CustomButtonProps {
    onPress: () => void;
    text: React.ReactNode;
    style?: ViewStyle;
}

interface LoadingButtonProps {
    style?: ViewStyle;
}

export const StandardButton: React.FC<CustomButtonProps> = ({ onPress, text, style }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
}

export const YesButton: React.FC<CustomButtonProps> = ({ onPress, text, style }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, styles.yesButton, style]}>
            <Text style={[styles.buttonText, styles.yesText]}>{text}</Text>
        </TouchableOpacity>
    );
};

export const NoButton: React.FC<CustomButtonProps> = ({ onPress, text, style }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, styles.noButton, style]}>
            <Text style={[styles.buttonText, styles.noText]}>{text}</Text>
        </TouchableOpacity>
    );
}

export const WarnButton: React.FC<CustomButtonProps> = ({ onPress, text, style }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, styles.warnButton, style]}>
            <Text style={[styles.buttonText, styles.noText]}>{text}</Text>
        </TouchableOpacity>
    );
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ style }) => {
    return (
        <TouchableOpacity style={[styles.button, styles.noButton, style]} disabled={true}>
            <ActivityIndicator size="small" color="white"/>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "white",
        padding: 12,
        margin: 8,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    yesButton: {
        backgroundColor: "#ccff00",
    },
    noButton: {
        backgroundColor: "#2A8AE4",
    },
    buttonText: {
        fontWeight: "bold",
        fontSize: 15,
    },
    yesText: {
        color: "#2A8AE4",
    },
    noText: {
        color: "#fff",
    },
    warnButton: {
        backgroundColor: "red",
    },
});
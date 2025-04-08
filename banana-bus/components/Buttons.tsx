import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface CustomButtonProps {
    onPress: () => void;
    text: React.ReactNode;
    style?: ViewStyle;
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

const styles = StyleSheet.create({
    button: {
        width: "100%",
        padding: 12,
        marginVertical: 8,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
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
});
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChangeText, placeholder = "password" }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={styles.passwordContainer}>
            <TextInput
                style={styles.passwordInput}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Ionicons
                    name={isPasswordVisible ? "eye-off" : "eye"}
                    size={20}
                    color="#ccc"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    passwordInput: {
        width: "100%",
        padding: 10,
        paddingHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    eyeIcon: {
        position: "absolute",
        right: 2,
        padding: 10,
    },
});

export default PasswordInput;
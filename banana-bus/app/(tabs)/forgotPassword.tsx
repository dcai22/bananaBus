import { Text, View, StyleSheet, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from "expo-router";
import { getItem } from '../helper';
import { API_BASE } from '@env';
import StyledTextInput from '@/components/StyledTextInput';

export default function ForgotPasswordScreen() {
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const router = useRouter();

    const handleReset = async () => {
        // TODO remove debug msg
        if (pass !== confirmPass) {
            Alert.alert("Error", "Passwords don't match!");
            setConfirmPass("");
            return;
        }

        const paramToken = await getItem("resetToken");

        try {
            const response = await fetch(`${API_BASE}/resetPassword` + `?token=${paramToken}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ newPassword: pass }),
            });

            if (response.ok) {
                alert("Password reset. Login with new password!");
                router.navigate("/login");
            } else {
                const errorData = await response.json();
                console.error("Error resetting password:", errorData);
            }
        } catch {}
    }

    return (
        <ImageBackground
            source={{
                uri: "https://www.figma.com/file/ZvVQQmOHdnzSiS0Yg7iwQx/image/78443b2693ec711702b146d4cf971a9a4010c231",
            }}
            style={styles.backgroundImage}
        >
            <View style={styles.overlay} />
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.goBack} onPress={() => {
                        router.back();
                    }}
                >
                    <Text style={styles.goBack}>← go back</Text>
                </TouchableOpacity>
                <View style={styles.title}>
                    <Text style={styles.title}>Enter new password</Text>
                </View>
                <View style={styles.form}>
                    <StyledTextInput
                        password={true}
                        value={pass}
                        onChangeText={setPass}
                        label="new password"
                    />
                    <StyledTextInput
                        password={true}
                        value={confirmPass}
                        onChangeText={setConfirmPass}
                        label="confirm new password"
                    />
                    <TouchableOpacity
                        style={[styles.button, styles.loginButton]}
                        onPress={handleReset}
                    >
                        <Text style={[styles.buttonText, styles.loginText]}>
                            Change password
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    title: {
        fontSize: 56,
        fontWeight: "bold",
        color: "#fff",
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    form: {
        width: "80%",
        alignItems: "center",
    },
    button: {
        width: "100%",
        padding: 12,
        marginVertical: 8,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    loginButton: {
        backgroundColor: "#ccff00",
    },
    buttonText: {
        fontWeight: "bold",
        fontSize: 15,
    },
    loginText: {
        color: "#2A8AE4",
    },
    goBack: {
        alignSelf: 'flex-start',
        color: '#fff',
        fontSize: 20,
        paddingHorizontal: 20,
        opacity: 0.9,
    },
});
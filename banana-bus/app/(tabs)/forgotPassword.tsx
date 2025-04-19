import { Text, View, StyleSheet, TextInput, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from "expo-router";
import { getItem } from '../helper';

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
            const response = await fetch("https://banana-bus.vercel.app/resetPassword" + `?token=${paramToken}`, {
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
                    <TextInput
                        style={styles.input}
                        placeholder="new password"
                        value={pass}
                        onChangeText={setPass}
                        secureTextEntry
                        autoCapitalize='none'
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="confirm new password"
                        value={confirmPass}
                        onChangeText={setConfirmPass}
                        secureTextEntry
                        autoCapitalize='none'
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
    icon: {
        width: 50,
        height: 50,
        marginBottom: 20,
    },
    form: {
        width: "80%",
        alignItems: "center",
    },
    input: {
        width: "100%",
        padding: 10,
        paddingHorizontal: 20,
        margin: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
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
    registerButton: {
        backgroundColor: "#2A8AE4",
    },
    buttonText: {
        fontWeight: "bold",
        fontSize: 15,
    },
    loginText: {
        color: "#2A8AE4",
    },
    registerText: {
        color: "#fff",
    },
    forgotPassword: {
        marginBottom: 10,
        alignSelf: "flex-end",
        color: "#c5e1ec",
        fontSize: 12
    },
    goBack: {
        alignSelf: 'flex-start',
        color: '#fff',
        fontSize: 20,
        paddingHorizontal: 20,
        opacity: 0.9,
    },
});
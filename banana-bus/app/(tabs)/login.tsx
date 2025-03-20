import { Text, View, StyleSheet, TextInput, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, useNavigation } from "expo-router";
import * as Device from "expo-device";

import { saveItem, getItem } from '../helper';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigation = useNavigation();

    useEffect(() => {
        const autoLogin = async () => {
            if (Device.deviceType === Device.DeviceType.PHONE) {
                const token = getItem('token');
                if (token !== null) {
                    try {
                        const response = await fetch('https://banana-psi-lemon.vercel.app/autologin', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            }
                        });
        
                        if (response.ok) {
                            const data = await response.json();
                            console.log(`Auto-login successful, uid: ${data.userId}, token: ${data.token}`);
                            navigation.navigate('index');
                        }
                    } catch {}
                }
            } else {
                const token = localStorage.getItem('token');
                if (token !== null) {
                    try {
                        const response = await fetch('https://banana-psi-lemon.vercel.app/autologin', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            }
                        });
        
                        if (response.ok) {
                            const data = await response.json();
                            console.log(`Auto-login successful, uid: ${data.userId}, token: ${data.token}`);
                            navigation.navigate('index');
                        }
                    } catch {}
                }
            }
        }

        autoLogin();
    }, []);


    const handleLogin = async () => {
        console.log("Email:", email);
        console.log("Password:", password);

        try {
            const response = await fetch("https://banana-psi-lemon.vercel.app/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(
                    `Login successful, uid: ${data.userId}, token: ${data.token}`
                );
                if (Device.deviceType === Device.DeviceType.PHONE) {
                    // This only works on mobile
                    console.log("mobile");
                    saveItem("uid", data.userId.toString());
                    saveItem("token", data.token);
                } else {
                    // Save to local storage on web for testing purposes
                    console.log("web");
                    localStorage.setItem("uid", data.userId.toString());
                    localStorage.setItem("token", data.token);
                }
                navigation.navigate("index");
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.message || "Login failed");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred. Please try again.");
        }
    };

    return (
        <ImageBackground
            source={{
                uri: "https://www.figma.com/file/ZvVQQmOHdnzSiS0Yg7iwQx/image/78443b2693ec711702b146d4cf971a9a4010c231",
            }}
            style={styles.backgroundImage}
        >
            <View style={styles.overlay} />
            <View style={styles.container}>
                <View style={styles.title}>
                    <Text style={styles.title}>banana bus 🚌</Text>
                </View>
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity
                        onPress={handleLogin}
                        style={[styles.button, styles.loginButton]}
                    >
                        <Text style={[styles.buttonText, styles.loginText]}>
                            Login →
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setEmail("");
                            setPassword("");
                            navigation.navigate("register");
                        }}
                        style={[styles.button, styles.registerButton]}
                    >
                        <Text style={[styles.buttonText, styles.registerText]}>
                            Register
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
        color: "#007bff",
        marginTop: 10,
    },
});

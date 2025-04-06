import { Text, View, StyleSheet, TextInput, Alert, TouchableOpacity, ImageBackground, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from "expo-router";
import * as Device from "expo-device";

import { saveItem, getItem } from '../helper';
import { set } from 'date-fns';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState("sendCode");
    const [emailCode, setEmailCode] = useState("");
    const navigation = useNavigation();

    const openModal = () => {
        setModalVisible(true);
    }

    const closeModal = () => {
        setModalVisible(false);
        setModalType("sendCode");
        setEmail("");
    }

    const sendResetMail = async () => {
        // TODO send code to email
        // Send confirmation email
        setModalType("enterCode");
        alert("Confirmation email sent. Check your email!");
    }

    const checkEmailCode = async () => {
        // TODO Check if email code is correct
        alert("Email code is correct. Set new password!");
        navigation.navigate("forgotPassword");
    }

    useEffect(() => {
        const autoLogin = async () => {
            if (Device.deviceType === Device.DeviceType.PHONE) {
                const token = await getItem('token');
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
        // TODO remove debug msg
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
                    saveItem("userId", data.userId.toString());
                    saveItem("token", data.token);
                } else {
                    // Save to local storage on web for testing purposes
                    console.log("web");
                    localStorage.setItem("userId", data.userId.toString());
                    localStorage.setItem("token", data.token);
                }
                setEmail("");
                setPassword("");
                navigation.navigate("index");
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.error || "Login failed");
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
                    <Text
                        style={styles.forgotPassword}
                        onPress={openModal}>
                        Forgot password?
                    </Text>
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
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {modalType === "sendCode" && (
                                <>
                                    <Text style={styles.modalHeader}>Enter your email</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="email"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={sendResetMail}
                                        style={[styles.button, styles.loginButton]}
                                    >
                                        <Text style={[styles.buttonText, styles.loginText]}>
                                            Send confirmation email
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.registerButton]}
                                        onPress={closeModal}
                                    >
                                        <Text style={[styles.buttonText, styles.registerText]}>Close</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                            {modalType === "enterCode" && (
                                <>
                                    <Text style={styles.modalHeader}>Enter the code sent to your email</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="code"
                                        value={emailCode}
                                        onChangeText={setEmailCode}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={checkEmailCode}
                                        style={[styles.button, styles.loginButton]}
                                    >
                                        <Text style={[styles.buttonText, styles.loginText]}>
                                            Confirm
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.registerButton]}
                                        onPress={closeModal}
                                    >
                                        <Text style={[styles.buttonText, styles.registerText]}>Cancel</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                    
                </Modal>
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
        marginVertical: 6,
        alignSelf: "flex-end",
        color: "#c5e1ec",
        fontSize: 12
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        alignItems: "center",
    },
    modalHeader: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
    },
});

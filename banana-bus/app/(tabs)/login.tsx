import { Text, View, StyleSheet, TextInput, Alert, TouchableOpacity, ImageBackground, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useLocalSearchParams } from "expo-router";
import * as Device from "expo-device";
import { router } from "expo-router";

import { saveItem, getItem } from '../helper';
import { YesButton, NoButton } from '@/components/Buttons';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState("sendCode");
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [emailCode, setEmailCode] = useState("");
    const navigation = useNavigation();

    const openModal = () => {
        setModalVisible(true);
    }

    const closeModal = () => {
        setModalType("sendCode");
        setEmail("");
        setModalVisible(false);
    }

    const sendResetMail = async () => {
        // TODO send code to email
        if (recoveryEmail === "") {
            alert("Please enter your email!");
            return;
        }

        try {
            const response = await fetch("https://banana-bus.vercel.app/resetPasswordEmail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: recoveryEmail }),
            });

            if (response.ok) {
                console.log("Confirmation email sent successfully.");
                const data = await response.json();
                console.log("Token saved: ", data.token);
                console.log("Message: ", data.message)
                saveItem("resetToken", data.token);
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.error || "Failed to send confirmation email");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred. Please try again.");
        }
        // Send confirmation email
        setModalType("enterCode");
        alert("Confirmation email sent. Check your email!");
    }

    const checkEmailCode = async () => {
        const paramToken = await getItem('resetToken');
        try {
            const response = await fetch("https://banana-bus.vercel.app/resetPasswordVerifyCode" + `?token=${paramToken}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: emailCode }),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Email code is correct. Set your new password!");
                closeModal();
                saveItem("resetToken", data.token);
                navigation.navigate("forgotPassword");
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.error || "Invalid confirmation code");
            }
        } catch {
            Alert.alert("Error", "An error occurred. Please try again.");
        }
    }

    useEffect(() => {
        const autoLogin = async () => {
            if (Device.deviceType === Device.DeviceType.PHONE) {
                const token = await getItem('token');
                if (token !== null) {
                    try {
                        const response = await fetch('https://banana-bus.vercel.app/autologin', {
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
                        const response = await fetch('https://banana-bus.vercel.app/autologin', {
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
            const response = await fetch("https://banana-bus.vercel.app/login", {
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
                    <YesButton onPress={handleLogin} text="Login →" />
                    <NoButton onPress={() => {
                        setEmail("");
                        setPassword("");
                        navigation.navigate("register");
                    }} text="Register" />
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {modalType === "sendCode" && (
                                <>
                                    <Text style={styles.modalHeader}>Enter your email</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="email"
                                        value={recoveryEmail}
                                        onChangeText={setRecoveryEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    <YesButton onPress={sendResetMail} text="Send confirmation email" />
                                    <NoButton onPress={closeModal} text="Close" />
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
                                    <YesButton onPress={checkEmailCode} text="Confirm" />
                                    <NoButton onPress={closeModal} text="Cancel" />
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

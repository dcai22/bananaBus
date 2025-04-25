import { Text, View, StyleSheet, Alert, ImageBackground } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from "expo-router";
import * as Device from "expo-device";
import { saveItem, getItem } from '../helper';
import { YesButton, NoButton } from '@/components/Buttons';
import { CustomModal } from '@/components/Modal';
import { GoogleSignin, GoogleSigninButton, isSuccessResponse, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import StyledTextInput from '@/components/StyledTextInput';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState("sendCode");
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [emailCode, setEmailCode] = useState("");
    const router = useRouter();

    const openModal = () => {
        setModalVisible(true);
    }

    const closeModal = () => {
        setModalType("sendCode");
        setRecoveryEmail("");
        setModalVisible(false);
    }

    const sendResetMail = async () => {
        setModalType("enterCode");
        alert("Confirmation email sent. Check your email!");
        if (recoveryEmail === "") {
            alert("Please enter your email!");
            return;
        }

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/resetPasswordEmail`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: recoveryEmail }),
            });

            if (response.ok) {
                const data = await response.json();
                saveItem("resetToken", data.token);
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.error || "Failed to send confirmation email");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred. Please try again.");
        }
        
    }

    const checkEmailCode = async () => {
        const paramToken = await getItem('resetToken');
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/resetPasswordVerifyCode` + `?token=${paramToken}`, {
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
                router.navigate("/forgotPassword");
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
            let token;
            if (Device.deviceType === Device.DeviceType.PHONE) {
                token = await getItem('token');
            } else {
                token = localStorage.getItem('token');
            }
            if (token !== null) {
                try {
                    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/autologin`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        router.navigate('/(tabs)');
                    }
                } catch {}
            }
        }

        autoLogin();
    }, []);


    const handleLogin = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                if (Device.deviceType === Device.DeviceType.PHONE) {
                    // This only works on mobile
                    saveItem("userId", data.userId.toString());
                    saveItem("token", data.token);
                    saveItem("isExternal", "false");
                } else {
                    // Save to local storage on web for testing purposes
                    localStorage.setItem("userId", data.userId.toString());
                    localStorage.setItem("token", data.token);
                }
                setEmail("");
                setPassword("");
                router.navigate('/(tabs)');
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.error || "Login failed");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred. Please try again.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response)) {
                const { user } = response.data;
                const { email, givenName, familyName } = user;
                console.log(user);
                const loginResponse = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/googleLogin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, firstName: givenName, lastName: familyName }),
                });
                if (loginResponse.ok) {
                    const data = await loginResponse.json();
                    saveItem("userId", data.userId.toString());
                    saveItem("isExternal", "true");
                    saveItem("token", data.token);
                    router.navigate('/(tabs)');
                } else {
                    const errorData = await loginResponse.json();
                    Alert.alert("Error", errorData.error || "Login failed");
                }
            } else {
                Alert.alert("Error", "Google sign-in failed. Please try again.");
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        Alert.alert("Error", "Sign-in cancelled by user.");
                        break;
                    case statusCodes.IN_PROGRESS:
                        Alert.alert("Error", "Sign-in is in progress.");
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        Alert.alert("Error", "Play services not available or outdated.");
                        break;
                    default:
                        Alert.alert("Error", "An unknown error occurred. Please try again.");
                }
            } else {
                Alert.alert("Error", "An unknown error occurred. Please try again.");
            }
        }
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
                <View style={styles.title}>
                    <Text style={styles.title}>banana bus 🚌</Text>
                </View>
                <View style={styles.form}>
                    <StyledTextInput
                        label="email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <StyledTextInput
                        password={true}
                        label="password"
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Text
                        style={styles.forgotPassword}
                        onPress={openModal}>
                        Forgot password?
                    </Text>
                    <YesButton onPress={handleLogin} text="Login →" style={styles.buttons}/>
                    <NoButton onPress={() => {
                        setEmail("");
                        setPassword("");
                        router.navigate("/register");
                    }} text="Register" style={styles.buttons} />
                    <View style={styles.separatorContainer}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>or</Text>
                        <View style={styles.separatorLine} />
                    </View>
                    <GoogleSigninButton
                        size={GoogleSigninButton.Size.Wide}
                        color={GoogleSigninButton.Color.Light}
                        style={styles.googleSignin}
                        onPress={(handleGoogleLogin)}
                    />
                </View>
                <CustomModal
                    visible={modalVisible}
                    onCancel={closeModal}
                    headerText={modalType === "sendCode" ? "Enter your email" : "Enter the code sent to your email"}
                >
                    {modalType === "sendCode" && (
                        <>
                            <StyledTextInput
                                label="email"
                                value={recoveryEmail}
                                onChangeText={setRecoveryEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <YesButton onPress={sendResetMail} text="Send confirmation email" style={styles.buttons}/>
                            <NoButton onPress={closeModal} text="Close" style={styles.buttons}/>
                        </>
                    )}
                    {modalType === "enterCode" && (
                        <>
                            <StyledTextInput
                                placeholder="code"
                                value={emailCode}
                                onChangeText={setEmailCode}
                                autoCapitalize="none"
                            />
                            <YesButton onPress={checkEmailCode} text="Confirm" style={styles.buttons}/>
                            <NoButton onPress={closeModal} text="Cancel" style={styles.buttons}/>
                        </>
                    )}
                </CustomModal>
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
    forgotPassword: {
        marginVertical: 6,
        alignSelf: "flex-end",
        color: "#c5e1ec",
        fontSize: 12
    },
    googleSignin: {
        width: "100%",
        padding: 12,
        marginVertical: 4,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    separatorContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 12,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#fff",
    },
    separatorText: {
        color: "#fff",
        fontSize: 16,
        marginHorizontal: 8,
        lineHeight: 16,
    },
    buttons: {
        flex: 0,
        width: "100%",
    }
});

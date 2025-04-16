import { Text, View, StyleSheet, TextInput, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Device from 'expo-device';
import { YesButton } from '@/components/Buttons';
import { saveItem } from '../helper';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Paswords don\'t match!');
            setConfirmPassword('');
            setPassword('');
            return;
        }

        // Register user

        try {
            const response = await fetch('https://banana-bus.vercel.app/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            if (response.ok) {
                const data = await response.json();
                if (Device.deviceType === Device.DeviceType.PHONE) {
                    // This only works on mobile
                    saveItem('userId', data.userId.toString());
                    saveItem('token', data.token);
                } else {
                    // Save to local storage on web for testing purposes
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('token', data.token);
                }
                router.navigate('/(tabs)');
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.error || 'Registration failed');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred. Please try again.');
        }
    };

    return (
        <ImageBackground
            style={styles.backgroundImage}
            source={{ uri: 'https://www.figma.com/file/ZvVQQmOHdnzSiS0Yg7iwQx/image/78443b2693ec711702b146d4cf971a9a4010c231' }}
        >
            <View style={styles.overlay} />
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.goBack} onPress={() => {
                        setFirstName('');
                        setLastName('');
                        setEmail('');
                        setPassword('');
                        setConfirmPassword('');
                        router.back();
                    }}
                >
                    <Text style={styles.goBack}>← go back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>banana bus      🚌</Text>
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="first name"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="last name"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={[styles.input]}
                        placeholder="password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="confirm password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                    <YesButton
                        text="Register"
                        onPress={handleRegister}
                    />
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',

    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    goBack: {
        alignSelf: 'flex-start',
        color: '#fff',
        fontSize: 20,
        paddingHorizontal: 20,
        opacity: 0.9,
    },
    form: {
        width: '80%',
        alignItems: 'center',
    },
    title: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#fff',
        paddingHorizontal: 48,
        marginBottom: 15,
    },
    input: {
        width: '100%',
        padding: 10,
        paddingHorizontal: 20,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        padding: 12,
        marginVertical: 8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2A8AE4',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#fff',
    },
});
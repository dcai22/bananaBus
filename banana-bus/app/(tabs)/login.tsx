import { Text, View, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Link, useNavigation } from "expo-router";

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = () => {
        console.log('Email:', email);
        console.log('Password:', password);
        navigation.navigate('index');
    };

    return (
        <View style={styles.container}>
            <View style={styles.title}>
                <Text style={styles.title}>banana bus      🚌</Text>
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
                    style={[styles.input, styles.password]}
                    placeholder="password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TouchableOpacity onPress={handleLogin} style={[styles.button, styles.loginButton]}>
                    <Text style={[styles.buttonText, styles.loginText]}>Login →</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('register')} style={[styles.button, styles.registerButton]}>
                    <Text style={[styles.buttonText, styles.registerText]}>Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#7CBBF1',
    },
    title: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#fff',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    icon: {
        width: 50,
        height: 50,
        marginBottom: 20,
    },
    form: {
        width: '80%',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        padding: 10,
        margin: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        padding: 15,
        marginVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButton: {
        backgroundColor: '#ccff00',
    },
    registerButton: {
        backgroundColor: '#2A8AE4',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    loginText: {
        color: '#2A8AE4',
    },
    registerText: {
        color: '#fff',
    },
    forgotPassword: {
        color: '#007bff',
        marginTop: 10,
    },
});
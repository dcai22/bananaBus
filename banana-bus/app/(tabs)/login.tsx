import { Text, View, StyleSheet, TextInput, Button } from 'react-native';
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
            <Text style={styles.title}>BIG BANANA</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={[styles.input, styles.password]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Link href="/(tabs)/register">
                <Button title="Register" />
            </Link>
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
    input: {
        width: '100%',
        padding: 8,
        margin: 2,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
    },
    password: {
        marginBottom: 16,
    },
});
import { Text, View, StyleSheet, TextInput, Button } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstname, setFirstName] = useState('');
    const [surname, setSurname] = useState('');
    const navigation = useNavigation();

    const handleRegister = () => {
        console.log('Email:', email);
        console.log('Password:', password);
        if (password !== confirmPassword) {
            console.log('Passwords do not match');
            return;
        }
        // TODO: Register user
        navigation.navigate('index');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>REGISTER</Text>
            <TextInput
                style={styles.input}
                placeholder="First name"
                value={firstname}
                onChangeText={setFirstName}
            />
            <TextInput
                style={styles.input}
                placeholder="Surname"
                value={surname}
                onChangeText={setSurname}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={[styles.input]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={[styles.input, styles.password]}
                placeholder="Confirm Password"
                value={password}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <Button title="Register" onPress={handleRegister}/>
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
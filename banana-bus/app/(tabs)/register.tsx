import { Text, View, StyleSheet, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
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
        <ImageBackground
            style={styles.backgroundImage}
            source={{ uri: 'https://www.figma.com/file/ZvVQQmOHdnzSiS0Yg7iwQx/image/78443b2693ec711702b146d4cf971a9a4010c231' }}
        >
            <View style={styles.overlay} />
            <View style={styles.container}>
                <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
                    <Text style={styles.goBack}>← go back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>banana bus      🚌</Text>
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="first name"
                        value={firstname}
                        onChangeText={setFirstName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="surname"
                        value={surname}
                        onChangeText={setSurname}
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
                        style={[styles.input, styles.password]}
                        placeholder="confirm password"
                        value={password}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity onPress={handleRegister} style={styles.button}>
                        <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>
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
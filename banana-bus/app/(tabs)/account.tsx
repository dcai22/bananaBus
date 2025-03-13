import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';

export default function Account() {
    const [userName, setUserName] = useState('');
    const [temperature, setTemperature] = useState(0);
    const [windSpeed, setWindSpeed] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);

    const navigation = useNavigation();
    useEffect(() => {
        // TODO Fetch user name from API
        setUserName('KK Leong');
        // TODO Fetch weather data from API
        setTemperature(30);
        setWindSpeed(10);
        setHumidity(80);
        // TODO Fetch user role from API
        setIsAdmin(true);
    }, []);

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F022%2F737%2F904%2Foriginal%2Fmodern-city-scape-silhouette-simple-minimalist-blue-city-skyline-background-urban-cityscape-silhouettes-illustration-vector.jpg&f=1&nofb=1&ipt=b867ca6f79e10846ab79381e8bc6910f4c9cd82e1a2553f4f9d03738d544d89c&ipo=images' }}
                style={styles.backgroundImage}
            />
            <View style={styles.overlay}>
                <Text style={styles.greeting}>Good Morning, {userName}</Text>
                <View style={styles.weatherContainer}>
                    <Text style={styles.weatherText}>☀️ {temperature}°C</Text>
                    <Text style={styles.weatherText}>💨 {windSpeed} km/h</Text>
                    <Text style={styles.weatherText}>💧 {humidity}%</Text>
                </View>
                <View style={styles.menuContainer}>
                    {/* TODO do these pages */}
                    <MenuItem title="Payment" icon="💳" onPress={() => navigation.navigate('Payment')} />
                    <MenuItem title="Past Bookings" icon="🚌" onPress={() => navigation.navigate('PastBookings')} />
                    <MenuItem title="Support" icon="📞" onPress={() => navigation.navigate('Support')} />
                    { isAdmin && (
                        <MenuItem title="Admin Panel" icon="🗂️" onPress={() => navigation.navigate('AdminPanel')} />
                    )}
                    <MenuItem title="Settings" icon="⚙️" onPress={() => navigation.navigate('Settings')} />
                </View>
            </View>
        </View>
    );
}

function MenuItem({ title, icon }) {
    return (
        <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>{icon} {title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 24,
        color: 'white',
        marginBottom: 10,
    },
    weatherContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
        marginBottom: 20,
    },
    weatherText: {
        fontSize: 16,
        color: 'white',
    },
    menuContainer: {
        marginTop: 100,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    menuItemText: {
        fontSize: 18,
    },
});
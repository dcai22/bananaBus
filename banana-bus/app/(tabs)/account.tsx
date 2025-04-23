import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Device from 'expo-device';
import { getItem } from '../helper';
import Container from '@/components/Container';
import { API_BASE } from '@env';

export default function Account() {
    const [userName, setUserName] = useState('');
    const [temperature, setTemperature] = useState(0);
    const [windSpeed, setWindSpeed] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDriver, setIsDriver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            setRefresh(true);
            return () => {
                setLoading(true);
            };
        }, [])
    )

    useEffect(() => {
        const getAccountName = async () => {
            let token = null;
            if (Device.deviceType === Device.DeviceType.PHONE) {
                token = await getItem('token');
            } else {
                token = localStorage.getItem('token');
            }
            try {
                const response = await fetch(`${API_BASE}/getAccountName`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserName(data.firstName);
                }
            } catch {
                // console.log('Failed to fetch user name');
            } finally {
                setLoading(false);
            }
        }
        getAccountName();
        // TODO Fetch weather data from API
        setTemperature(30);
        setWindSpeed(10);
        setHumidity(80);
        // TODO Fetch user role from API
        setIsAdmin(true);
        setIsDriver(true);
        setRefresh(false);
    }, [refresh]);

    return (
        <Container>
            <Image
                source={{ uri: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F022%2F737%2F904%2Foriginal%2Fmodern-city-scape-silhouette-simple-minimalist-blue-city-skyline-background-urban-cityscape-silhouettes-illustration-vector.jpg&f=1&nofb=1&ipt=b867ca6f79e10846ab79381e8bc6910f4c9cd82e1a2553f4f9d03738d544d89c&ipo=images' }}
                style={styles.backgroundImage}
            />
            <View style={styles.overlay}>
                <Text style={styles.greeting}>Good Morning, {loading ? <ActivityIndicator size="small" color="#ffffff"/> : userName}</Text>
                <View style={styles.weatherContainer}>
                    <Text style={styles.weatherText}>☀️ {temperature}°C</Text>
                    <Text style={styles.weatherText}>💨 {windSpeed} km/h</Text>
                    <Text style={styles.weatherText}>💧 {humidity}%</Text>
                </View>
                <View style={styles.menuContainer}>
                    {/* TODO do these pages */}
                    <MenuItem title="Payment" icon="💳" onPress={() => router.navigate('/payment')} />
                    <MenuItem title="Past Bookings" icon="🚌" onPress={() => router.navigate('/tripsList')} />
                    <MenuItem title="Support" icon="📞" onPress={() => router.navigate('/support')} />
                    { isAdmin && (
                        <MenuItem title="Admin Panel" icon="🗂️" onPress={() => router.navigate('adminPanel')} />
                    )}
                    { isDriver && (
                        <MenuItem title="Driver Panel" icon="🚖" onPress={() => router.navigate('/driverPanel')} />
                    )}
                    <MenuItem title="Settings" icon="⚙️" onPress={() => router.navigate('/settings')} />
                </View>
            </View>
        </Container>
    );
}

function MenuItem({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Text style={styles.menuItemText}>{icon} {title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
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
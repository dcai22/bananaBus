import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Device from 'expo-device';
import { getItem } from '../helper';
import Container from '@/components/Container';
import { initStripe, CustomerSheetBeta } from '@stripe/stripe-react-native';
import { FontAwesome } from '@expo/vector-icons';
import { API_BASE, STRIPE_PUBLISHABLE_KEY } from '@env';

export default function Account() {
    const [userName, setUserName] = useState('');
    const [temperature, setTemperature] = useState(0);
    const [windSpeed, setWindSpeed] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [isManager, setisManager] = useState(false);
    const [isDriver, setIsDriver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const [customerSheetVisible, setCustomerSheetVisible] = useState(false);
    const [customer, setCustomer] = useState('');
    const [ephemeralKey, setEphemeralKey] = useState('');
    const [intent, setIntent] = useState('');
    const [sheetLoading, setSheetLoading] = useState(false);

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
        const getAccountDetails = async () => {
            let token = null;
            if (Device.deviceType === Device.DeviceType.PHONE) {
                token = await getItem('token');
            } else {
                token = localStorage.getItem('token');
            }
            try {
                const response = await fetch(`${API_BASE}/getAccountDetails`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserName(data.firstName);
                    setisManager(data.isManager);
                    setIsDriver(data.isDriver);
                }
            } catch {
                // console.log('Failed to fetch user name');
            } finally {
                setLoading(false);
            }
        }
        getAccountDetails();
        // TODO Fetch weather data from API
        setTemperature(30);
        setWindSpeed(10);
        setHumidity(80);
        setRefresh(false);
    }, [refresh]);

    useEffect(() => {
        async function initialise() {
            await initStripe({
                publishableKey: STRIPE_PUBLISHABLE_KEY,
            });
        }
        initialise();
    })

    async function fetchCustomerKey() {
        const token = await getItem('token');
        try {
            const response = await fetch(`${API_BASE}/createCustomerKey`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const { customer, ephemeralKey } = await response.json();
                return { customer, ephemeralKey };
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
        }
    }

    async function fetchCustomerIntent() {
        const token = await getItem('token');
        try {
            const response = await fetch(`${API_BASE}/createSetupIntent`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const { setupIntent } = await response.json();
                return { setupIntent };
            }
        } catch (error) {
            console.error('Error fetching payment intent:', error);
        }
    }

    async function initialiseCustomerSheet() {
        const customerKey = await fetchCustomerKey();
        const customerIntent = await fetchCustomerIntent();
        if (!customerKey || !customerIntent) {
            console.error('Failed to fetch customer key or intent');
            return;
        }
        const { customer, ephemeralKey } = customerKey;
        const { setupIntent } = customerIntent;

        const { error } = await CustomerSheetBeta.initialize({
            setupIntentClientSecret: setupIntent,
            customerEphemeralKeySecret: ephemeralKey,
            customerId: customer,
            headerTextForSelectionScreen: 'Manage cards',
        });

        if (!error) {
            setIntent(setupIntent);
            setCustomer(customer);
            setEphemeralKey(ephemeralKey);
        }
    }

    async function handlePayment() {
        setSheetLoading(true);
        await initialiseCustomerSheet();
        setSheetLoading(false);
        setCustomerSheetVisible(true);
    }

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
                    <MenuItem title="Payments" icon="credit-card" onPress={handlePayment} isLoading={sheetLoading}/>
                    <MenuItem title="Past Bookings" icon="bus" onPress={() => router.navigate('/pastBookings')}/>
                    <MenuItem title="Support" icon="phone" onPress={() => router.navigate('/support')}/>
                    { isManager && (
                        <MenuItem title="Admin Panel" icon="folder" onPress={() => router.navigate('/adminPanel')}/>
                    )}
                    { isDriver && (
                        <MenuItem title="Driver Panel" icon="truck" onPress={() => router.navigate('/driverPanel')} />
                    )}
                    <MenuItem title="Settings" icon="cog" onPress={() => router.push('/settings')} />
                </View>
            </View>
            <CustomerSheetBeta.CustomerSheet
                visible={customerSheetVisible}
                onResult={({error, paymentOption, paymentMethod}) => {
                    setCustomerSheetVisible(false);
                    if (error) {
                        console.log('Error:', error);
                        return;
                    }
                    if (paymentOption) {
                        console.log('Payment Option:', paymentOption);
                    }
                    if (paymentMethod) {
                        console.log('Payment Method:', paymentMethod);
                    }
                }}
                customerId={customer}
                customerEphemeralKeySecret={ephemeralKey}
                setupIntentClientSecret={intent}
                headerTextForSelectionScreen='Manage cards'
            />
        </Container>
    );
}

function MenuItem({ title, icon, onPress, isLoading }: { title: string; icon: keyof typeof FontAwesome.glyphMap; onPress: () => void, isLoading?: boolean }) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={isLoading}>
            {isLoading ? (
                <ActivityIndicator size="small" style={styles.icons}/>
            ) : (
                <>
                    <FontAwesome name={icon} style={styles.icons}/> 
                    <Text style={styles.menuItemText}>{title}</Text>
                </>
            )}
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
        marginVertical: 10,
    },
    menuItemText: {
        fontSize: 20,
        marginLeft: 10,
    },
    icons: {
        color: '#4399dc',
        fontSize: 24,
        width: 30,
        textAlign: 'center',
    }
});
import { Text, View, StyleSheet, TextInput, Alert, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import React, { useState } from 'react';
import Modal from 'react-native-modal';
import { useFocusEffect } from '@react-navigation/native';
import { LoadingButton, NoButton, YesButton } from '@/components/Buttons';
import { FontAwesome } from '@expo/vector-icons';
import { getItem } from '../helper';
import * as Device from "expo-device";
import { Header } from '@/components/Header';
import Container from '@/components/Container';

export default function Payment() {
    const [enquiryType, setEnquiryType] = useState('');
    const [customHeading, setCustomHeading] = useState('');
    const [enquiryText, setEnquiryText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const enquiryOptions = [
        { label: 'Billing Issue', value: 'billing' },
        { label: 'Technical Support', value: 'technical' },
        { label: 'General Inquiry', value: 'general' },
        { label: 'Other', value: 'other' },
    ];

    const handleSend = async () => {
        // TODO make an API call to send the email
        // generate a ticket number as well
        // const ticketNumber = `TICKET-${Math.floor(Math.random() * 1000000)}`;

        let heading;
        switch (enquiryType) {
            case 'billing':
                heading = 'Billing Issue';
                break;
            case 'technical':
                heading = 'Technical Support';
                break;
            case 'general':
                heading = 'General Inquiry';
                break;
            case 'other':
                heading = customHeading;
                break;
            default:
                break;
        }
        const body = enquiryText;
        if (!heading) {
            Alert.alert('Error', 'Please select an enquiry type or enter a custom heading.');
            return;
        }

        if (!body) {
            Alert.alert('Error', 'Please enter your enquiry text.');
            return;
        }
        let token;
        if (Device.deviceType === Device.DeviceType.PHONE) {
            token = await getItem('token');
        } else {
            token = localStorage.getItem('token');
        }
        
        if (!token) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/sendEnquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    heading,
                    body,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                Alert.alert('Error', errorData.error || 'Failed to send your enquiry. Please try again later.');
            }

            const data = await response.json();
            const ticketNumber = data.ticketNumber;
            Alert.alert('Success', `Your enquiry has been sent! Ticket Number: ${ticketNumber}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to send your enquiry. Please try again later.');
            return;
        } finally {
            setLoading(false);
        }
        setEnquiryType('');
        setCustomHeading('');
        setEnquiryText('');
        Keyboard.dismiss();
    };

    const openModal = () => {
        setModalVisible(true);
    }
    
    const closeModal = () => {
        setModalVisible(false);
    }

    useFocusEffect(
        React.useCallback(() => {
            setEnquiryType('');
            setCustomHeading('');
            setEnquiryText('');
        }, [])
    );

    return (
        <Container>
            <Header title="Support" icon={<FontAwesome name="life-ring"/>} />
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={openModal}
                >
                    <Text style={styles.dropdownText}>
                        {enquiryType ? enquiryOptions.find(option => option.value === enquiryType)?.label : 'Select enquiry type'}
                    </Text>
                </TouchableOpacity>
                {enquiryType === 'other' && (
                    <TextInput
                        style={styles.input}
                        placeholder="Enter a heading for your issue"
                        value={customHeading}
                        onChangeText={setCustomHeading}
                    />
                )}
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Type your enquiry here..."
                    value={enquiryText}
                    onChangeText={setEnquiryText}
                    multiline
                />
                {loading ? (
                    <LoadingButton style={styles.buttons} type='yes' />
                ) : (
                    <YesButton text="Send" onPress={handleSend} style={styles.buttons} />
                )}
            </View>
            <Modal
                isVisible={modalVisible}
                onBackdropPress={closeModal}
                onBackButtonPress={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={enquiryOptions}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setEnquiryType(item.value);
                                        closeModal();
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </Container>
    );
};

const styles = StyleSheet.create({
    section: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 36,
        fontWeight: "bold",
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        width: '100%',
    },
    modalItemText: {
        fontSize: 16,
        color: '#000',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dropdownText: {
        fontSize: 16,
        color: '#000',
    },
    buttons: {
        flex: 0,
        marginHorizontal: 0,
    }
});
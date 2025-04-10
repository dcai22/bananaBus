import { Text, View, StyleSheet, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { NoButton } from '@/components/Buttons';
import { set } from 'date-fns';
import { getItem } from '../helper';

export default function Payment() {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState('');

    const handleAddCard = async () => {
        try {
            const response = await fetch('https://banana-bus.vercel.app/addCard', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // TODO CHANGE BACKEND CARD TYPE
                    type: 'Visa',
                    cardNumber,
                    expiryMonth,
                    expiryYear,
                    cvv,
                }),
            });
            if (response.ok) {
				Alert.alert('Success', 'Card added successfully!');
                setCardNumber('');
                setExpiryMonth('');
                setExpiryYear('');
                setCvv('');
                router.back();
			}
        } catch (error) {
            Alert.alert('Error', 'Failed to add card. Please try again.');
            setCardNumber('');
            setExpiryMonth('');
            setExpiryYear('');
            setCvv('');
            router.back();
        }
    };

    const openModal = (content: string) => {
        if (content === 'EXP') {
            setModalContent('The expiry date is located on the front of your card, usually in MM/YY format.');
        }
        else if (content === 'CVV') {
            setModalContent('The CVV is a 3-digit number located on the back of your card, near the signature strip.');
        }
        setModalVisible(true);
    }

    const closeModal = () => {
        setModalVisible(false);
        setModalContent('');
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.goBackContainer}>
                    <FontAwesome name="arrow-left" style={styles.goBackArrow} onPress={() => router.back()} />
                    <Text style={styles.goBackText} onPress={() => router.back()}>go back</Text>
                </View>
            </View>
            <View style={styles.formContainer}>
                <View style={styles.formSection}>
                    <Text style={styles.label}>Card Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter card number"
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        maxLength={16}
                    />
                </View>
                
                <View style={styles.formSection}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="MM"
                        keyboardType="numeric"
                        value={expiryMonth}
                        onChangeText={setExpiryMonth}
                        maxLength={2}
                    />
                    <Text style={{ marginHorizontal: 5 }}>/</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YY"
                        keyboardType="numeric"
                        value={expiryYear}
                        onChangeText={setExpiryYear}
                        maxLength={2}
                    />
                    <TouchableOpacity onPress={() => openModal('EXP')}>
                        <FontAwesome name="question-circle" style={styles.icon} />
                    </TouchableOpacity>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="123"
                        keyboardType="numeric"
                        secureTextEntry
                        value={cvv}
                        onChangeText={setCvv}
                        maxLength={3}
                    />
                    <TouchableOpacity onPress={() => openModal('CVV')}>
                        <FontAwesome name="question-circle" style={styles.icon} />
                    </TouchableOpacity>
                </View>
                <NoButton
                    text="Add Card"
                    onPress={handleAddCard}
                    style={styles.addButton}
                />
            </View>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{modalContent}</Text>
                        <NoButton text="Close" onPress={closeModal} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e5f0fa',
    },
    header: {
        backgroundColor: "#060c40",
        height: "10%",
        padding: 20,
        boxShadow: "0px 0px 5px grey",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    goBackContainer: {
        height: "100%",
        flexDirection: "row",
    },
    goBackArrow: {
        paddingTop: 5,
        color: "#009cff",
        fontSize: 20,
    },
    goBackText: {
        fontWeight: "bold",
        fontSize: 20,
        color: "#009cff",
        paddingLeft: 10,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    formSection: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlignVertical: 'center',
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#fff',
        paddingHorizontal: 5,
    },
    addButton: {
        margin: 12,
        width: '75%'
    },
    icon: {
        fontSize: 20,
        color: '#009cff',
        marginHorizontal: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
});
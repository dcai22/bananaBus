import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { NoButton, YesButton } from '@/components/Buttons';
import { getItem } from '../helper';
import Container from '@/components/Container';
import { CheckoutHeader } from '@/components/Header';
import { CustomModal } from '@/components/Modal';
import valid from 'card-validator';

export default function Payment() {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState('');

    const handleAddCard = async () => {
        let errorMessage = '';
        // Validate card number
        const cardNumberValidation = valid.number(cardNumber);
        if (!cardNumberValidation.isValid) {
            errorMessage = 'Invalid card number.';
        }

        // Detect card type
        const type = cardNumberValidation.card ? cardNumberValidation.card.type : 'Unknown';

        // Validate expiry date
        const expiryValidation = valid.expirationDate(`${expiryMonth}/${expiryYear}`);
        if (!expiryValidation.isValid) {
            errorMessage = 'Invalid expiry date.';
        }

        // Validate CVV
        const cvvValidation = valid.cvv(cvv, cardNumberValidation.card ? cardNumberValidation.card.code.size : 3);
        if (!cvvValidation.isValid) {
            errorMessage = 'Invalid CVV.';
        }

        // TODO uncomment for production
        // if (errorMessage) {
        //     Alert.alert('Error', errorMessage + ' However, adding card for demonstration purposes.');
        // }

        const token = await getItem('token');
        try {
            const response = await fetch('https://banana-bus.vercel.app/addCard', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type,
                    cardNumber,
                    expiryMonth,
                    expiryYear,
                    cvv,
                }),
            });
            if (response.ok) {
                // TODO uncomment for production + remove error message
				// Alert.alert('Success', 'Card added successfully!');
                if (errorMessage) {
                    Alert.alert('Error', errorMessage + ' However, adding card for demonstration purposes.');
                }
			}
        } catch (error) {
            Alert.alert('Error', 'Failed to add card. Please try again.');
        } finally {
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

    const resetPage = () => {
        setCardNumber('');
        setExpiryMonth('');
        setExpiryYear('');
        setCvv('');
    }

    return (
        <Container>
            <CheckoutHeader title="" showGoBack={true} resetPage={resetPage}/>
            <View style={styles.formContainer}>
                <View style={styles.formSection}>
                    <Text style={styles.label}>Card Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter card number"
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={(text) => {
                            setCardNumber(text.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-'));
                        }}
                        maxLength={19}
                    />
                </View>
                
                <View style={styles.formSection}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="MM"
                        keyboardType="numeric"
                        value={expiryMonth}
                        onChangeText={(text) => {
                            setExpiryMonth(text.replace(/\D/g, ''));
                        }}
                        maxLength={2}
                    />
                    <Text style={{ marginHorizontal: 5 }}>/</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YY"
                        keyboardType="numeric"
                        value={expiryYear}
                        onChangeText={(text) => {
                            setExpiryYear(text.replace(/\D/g, ''));
                        }}
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
                <YesButton
                    text="Add Card"
                    onPress={handleAddCard}
                    style={styles.buttons}
                />
            </View>
            <CustomModal
                visible={modalVisible}
                onCancel={closeModal}
                headerText="Information"
            >
                <Text style={styles.modalText}>{modalContent}</Text>
                <NoButton text="Close" onPress={closeModal} style={styles.buttons}/>
            </CustomModal>
        </Container>
    );
}

const styles = StyleSheet.create({
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
    buttons: {
        width: '100%',
        flex: 0,
    },
    icon: {
        fontSize: 20,
        color: '#009cff',
        marginHorizontal: 5,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
});
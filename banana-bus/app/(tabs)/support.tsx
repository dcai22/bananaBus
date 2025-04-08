import { Text, View, StyleSheet, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { NoButton } from '@/components/Buttons';
import { FontAwesome } from '@expo/vector-icons';

export default function Payment() {
    const [enquiryType, setEnquiryType] = useState('');
    const [customHeading, setCustomHeading] = useState('');
    const [enquiryText, setEnquiryText] = useState('');

    const handleSend = async () => {
        // TODO make an API call to send the email
        // generate a ticket number as well
        const ticketNumber = `TICKET-${Math.floor(Math.random() * 1000000)}`;
        const heading = enquiryType === 'other' ? customHeading : enquiryType;
        const body = enquiryText;

        if (!heading) {
            Alert.alert('Error', 'Please select an enquiry type or enter a custom heading.');
            return;
        }

        if (!body) {
            Alert.alert('Error', 'Please enter your enquiry text.');
            return;
        }

        // TODO remove
        console.log(`Sending email with ticket number: ${ticketNumber}`);
        console.log(`Heading: ${heading}`);
        console.log(`Body: ${body}`);

        Alert.alert('Success', `Your enquiry has been sent! Ticket Number: ${ticketNumber}`);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.header}>Support</Text>
                <FontAwesome name="life-ring" style={[styles.header, styles.headerIcon]}/>
            </View>
            <View style={styles.section}>
                <View style={styles.picker}>
                    <Picker
                        selectedValue={enquiryType}
                        onValueChange={(itemValue) => setEnquiryType(itemValue)}
                    >
                        <Picker.Item label="Select Enquiry Type" value=""/>
                        <Picker.Item label="Billing" value="billing"/>
                        <Picker.Item label="Technical Support" value="tech"/>
                        <Picker.Item label="General Enquiry" value="general"/>
                        <Picker.Item label="Other" value="other"/>
                    </Picker>
                </View>
                
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
                <NoButton text="Send" onPress={handleSend} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e5f0fa',
    },
    section: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 36,
        fontWeight: "bold",
    },
    headerIcon: {
        fontSize: 48,
        color: "#4399dc",
    },
    headerBox: {
        backgroundColor: '#fff',
        marginBottom: 24,
        padding: 35,
        minHeight: 150,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
    },
    picker: {
        backgroundColor: '#fff',
        marginBottom: 20,
        borderRadius: 10,
        paddingHorizontal: 10,
        shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
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
});
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { YesButton, NoButton } from '@/components/Buttons';

interface CustomModalProps {
    visible: boolean;
    headerText: string;
    inputPlaceholders?: string[];
    inputValues?: string[];
    onInputChange?: (index: number, value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    info?: string;
}

export const CustomModal: React.FC<CustomModalProps> = ({
    visible,
    headerText,
    inputPlaceholders,
    inputValues,
    onInputChange,
    onConfirm,
    onCancel,
    info,
}) => {
    return (
        <Modal
            isVisible={visible}
            onBackButtonPress={onCancel}
            onBackdropPress={onCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalHeader}>{headerText}</Text>
                    {info && <Text style={styles.info}>{info}</Text>}
                    {(inputPlaceholders ?? []).map((placeholder, index) => (
                        <TextInput
                            key={index}
                            style={styles.input}
                            placeholder={placeholder}
                            value={inputValues?.[index] || ''}
                            onChangeText={(value) => onInputChange?.(index, value)}
                            autoCapitalize="none"
                        />
                    ))}
                    <YesButton onPress={onConfirm} text="Confirm" />
                    <NoButton onPress={onCancel} text="Cancel" />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        alignItems: "center",
    },
    modalHeader: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
    },
    input: {
        width: "100%",
        padding: 10,
        paddingHorizontal: 20,
        margin: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    info: {
        fontSize: 14,
        marginBottom: 10,
    }
});

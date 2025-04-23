import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Modal from 'react-native-modal';

interface CustomModalProps {
    visible: boolean;
    onCancel: () => void;
    children: React.ReactNode;
    headerText?: string;
    infoText?: string;
}

/**
 * CustomModal Component
 * 
 * A reusable modal component that accepts children for custom content and an optional header text.
 * 
 * Props:
 * - `visible` (boolean): Controls the visibility of the modal.
 * - `onCancel` (function): A callback function triggered when the modal is dismissed.
 * - `children` (React.ReactNode): Custom content to render inside the modal.
 * - `headerText` (string, optional): Text to display as the modal's header.
 * - `infoText` (string, optional): Additional information text to display inside the modal.
 * 
 * Example Usage:
 * <CustomModal
 *     visible={isModalVisible}
 *     onCancel={() => setModalVisible(false)}
 *     headerText="My Modal Header"
 *     infoText="This is some additional information."
 * >
 *     <Text>Custom Content Here</Text>
 *     <Button title="Close" onPress={() => setModalVisible(false)} />
 * </CustomModal>
 */
export const CustomModal: React.FC<CustomModalProps> = ({ visible, onCancel, children, headerText, infoText }) => {
    return (
        <Modal
            isVisible={visible}
            onBackButtonPress={onCancel}
            onBackdropPress={onCancel}
        >
            <View style={styles.modalContent}>
                {headerText && <Text style={styles.headerText}>{headerText}</Text>}
                {infoText && <Text style={styles.infoText}>{infoText}</Text>}
                {children}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    infoText: {
        fontSize: 14,
        marginBottom: 6,
        textAlign: "center",
    },
});
import React from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';
import Modal from 'react-native-modal';
import { YesButton, NoButton } from '@/components/Buttons';

interface ButtonConfig {
    text: string;
    onPress: () => void;
    type: 'yes' | 'no';
}

interface CustomModalProps {
    visible: boolean;
    headerText: string;
    inputPlaceholders?: string[];
    inputValues?: string[];
    onInputChange?: (index: number, value: string) => void;
    onConfirm?: () => void;
    onCancel: () => void;
    info?: string;
    buttons?: ButtonConfig[];
}

/**
 * CustomModal Component
 * 
 * A reusable and customizable modal component for displaying information, input fields and/or action buttons.
 * 
 * Props:
 * - `visible` (boolean): Controls the visibility of the modal. Pass the state for visibility.
 * - `headerText` (string): The header text displayed at the top of the modal.
 * - `inputPlaceholders` (string[], optional): An array of placeholder texts for input fields. If provided, input fields will be rendered.
 * - `inputValues` (string[], optional): An array of the state values for input. MATCH THE ORDER of `inputPlaceholders`.
 * - `onInputChange` (function, optional): Pass the setState for the data.
 * - `onConfirm` (function, optional): A callback function triggered when the "Confirm" button is pressed. Defaults to a no-op if not provided.
 * - `onCancel` (function): A callback function triggered when the modal is dismissed (via backdrop press, back button, or "Cancel" button).
 * - `info` (string, optional): Additional small text displayed below the header.
 * - `buttons` (ButtonConfig[], optional): An array of custom button configurations. Each button has the following properties:
 *   - `text` (string): The text displayed on the button.
 *   - `onPress` (function): A callback function triggered when the button is pressed.
 *   - `type` ('yes' | 'no'): The type of button, determining its style (`YesButton` or `NoButton`).
 * 
 * Example Usage:
 * <CustomModal
 *     visible={isModalVisible}
 *     headerText="Enter Details"
 *     inputPlaceholders={["Name", "Email"]}
 *     inputValues={[name, email]}
 *     onInputChange={(index, value) => {
 *         if (index === 0) setName(value);
 *         if (index === 1) setEmail(value);
 *     }}
 *     onConfirm={() => console.log("Confirmed")}
 *     onCancel={() => setModalVisible(false)}
 *     info="Please fill out the required fields."
 *     buttons={[
 *         { text: "Submit", onPress: handleSubmit, type: "yes" },
 *         { text: "Cancel", onPress: () => setModalVisible(false), type: "no" },
 *     ]}
 * />
 * 
 * Notes:
 * - If `buttons` is not provided, default "Confirm" and "Cancel" buttons will be rendered.
 * 
 */
export const CustomModal: React.FC<CustomModalProps> = ({
    visible,
    headerText,
    inputPlaceholders,
    inputValues,
    onInputChange,
    onConfirm,
    onCancel,
    info,
    buttons,
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
                    <View style={styles.buttonContainer}>
                        {buttons
                            ? buttons.map((button, index) => (
                                  button.type === 'yes' ? (
                                      <YesButton
                                          key={index}
                                          onPress={button.onPress}
                                          text={button.text}
                                      />
                                  ) : (
                                      <NoButton
                                          key={index}
                                          onPress={button.onPress}
                                          text={button.text}
                                      />
                                  )
                              ))
                            : // Default buttons if no custom buttons are provided
                            <>
                                <YesButton onPress={onConfirm || (() => {})} text="Confirm" />
                                <NoButton onPress={onCancel} text="Cancel" />
                            </>}
                    </View>
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
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        alignItems: "center",
    },
    modalHeader: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    input: {
        width: "100%",
        padding: 10,
        margin: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    info: {
        fontSize: 14,
        marginBottom: 10,
    },
    buttonContainer: {
        width: "100%",
    },
});

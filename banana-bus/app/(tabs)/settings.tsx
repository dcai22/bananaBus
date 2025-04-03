import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from "react-native";

interface UserDetails {
    surname: string;
    firstName: string;
    email: string;
}

export default function Settings() {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState("");
    const [formData, setFormData] = useState({
        surname: "",
        firstName: "",
        email: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const fetchUserDetails = async (): Promise<UserDetails> => {
        // TODO Replace this with actual API call to fetch user details
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    surname: "Leong",
                    firstName: "KK",
                    email: "KK@gmail.com",
                });
            }, 500);
        });
    };

    const openModal = async (type: string) => {
        setModalType(type);

        if (type === "details") {
            const userDetails = await fetchUserDetails();
            setFormData((prev) => ({
                ...prev,
                ...userDetails,
            }));
        } else {
            setFormData({
                surname: "",
                firstName: "",
                email: "",
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }

        setModalVisible(true);
    };

    const handleSave = () => {
        if (modalType === "details") {
            alert(`Details updated:\nSurname: ${formData.surname}\nFirst Name: ${formData.firstName}\nEmail: ${formData.email}`);
            // TODO BACKEND API CALL TO UPDATE DETAILS
        } else if (modalType === "password") {
            if (formData.newPassword !== formData.confirmPassword) {
                alert("New password and confirm password do not match!");
                return;
            }
            // TODO BACKEND API CALL TO UPDATE PASSWORD
            alert(`Password updated successfully!`);
        }
        setModalVisible(false);
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const handleLogout = () => {
        // TODO LOGOUT LOGIC
        alert("You have been logged out.");
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.header}>Settings</Text>
                {/* TODO change this icon */}
                <Text style={styles.header}>⚙️</Text>
            </View>
            <View style={styles.section}>
                <TouchableOpacity style={styles.option} onPress={() => openModal("details")}>
                    <Text style={styles.optionText}>Change details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => openModal("password")}>
                    <Text style={styles.optionText}>Update password</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => openModal("logout")}>
                    <Text style={styles.optionText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancel}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {modalType === "details" && (
                            <>
                                <Text style={styles.modalHeader}>Change Details</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Surname"
                                    value={formData.surname}
                                    onChangeText={(text) => setFormData({ ...formData, surname: text })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                />
                            </>
                        )}
                        {modalType === "password" && (
                            <>
                                <Text style={styles.modalHeader}>Update Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Old Password"
                                    secureTextEntry={true}
                                    value={formData.oldPassword}
                                    onChangeText={(text) => setFormData({ ...formData, oldPassword: text })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="New Password"
                                    secureTextEntry={true}
                                    value={formData.newPassword}
                                    onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    secureTextEntry={true}
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                />
                            </>
                        )}
                        {modalType === "logout" && (
                            <>
                                <Text style={styles.modalHeader}>Are you sure you want to logout?</Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                                        <Text style={styles.modalButtonText}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCancel}>
                                        <Text style={styles.modalButtonText}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                        {modalType !== "logout" && (
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
                                    <Text style={styles.modalButtonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCancel}>
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#dff4ff",
    },
    header: {
        fontSize: 36,
        fontWeight: "bold",
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    option: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 8,
        width: "80%",
        alignItems: "center",
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    optionText: {
        fontSize: 16,
        color: "#333",
    },
    section: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    modalButton: {
        flex: 1,
        backgroundColor: "#2196F3",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: "#FF3B30",
    },
    modalButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});
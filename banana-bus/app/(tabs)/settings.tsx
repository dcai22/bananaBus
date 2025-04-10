import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from "react-native";
import { useNavigation } from "expo-router";
import { getItem, saveItem } from "../helper";
import { YesButton, NoButton } from "@/components/Buttons";
import { set } from "date-fns";

interface UserDetails {
    lastName: string;
    firstName: string;
    email: string;
}

export default function Settings() {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState("");
    const [formData, setFormData] = useState({
        lastName: "",
        firstName: "",
        email: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const navigation = useNavigation();

    const fetchUserDetails = async () => {
        const token = await getItem('token');
        if (!token) {
            alert("Error fetching user data, returning to login screen.");
            setModalVisible(false);
            saveItem('token', '');
            navigation.navigate("login");
            return;
        }

        try {
            const response = await fetch("https://banana-bus.vercel.app/getAccountDetails", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                return {
                    lastName: data.lastName,
                    firstName: data.firstName,
                    email: data.email,
                }
            } else {
                const errorData = await response.json();
                alert("Error fetching user details:" + errorData.error);
                setModalVisible(false);
            }
        }  catch (error) {
            console.error("Error fetching user details:", error);
            setModalVisible(false);
        }
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
                lastName: "",
                firstName: "",
                email: "",
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }

        setModalVisible(true);
    };

    const closeModal = () => {
        setFormData({
            lastName: "",
            firstName: "",
            email: "",
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setModalVisible(false);
    }

    const handleSave = async () => {
        const token = await getItem('token');
        if (!token) {
            alert("Error fetching user data, returning to login screen.");
            closeModal();
            saveItem('token', '');
            navigation.navigate("login");
            return;
        }

        if (modalType === "details") {
            try {
                const response = await fetch("https://banana-bus.vercel.app/updateAccountDetails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        lastName: formData.lastName,
                        firstName: formData.firstName,
                        email: formData.email,
                    }),
                });
                if (response.ok) {
                    alert(`Details updated:\nLast Name: ${formData.lastName}\nFirst Name: ${formData.firstName}\nEmail: ${formData.email}`);
                } else {
                    const errorData = await response.json();
                    alert("Error updating details:" + errorData.error);
                }
            } catch(error) {
                console.error("Error updating user details:", error);
                alert("Error updating details, please try again.");
            }
        } else if (modalType === "password") {
            if (formData.newPassword !== formData.confirmPassword) {
                alert("New password and confirm password do not match!");
                return;
            }
            try {
                const response = await fetch("https://banana-bus.vercel.app/updateAccountPassword", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        oldPassword: formData.oldPassword,
                        newPassword: formData.newPassword,
                    }),
                });
                
                if (response.ok) {
                    alert("Password updated successfully!");
                } else {
                    const errorData = await response.json();
                    alert("Error updating password:" + errorData.error);
                }
            } catch (error) {
                console.error("Error updating password:", error);
                alert("Error updating password, please try again.");
            }
        }
        closeModal();
    };

    const handleLogout = async () => {
        const token = await getItem('token');
        const userId = await getItem('userId');
        console.log(`Token: ${token}, UserId: ${userId}`);
        if (token === null || userId === null) {
            alert("Error fetching user data, returning to login screen.");
            closeModal();
            navigation.navigate("login");
            return;
        }

        try {
            const response = await fetch("https://banana-bus.vercel.app/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ userId }),
            });
            if (response.ok) {
                console.log("Logout successful");
                alert("You have been logged out.");
                
            } else {
                const errorData = await response.json();
                alert("Error logging out:" + errorData.error);
            }
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Error fetching data, returning to login screen.");
        }
        saveItem('token', '');
        saveItem('userId', '');
        closeModal();
        navigation.navigate("login");
    };

    const handleDeleteAccount = async () => {
        // TODO Send most likely send an email to account to confirm
        // sendEmail()
        const token = await getItem('token');
        const userId = await getItem('userId');
        if (token === null || userId === null) {
            alert("Error fetching user data, returning to login screen.");
            closeModal();
            navigation.navigate("login");
            return;
        }

        try {
            const response = await fetch("https://banana-bus.vercel.app/deleteAccount", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ userId }),
            });
            if (response.ok) {
                console.log("Account deleted successfully");
                alert("Your account has been deleted.");
            } else {
                const errorData = await response.json();
                alert("Error deleting account:" + errorData.error);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
        }

        saveItem('token', '');
        saveItem('userId', '');
        closeModal();
        navigation.navigate("login");
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
                <TouchableOpacity style={[styles.option, styles.deleteOption]} onPress={() => openModal("delete")}>
                    <Text style={[styles.optionText, styles.deleteOptionText]}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {modalType === "details" && (
                            <>
                                <Text style={styles.modalHeader}>Change Details</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
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
                                    <NoButton text="Yes" onPress={handleLogout} style={styles.modalButton}/>
                                    <YesButton text="No" onPress={closeModal} style={styles.modalButton} />
                                </View>
                            </>
                        )}
                        {modalType === "delete" && (
                            <>
                                <Text style={styles.modalHeader}>Are you sure you want to delete your account?</Text>
                                <Text style={styles.modalInfo}>This action is permanent.</Text>
                                <View style={styles.modalButtons}>
                                    <NoButton text="Yes" onPress={handleDeleteAccount} style={styles.modalButton}/>
                                    <YesButton text="No" onPress={closeModal} style={styles.modalButton} />
                                </View>
                            </>
                        )}
                        {(modalType !== "logout" && modalType !== "delete") && (
                            <View style={styles.modalButtons}>
                                <YesButton text="Save" onPress={handleSave} style={styles.modalButton}/>
                                <NoButton text="Cancel" onPress={closeModal} style={styles.modalButton} />
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
    },
    modalInfo: {
        fontSize: 12,
        marginBottom: 16,
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
        marginHorizontal: 5,
    },
    deleteOption: {
        backgroundColor: "#FF3B30",
    },
    deleteOptionText: {
        color: "white",
        fontWeight: "bold",
    },
});
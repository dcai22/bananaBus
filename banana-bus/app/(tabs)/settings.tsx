import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getItem, saveItem } from "../helper";
import { Header } from "@/components/Header";
import Container from "@/components/Container";
import { CustomModal } from "@/components/Modal";
import { NoButton, YesButton } from "@/components/Buttons";
import PasswordInput from "@/components/PasswordInput";

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
        isExternal: false,
    });
    const [isExternal, setIsExternal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

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
        const fetchIsExternal = async () => {
            const externalStatus = await getItem("isExternal");
            setIsExternal(externalStatus === "true");
        }

        fetchIsExternal();
        setRefresh(false);
    }, [refresh]);

    const fetchUserDetails = async () => {
        const token = await getItem('token');
        if (!token) {
            alert("Error fetching user data, returning to login screen.");
            setModalVisible(false);
            saveItem('token', '');
            router.navigate('/login');
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
                    isExternal: data.isExternal,
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
                isExternal: false,
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
            isExternal: false,
        });
        setModalVisible(false);
    }

    const handleSave = async () => {
        const token = await getItem('token');
        if (!token) {
            alert("Error fetching user data, returning to login screen.");
            closeModal();
            saveItem('token', '');
            router.navigate("/login");
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
        if (token === null || userId === null) {
            alert("Error fetching user data, returning to login screen.");
            closeModal();
            router.navigate("/login");
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
        saveItem('isExternal', '');
        closeModal();
        router.navigate("/login");
    };

    const handleDeleteAccount = async () => {
        // TODO Send most likely send an email to account to confirm
        const token = await getItem('token');
        const userId = await getItem('userId');
        if (token === null || userId === null) {
            alert("Error fetching user data, returning to login screen.");
            closeModal();
            router.navigate("/login");
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
        saveItem('isExternal', '');
        closeModal();
        router.navigate("/login");
    };

    return (
        <Container>
            <Header title="Settings" showGoBack={false} emoji="⚙️"/>
            <View style={styles.section}>
                <TouchableOpacity style={styles.option} onPress={() => openModal("details")}>
                    <Text style={styles.optionText}>Change details</Text>
                </TouchableOpacity>
                {!isExternal && (
                    <TouchableOpacity style={styles.option} onPress={() => openModal("password")}>
                        <Text style={styles.optionText}>Update password</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.option} onPress={() => openModal("logout")}>
                    <Text style={styles.optionText}>Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.option, styles.deleteOption]} onPress={() => openModal("delete")}>
                    <Text style={[styles.optionText, styles.deleteOptionText]}>Delete Account</Text>
                </TouchableOpacity>
            </View>
            <CustomModal
                visible={modalVisible}
                onCancel={closeModal}
                headerText={modalType === "details" ? "Change Details" : modalType === "password" ? "Update Password" : modalType === "logout" ? "Logout" : "Delete Account"}
                infoText={modalType === "delete" ? "Are you sure you want to delete your account? This action cannot be undone." : ""}
            >
                {modalType === "details" && (
                    <>
                        <Text style={styles.info}>Last name:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                        />
                        <Text style={styles.info}>First name:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            value={formData.firstName}
                            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                        />
                        <Text style={styles.info}>Email:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            autoCapitalize="none"
                        />
                    </>
                )}
                {modalType === "password" && (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Old Password"
                            secureTextEntry={true}
                            value={formData.oldPassword}
                            onChangeText={(text) => setFormData({ ...formData, oldPassword: text })}
                        />
                        <PasswordInput
                            placeholder="New Password"
                            value={formData.newPassword}
                            onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                        />
                        <PasswordInput
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                        />
                    </>
                )}
                {modalType === "logout" && (
                    <>
                        <View style={styles.modalButtons}>
                            <YesButton text="Yes" onPress={handleLogout} style={styles.modalButton}/>
                            <NoButton text="No" onPress={closeModal} style={styles.modalButton} />
                        </View>
                    </>
                )}
                {modalType === "delete" && (
                    <>
                        <View style={styles.modalButtons}>
                            <YesButton text="Yes" onPress={handleDeleteAccount} style={styles.modalButton}/>
                            <NoButton text="No" onPress={closeModal} style={styles.modalButton} />
                        </View>
                    </>
                )}
                {(modalType !== "logout" && modalType !== "delete") && (
                    <View style={styles.modalButtons}>
                        <YesButton text="Save" onPress={handleSave} style={styles.modalButton}/>
                        <NoButton text="Cancel" onPress={closeModal} style={styles.modalButton} />
                    </View>
                )}
            </CustomModal>
        </Container>
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
    deleteOption: {
        backgroundColor: "#FF3B30",
    },
    deleteOptionText: {
        color: "white",
        fontWeight: "bold",
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        paddingHorizontal: 16,
        marginBottom: 8,
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
    info: {
        fontSize: 14,
        textAlign: "left",
        width: "100%",

    },
});
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getItem, saveItem } from "../helper";
import { Header } from "@/components/Header";
import Container from "@/components/Container";
import { CustomModal } from "@/components/Modal";
import { NoButton, StandardButton, WarnButton, YesButton } from "@/components/Buttons";
import StyledTextInput from "@/components/StyledTextInput";
import { FontAwesome } from "@expo/vector-icons";

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
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/getAccountDetails`, {
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
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/updateAccountDetails`, {
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
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/updateAccountPassword`, {
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
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/logout`, {
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
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/deleteAccount`, {
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
            <Header title="Settings" showGoBack={false} icon={<FontAwesome name="cog"/>}/>
            <View style={styles.section}>
                <StandardButton text="Change Details" onPress={() => openModal("details")} style={styles.option}/>
                {!isExternal && (
                    <StandardButton text="Update Password" onPress={() => openModal("password")} style={styles.option}/>
                )}
                <StandardButton text="Logout" onPress={() => openModal("logout")} style={styles.option}/>
                <WarnButton text="Delete Account" onPress={() => openModal("delete")} style={styles.option}/>
            </View>
            <CustomModal
                visible={modalVisible}
                onCancel={closeModal}
                headerText={modalType === "details" ? "Change Details" : modalType === "password" ? "Update Password" : modalType === "logout" ? "Logout" : "Delete Account"}
                infoText={modalType === "delete" ? "Are you sure you want to delete your account? This action cannot be undone." : ""}
            >
                {modalType === "details" && (
                    <>
                        <StyledTextInput
                            label="Last Name"
                            value={formData.lastName}
                            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                        />
                        <StyledTextInput
                            label="First Name"
                            value={formData.firstName}
                            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                        />
                        {!isExternal && (
                            <StyledTextInput
                                label="Email"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                autoCapitalize="none"
                            />
                        )}
                    </>
                )}
                {modalType === "password" && (
                    <>
                        <StyledTextInput
                            label="Old Password"
                            password={true}
                            value={formData.oldPassword}
                            onChangeText={(text) => setFormData({ ...formData, oldPassword: text })}
                        />
                        <StyledTextInput
                            password={true}
                            label="New Password"
                            value={formData.newPassword}
                            onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                        />
                        <StyledTextInput
                            password={true}
                            label="Confirm Password"
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
                            <WarnButton text="Delete" onPress={handleDeleteAccount} style={styles.modalButton}/>
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
    option: {
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
        flex: 0,
    },
    section: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
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
});
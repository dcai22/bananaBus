import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Platform, KeyboardAvoidingView } from "react-native";

export default function TabLayout() {
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -500}
            enabled
        >
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: "white",
                    tabBarInactiveTintColor: "rgba(219, 240, 255, 0.7)",
                    tabBarStyle: {
                        backgroundColor: "#2196F3",
                        height: 65,
                    },
                    tabBarItemStyle: {
                        margin: 0,
                        padding: 0,
                        borderRadius: 0,
                        alignItems: "center",
                        flexDirection: "row",
                    },
                    tabBarLabelPosition: "below-icon",
                    tabBarLabelStyle: {
                        fontSize: 14,
                    },
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                    tabBarVisibilityAnimationConfig: {
                        show: {
                            animation: "timing",
                            config: {
                                duration: 0,
                            },
                        },
                        hide: {
                            animation: "timing",
                            config: {
                                duration: 0,
                            },
                        },
                    },
                }}
                backBehavior="history"
            >
                <Tabs.Screen
                    name="login"
                    options={{
                        href: null,
                        tabBarStyle: { display: "none" },
                    }}
                />
                <Tabs.Screen
                    name="register"
                    options={{
                        href: null,
                        tabBarStyle: { display: "none" },
                    }}
                />
                <Tabs.Screen
                    name="forgotPassword"
                    options={{
                        href: null,
                        tabBarStyle: { display: "none" },
                    }}
                />
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ color }) => (
                            <FontAwesome size={24} name="home" color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="trips"
                    options={{
                        title: "Saved Trips",
                        tabBarIcon: ({ color }) => (
                            <FontAwesome size={24} name="list" color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="deals"
                    options={{
                        title: "Deals",
                        tabBarIcon: ({ color }) => (
                            <FontAwesome size={24} name="tag" color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="account"
                    options={{
                        title: "Account",
                        tabBarIcon: ({ color }) => (
                            <FontAwesome size={24} name="user" color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tripsList"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="booking"
                    options={{
                        href: null,
                        tabBarStyle: { display: "none" },
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="support"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="driverPanel"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="adminPanel"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="driverTrip"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="manageVehicles"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="driverReportProblem"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="pastBookings"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    icons: {
        color: "black",
    },
});

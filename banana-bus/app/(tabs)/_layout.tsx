import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

export default function TabLayout() {
    return (
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
            }}
        >
            {" "}
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
        </Tabs>
    );
}

const styles = StyleSheet.create({
    icons: {
        color: "black",
    },
});

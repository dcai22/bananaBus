import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

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
                },
                tabBarLabelPosition: "below-icon",
                tabBarLabelStyle: {
                    fontSize: 14,
                },
                headerShown: false,
            }}
        >
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
                        <FontAwesome size={24} name="th" color={color} />
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

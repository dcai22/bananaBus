import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Header } from "@/components/Header";
import Container from "@/components/Container";
import { router } from "expo-router";

/**
 * Admin Panel Screen
 * 
 * Provides administrative options for managing various aspects of the application,
 * such as alerts, routes, vehicles, and users. Each option navigates to a specific management screen.
 */
export default function adminPanel() {
	/**
	 * PanelItem Component
	 * 
	 * A reusable component for rendering a clickable panel item with a title.
	 * 
	 * @param title - The title of the panel item.
	 * @param onPress - The function to execute when the panel item is pressed.
	 */
	function PanelItem({ title, onPress }: { title: string; onPress: () => void }) {
		return (
		<TouchableOpacity style={styles.panelItem} onPress={onPress}>
			<Text style={styles.panelItemText}>{title}</Text>
		</TouchableOpacity>
		);
	}

	return (
		<Container>
		{/* Header Component */}
		<Header title="Admin Panel" showGoBack={true} />

		{/* Main Content */}
		<View style={styles.screen}>
			{/* Navigation Options */}
			<PanelItem title="Alerts" onPress={() => router.navigate("/adminAlert")} />
			<PanelItem title="Manage Routes" onPress={() => router.navigate("/manageRoutes")} />
			<PanelItem title="Manage Vehicles" onPress={() => router.navigate("/manageVehicles")} />
			<PanelItem title="Manage Users" onPress={() => router.navigate("/manageUsers")} />
		</View>
		</Container>
	);
}

// Styles for the Admin Panel screen
const styles = StyleSheet.create({
	screen: {
		padding: 20,
	},
	panelItem: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		margin: 10,
		boxShadow: "0px 2px 5px -2px grey",
	},
	panelItemText: {
		fontSize: 20,
		fontWeight: "bold",
	},
});
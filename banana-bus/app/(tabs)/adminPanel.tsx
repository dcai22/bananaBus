import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Header } from "@/components/Header";
import Container from "@/components/Container";
import { router } from "expo-router";

export default function adminPanel() {

  function PanelItem({title, onPress}: {title:string, onPress: () => void}) {
    return(
      <TouchableOpacity style= {styles.panelItem} onPress={onPress}>
        <Text style={styles.panelItemText} >{title}</Text>
      </TouchableOpacity>   
    )
  } 

  return (
    <Container>
      <Header title="Admin Panel" showGoBack={true} />
      <View style={styles.screen}>
        <PanelItem title="Alerts" onPress={() => router.navigate("/adminAlert")}/>
        <PanelItem title="Manage Routes " onPress={() => router.navigate("/manageRoutes")}/>
        <PanelItem title="Manage Vehicles " onPress={() => router.navigate("/manageVehicles")}/>
        <PanelItem title="Manage Users " onPress={() => router.navigate("/manageUsers")}/>
      </View>
    </Container>
  );
}


const styles = StyleSheet.create({
  screen: {
    padding: 20,
  },
  panelItem: {
    backgroundColor: "white",
    padding: 20, borderRadius: 10,
    margin: 10,
    boxShadow: "0px 2px 5px -2px grey"
  },
  panelItemText: {
    fontSize: 20,
    fontWeight: "bold"
  },
});


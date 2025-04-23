import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from "react-native";
import AnimatedDotsCarousel, { DecreasingDot, DotConfig } from "react-native-animated-dots-carousel";
import PromoPage from "@/components/promoComponents/PromoPage";
import PromoModal from "@/components/promoComponents/PromoModal";
import { Promotion } from "@/api/interface";
import axios from "axios";
import { LoadingPage } from "@/components/LoadingPage";
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


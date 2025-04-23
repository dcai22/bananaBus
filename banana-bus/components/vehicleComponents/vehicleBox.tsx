import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Vehicle } from "@/api/interface";

interface VehicleBoxProps {
  vehicle: Vehicle;
  onPress: () => void
}

export default function VehicleBox({vehicle, onPress}: VehicleBoxProps) {

  return(
    <View>
      <TouchableOpacity style={styles.vehicleBoxContainer} onPress={onPress}>
        <View style={styles.infoContainer}>
          <Text style={styles.model}>{vehicle.model}</Text>
          <Text style={styles.numberPlate}>{vehicle.numberPlate}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.variableContainer}>
            <FontAwesome name="user" style={[styles.icon, styles.personIcon]}/>
            <Text style={styles.variableValue}>{vehicle.maxCapacity}</Text>
          </View>
          <View style={styles.variableContainer}>
            <FontAwesome name="suitcase" style={styles.icon}/>
            <Text style={styles.variableValue}>{vehicle.maxLuggageCapacity}</Text>
          </View>
          <View style={styles.variableContainer}>
            <FontAwesome name="wheelchair" style= {[styles.icon, styles.wheelchairIcon]}/>
            {vehicle.hasAssist ? (
              <FontAwesome name="check" size={13}/>
            ): (
              <Text>✖</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  vehicleBoxContainer: {
    flex: 1,
    backgroundColor: "white",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    boxShadow: "0px 2px 5px -2px grey",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoContainer: {
    justifyContent: "space-between"
  },
  model: {
    fontWeight: "bold",
    fontSize: 20
  },
  variableContainer: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 19
  },
  icon: {
    marginRight: 5
  },
  personIcon: {
    marginLeft: 2
  },
  wheelchairIcon: {
    marginLeft: 2
  },
  variableValue: {
    textAlign: "right"
  },
  numberPlate: {
    fontSize: 15
  },
  
});

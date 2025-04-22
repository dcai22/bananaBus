import React, { useEffect, useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from "react-native";
import Modal from "react-native-modal"
import StyledTextInput from "../StyledTextInput";
import { getItem } from "expo-secure-store";
import axios from "axios";
import { Vehicle } from "@/api/interface";

interface addVehicleButtonProps {
  onAddVehicle?: (newVehicle: Vehicle) => void
}

export default function AddVehicleButton({onAddVehicle}: addVehicleButtonProps) {
  const [visible, setVisible] = useState(false)
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [model, setModel] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [luggage, setLuggage] = useState(0);
  const [hasAssist, setHasAssist] = useState(false);

  // reset to default if exiting modal
  useEffect(() => {
    setModel("")
    setNumberPlate("")
    setCapacity(0)
    setLuggage(0)
    setHasAssist(false)
  }, [visible])

  async function handleAdd() {
    const token = await getItem("token");
    /* axios.post("https://banana-bus.vercel.app/manager/addVehicle", 
      {
        maxCapacity: capacity,
        maxLuggageCapacity: luggage,
        hasAssist: hasAssist,
        numberPlate: numberPlate
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      }
    ).then((res) => {
      Alert.alert(`Vehicle ${numberPlate} successfully added`);
      setVisible(false);
      onAddVehicle?.(res.data.vehicles)
    }).catch((err) => {
      setError(err.response.data.error)
    }).finally(() => {
      setLoading(false)
    }) */
    Alert.alert(`Vehicle ${numberPlate} successfully added`);
    setVisible(false)
  };

  return (
    <View>
      <TouchableOpacity style={styles.addBtn} onPress={() => setVisible(true)}>
        <Text style={styles.addBtnText}>+ Add Vehicle</Text>
      </TouchableOpacity>

      <Modal 
        isVisible={visible}
        onBackButtonPress={() => setVisible(false)}
        onBackdropPress={() => setVisible(false)}
      >
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Add Vehicle</Text>
            <StyledTextInput
              label="Model"
              value={model}
              onChangeText={setModel}
            />
            <StyledTextInput
              label="Number Plate"
              value={numberPlate}
              onChangeText={setNumberPlate}
            />
            <StyledTextInput
              label="Max Capacity"
              value={capacity.toString()}
              onChangeText={(text) => {
                setCapacity(parseInt(text.replace(/\D/g, '')))
              }}
              keyboardType="numeric"
            />
            <StyledTextInput
              label="Max Luggage Capacity"
              value={luggage.toString()}
              onChangeText={(text) => {
                setLuggage(parseInt(text.replace(/\D/g, '')))
              }}
              keyboardType="numeric"
            />

            <View style={styles.assistContainer}> 
              <Switch
                value={hasAssist}
                onValueChange={setHasAssist}
                trackColor={{ false: "#d3d3d3", true: "#3399ff" }}
                thumbColor={hasAssist ? "#1e90ff" : "#888888"}
              />
              <Text style={styles.assistText}>Wheelchair Accessible</Text>
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisible(false)}>
                <Text style={{ color: '#2A8AE4' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleAdd}>
                <Text style={{ color: 'white' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
      </Modal>
    </View>


  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: "#2A8AE4",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 10
  },
  addBtnText: {
    fontWeight: "700",
    fontSize: 17,
    color: "white"

  },
  modalContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  assistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  assistText: {
    marginLeft: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: 10,
  },
  modalAddBtn: {
    backgroundColor: '#2A8AE4',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

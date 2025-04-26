import React, { useEffect, useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from "react-native";
import StyledTextInput from "../StyledTextInput";
import { getItem } from "expo-secure-store";
import axios from "axios";
import { Vehicle } from "@/api/interface";
import { LoadingButton, NoButton, YesButton } from "../Buttons";
import { CustomModal } from "../Modal";

interface addVehicleButtonProps {
  onAddVehicle?: (newVehicle: Vehicle) => void
}

/**
 * AddVehicleButton Component
 * 
 * A button that opens a modal for adding a new vehicle. The modal includes fields for vehicle details
 * and a switch for wheelchair accessibility. Upon submission, the new vehicle is added to the list.
 * 
 * Props:
 * - `onAddVehicle` (function): Callback function to handle the addition of a new vehicle.
 * 
 * Example Usage:
 * <AddVehicleButton onAddVehicle={handleNewVehicle} />
 */
export default function AddVehicleButton({onAddVehicle}: addVehicleButtonProps) {
  const [visible, setVisible] = useState(false)
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [model, setModel] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [luggage, setLuggage] = useState("");
  const [hasAssist, setHasAssist] = useState(false);

  // reset to default if exiting modal
  useEffect(() => {
    setModel("")
    setNumberPlate("")
    setCapacity("0")
    setLuggage("0")
    setHasAssist(false)
  }, [visible])

  async function handleAdd() {
    const token = await getItem("token");
    setLoading(true)
    axios.post(`${process.env.EXPO_PUBLIC_API_BASE}/manager/addVehicle`, 
      {
        maxCapacity: parseInt(capacity),
        maxLuggageCapacity: parseInt(luggage),
        hasAssist: hasAssist,
        numberPlate: numberPlate,
        model: model,
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      }
    ).then((res) => {
      Alert.alert(`Vehicle ${numberPlate} successfully added`);
      onAddVehicle?.(res.data)
    }).catch((err) => {
      console.error(err)
      console.error(err.response.data.error)
      Alert.alert(`Error: ${err.response.data.error}`)
      setError(err.response.data.error)
    }).finally(() => {
      setLoading(false)
      setVisible(false);
    })
  };

  function handleModalClose() {
    // prevents closing of modal when adding vehicle
    if (loading) return
    
    setVisible(false)
  }

  return (
    <View>
      <TouchableOpacity style={styles.addBtn} onPress={() => setVisible(true)}>
        <Text style={styles.addBtnText}>+ Add Vehicle</Text>
      </TouchableOpacity>

      <CustomModal 
        visible={visible}
        onCancel={handleModalClose}
      >
        <Text style={styles.title}>Add Vehicle</Text>
        <StyledTextInput
          label="Model"
          value={model}
          onChangeText={setModel}
        />
        <StyledTextInput
          label="Number Plate"
          value={numberPlate}
          onChangeText={(text) => setNumberPlate(text.toUpperCase())}
          maxLength={7}
        />
        <StyledTextInput
          label="Max Capacity"
          value={capacity.toString()}
          onChangeText={(text) => {
            setCapacity(text.replace(/\D/g, ''))
          }}
          keyboardType="numeric"
        />
        <StyledTextInput
          label="Max Luggage Capacity"
          value={luggage.toString()}
          onChangeText={(text) => {
            setLuggage(text.replace(/\D/g, ''))
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
        { loading ? (
          <View style={styles.buttonsContainer}>
            <LoadingButton/>
          </View>
        ): (
          <View style={styles.buttonsContainer}>
            <YesButton text="Add" onPress={handleAdd}/>
            <NoButton text="Cancel" onPress={handleModalClose}/>
          </View>
        )}
      </CustomModal>
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
    justifyContent: 'space-between',
  },
});

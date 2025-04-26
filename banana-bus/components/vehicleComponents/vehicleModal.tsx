import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import Modal from "react-native-modal"
import StyledTextInput from "../StyledTextInput";
import axios from "axios";
import { getItem } from "expo-secure-store";
import { Vehicle } from "@/api/interface";
import { LoadingButton, NoButton, WarnButton, YesButton } from "../Buttons";
import { CustomModal } from "../Modal";

interface VehicleModalProps {
  vehicle: Vehicle,
  visible: boolean,
  setVisible: React.Dispatch<React.SetStateAction<boolean>>,
  onEditVehicle?: (editedVehicle: Vehicle) => void;
  onDeleteVehicle?: (deletedVehicle: Vehicle) => void;
}

/**
 * VehicleModal Component
 * 
 * A modal component that displays vehicle details and allows editing or deleting the vehicle.
 * 
 * Props:
 * - `vehicle` (Vehicle): The vehicle object containing details to display in the modal.
 * - `visible` (boolean): Controls the visibility of the modal.
 * - `setVisible` (function): Callback function to set the visibility of the modal.
 * - `onEditVehicle` (function): Callback function to handle the editing of a vehicle.
 * - `onDeleteVehicle` (function): Callback function to handle the deletion of a vehicle.
 */
export default function VehicleModal({vehicle, visible, setVisible, onEditVehicle, onDeleteVehicle}: VehicleModalProps) {
  const [error, setError] = useState("");

  // delete confirmation modal
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [model, setModel] = useState(vehicle.model);
  const [numberPlate, setNumberPlate] = useState(vehicle.numberPlate);
  const [capacity, setCapacity] = useState(vehicle.maxCapacity.toString());
  const [luggage, setLuggage] = useState(vehicle.maxLuggageCapacity.toString());
  const [hasAssist, setHasAssist] = useState(vehicle.hasAssist);

  const [editMode, setEditMode] = useState(false)
  const [editLoading, setEditLoading] = useState(false);

  // to change modal when another vehicle is selected
  useEffect(() => {
    resetModal()
  }, [vehicle])

  // resets modal variables back to vehicle box info
  function resetModal() {
    setModel(vehicle.model)
    setNumberPlate(vehicle.numberPlate)
    setCapacity(vehicle.maxCapacity.toString())
    setLuggage(vehicle.maxLuggageCapacity.toString())
    setHasAssist(vehicle.hasAssist)
    setEditMode(false)
  }

  async function handleEdit() {
    const token = await getItem("token");
    setEditLoading(true)
    axios.put(`${process.env.EXPO_PUBLIC_API_BASE}/manager/editVehicle`, 
      {
        vehicleId: vehicle._id,
        model: model,
        numberPlate: numberPlate,
        maxCapacity: parseInt(capacity),
        maxLuggageCapacity: parseInt(luggage),
        hasAssist: hasAssist,
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      }
    ).then((res) => {
      Alert.alert(`Vehicle ${numberPlate} successfully edited`);
      onEditVehicle?.(res.data)

    }).catch((err) => {
      console.error(err)
      console.error(err.response.data.error)
      Alert.alert(`Error: ${err.response.data.error}`)
      setError(err.response.data.error)
    }).finally(() => {
      resetModal()
      setVisible(false);
      setEditLoading(false)
    })
  };

  function handleCancelEdit() {
    resetModal()
  }

  function handleClose() {
    if (editLoading) return
    if (editMode) resetModal()
    setVisible(false)
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const token = await getItem("token");
    axios.delete(`${process.env.EXPO_PUBLIC_API_BASE}/manager/deleteVehicle`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      data: {
        vehicleId: vehicle._id,
      }
    }).then((res) => {
      Alert.alert(`Deleted ${vehicle.numberPlate} successfully`)
      onDeleteVehicle?.(vehicle)
    }).catch((err) => {
      console.error(err)
      console.error(err.response.data.error)
      Alert.alert(`Error: ${err.response.data.error}`)
      setError(err.response.data.error)
    }).finally(() => {
      setDeleteLoading(false)
      setConfirmDeleteVisible(false)
      setVisible(false)
    })
    
  }

  function handleDeleteClose() {
    if (deleteLoading) return
    setConfirmDeleteVisible(false)
  }

  return (
    <View>
      <CustomModal
        visible={visible}
        onCancel={handleClose}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Vehicle Details</Text>
          { !editMode &&
            <YesButton
              text="Edit"
              onPress={() => setEditMode(true)}
            />
          }
        </View>
        <StyledTextInput
          label="Model"
          value={model}
          onChangeText={setModel}
          readOnly={!editMode}
        />
        <StyledTextInput
          label="Number Plate"
          value={numberPlate}
          onChangeText={setNumberPlate}
          readOnly={!editMode}
        />
        <StyledTextInput
          label="Max Capacity"
          value={capacity.toString()}
          onChangeText={(text) => {
            setCapacity(text.replace(/\D/g, ""))
          }}
          keyboardType="numeric"
          readOnly={!editMode}
        />
        <StyledTextInput
          label="Max Luggage Capacity"
          value={luggage.toString()}
          onChangeText={(text) => {
            setLuggage(text.replace(/\D/g, ""))
          }}
          keyboardType="numeric"
          readOnly={!editMode}
        />
        <View style={styles.assistContainer}> 
          <Switch
            value={hasAssist}
            onValueChange={setHasAssist}
            trackColor={{ false: "#d3d3d3", true: "#3399ff" }}
            thumbColor={hasAssist ? "#1e90ff" : "#888888"}
            disabled={!editMode}
          />
          <Text style={styles.assistText}>Wheelchair Accessible</Text>
        </View>

        {/* Buttons at the Bottom of Modal*/}
        { editMode ? (
            editLoading ? (
              <View style={styles.buttonsContainer}>
                <LoadingButton/>
              </View>
            ): (
              <View style={styles.buttonsContainer}>
                <YesButton
                  text="Save"
                  onPress={handleEdit}
                />
                <NoButton
                  text="Cancel"
                  onPress={handleCancelEdit}
                />
              </View>
            )
        ): (
          <View style={styles.buttonsContainer}>
            <WarnButton
              text="Delete"
              onPress={() => setConfirmDeleteVisible(true)}
            />
            <NoButton
              text="Close"
              onPress={handleClose}
            />
          </View>
        )}
      </CustomModal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isVisible={confirmDeleteVisible}
        onBackButtonPress={handleDeleteClose}
        onBackdropPress={handleDeleteClose}
      >
        <View style={styles.confirmModal}>
          <Text style={styles.confirmTitle}>Delete Vehicle</Text>
          <Text style={styles.confirmQuestion}>
            Are you sure you want to delete vehicle "{vehicle.model}({vehicle.numberPlate})"?
          </Text>
          <Text style={styles.confirmUndone}>
            This action cannot be undone.
          </Text>
          { deleteLoading ? (
            <View style={styles.buttonsContainer}>
              <LoadingButton/>
            </View>
          ): (
            <View style={styles.buttonsContainer}>
              <WarnButton
                text="Delete"
                onPress={handleDelete}
              />
              <NoButton
                text="Cancel"
                onPress={handleDeleteClose}
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  assistContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 10,
  },
  assistText: {
    marginLeft: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmModal: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
  },
  confirmTitle: {
    fontSize: 25,
    fontWeight: "bold",
    padding: 10,
  },
  confirmQuestion: {
    margin: 10,
    marginTop: 0,
    fontSize: 20
  },
  confirmUndone: {
    textAlign: "center",
    marginBottom: 10
  }
})
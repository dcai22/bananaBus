import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Modal from "react-native-modal"
import StyledTextInput from "../StyledTextInput";
import axios from "axios";
import { getItem } from "expo-secure-store";
import { Vehicle } from "@/api/interface";

interface VehicleBoxProps {
  vehicle: Vehicle;
  onEditVehicle?: (editedVehicle: Vehicle) => void;
  onDeleteVehicle?: (deletedVehicle: Vehicle) => void;
}

export default function VehicleBox({vehicle, onEditVehicle, onDeleteVehicle}: VehicleBoxProps) {
  const [error, setError] = useState("");
  
  // Vehicle Info for Modal
  const [model, setModel] = useState(vehicle.model);
  const [numberPlate, setNumberPlate] = useState(vehicle.numberPlate);
  const [capacity, setCapacity] = useState(vehicle.maxCapacity);
  const [luggage, setLuggage] = useState(vehicle.maxLuggageCapacity);
  const [hasAssist, setHasAssist] = useState(vehicle.hasAssist);
  const [visible, setVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editLoading, setEditLoading] = useState(false);
  
  // delete confirmation modal
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function resetModal() {
    // resets modal variables back to vehicle box info
    setModel(vehicle.model)
    setNumberPlate(vehicle.numberPlate)
    setCapacity(vehicle.maxCapacity)
    setLuggage(vehicle.maxLuggageCapacity)
    setHasAssist(vehicle.hasAssist)
    setEditMode(false)
  }


  async function handleEdit() {
    const token = await getItem("token");
    setEditLoading(true)
    axios.put("https://banana-bus.vercel.app/manager/editVehicle", 
      {
        vehicleId: vehicle._id,
        model: model,
        numberPlate: numberPlate,
        maxCapacity: capacity,
        maxLuggageCapacity: luggage,
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
      setError(err.response.data.error)
    }).finally(() => {
      setEditMode(false);
      setVisible(false);
      setEditLoading(false)
    })
  };

  function handleCancelEdit() {
    resetModal()
    setEditMode(false)
  }

  function handleClose() {
    if (editLoading) return
    if (editMode) resetModal()
    setVisible(false)
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const token = await getItem("token");
    axios.delete("https://banana-bus.vercel.app/manager/deleteVehicle", {
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

  return(
    <View>
      <TouchableOpacity style={styles.vehicleBoxContainer} onPress={() => setVisible(true)}>
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
            {hasAssist ? (
              <FontAwesome name="check" size={13}/>
            ): (
              <Text>✖</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Vehicle Detail Modal */}
      <Modal
        isVisible={visible}
        onBackButtonPress={handleClose}
        onBackdropPress={handleClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Vehicle Details</Text>
            { !editMode &&
              <TouchableOpacity style={[styles.minimalBtn, {marginLeft: 10}]} onPress={()=> setEditMode(true)}>
                <Text style={styles.minimalBtnText}>Edit</Text>
              </TouchableOpacity>
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
              setCapacity(parseInt(text.replace(/\D/g, "")))
            }}
            keyboardType="numeric"
            readOnly={!editMode}
          />
          <StyledTextInput
            label="Max Luggage Capacity"
            value={luggage.toString()}
            onChangeText={(text) => {
              setLuggage(parseInt(text.replace(/\D/g, "")))
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
                  <TouchableOpacity style={styles.standardBtn} disabled={true}>
                    <ActivityIndicator size="small" color="white"/>
                  </TouchableOpacity>
                </View>
              ): (
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity style={styles.minimalBtn} onPress={handleCancelEdit}>
                    <Text style={styles.minimalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.standardBtn} onPress={handleEdit}>
                    <Text style={styles.standardBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              )
          ): (
            <View style={[styles.buttonsContainer, styles.spaceBtns]}>
              <TouchableOpacity style={[styles.standardBtn, styles.deleteBtn]} onPress={() => setConfirmDeleteVisible(true)}>
                <Text style={styles.standardBtnText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.standardBtn} onPress={()=>  setVisible(false)}>
                <Text style={styles.standardBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
      
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
              <TouchableOpacity style={[styles.standardBtn, styles.deleteBtn]} onPress={handleDelete}>
                <ActivityIndicator size="small" color="white"/>
              </TouchableOpacity>
            </View>
          ): (
            <View style={[styles.buttonsContainer, styles.spaceBtns]}>
              <TouchableOpacity style={styles.standardBtn} onPress={() => setConfirmDeleteVisible(false)}>
                <Text style={styles.standardBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.standardBtn, styles.deleteBtn]} onPress={handleDelete}>
                <Text style={styles.standardBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
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
  modalContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalHeader: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
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
    padding: 10,
    justifyContent: "flex-end",
  },
  spaceBtns: {
    justifyContent: "space-between",
  },
  minimalBtn: {
    padding: 10,
  },
  minimalBtnText: {
    color: "#2563EB" 
  },
  standardBtn: {
    backgroundColor: "#2A8AE4",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  standardBtnText: {
    color: "white"
  },
  deleteBtn: {
    backgroundColor: "red",
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
});

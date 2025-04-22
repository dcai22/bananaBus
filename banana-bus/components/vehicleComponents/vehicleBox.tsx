import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Modal from "react-native-modal"
import StyledTextInput from "../StyledTextInput";
import axios from "axios";
import { getItem } from "expo-secure-store";
import { Vehicle } from "@/api/interface";

export default function VehicleBox({vehicle}: {vehicle:  Vehicle}) {
  const [deleted, setDeleted] = useState(false);
  const [editMode, setEditMode] = useState(false)
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Vehicle Info for Vehicle Box
  const [model, setModel] = useState(vehicle.model);
  const [numberPlate, setNumberPlate] = useState(vehicle.numberPlate);
  const [capacity, setCapacity] = useState(vehicle.maxCapacity);
  const [luggage, setLuggage] = useState(vehicle.maxLuggageCapacity);
  const [hasAssist, setHasAssist] = useState(vehicle.hasAssist);
  
  // Vehicle Info for Modal
  const [visible, setVisible] = useState(false)
  const [editModel, setEditModel] = useState(vehicle.model);
  const [editNumberPlate, setEditNumberPlate] = useState(vehicle.numberPlate);
  const [editCapacity, setEditCapacity] = useState(vehicle.maxCapacity);
  const [editLuggage, setEditLuggage] = useState(vehicle.maxLuggageCapacity);
  const [editHasAssist, setEditHasAssist] = useState(vehicle.hasAssist);

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  function resetModal() {
    // resets modal variables back to vehicle box info
    setEditModel(model)
    setEditNumberPlate(numberPlate)
    setEditCapacity(capacity)
    setEditLuggage(luggage)
    setEditHasAssist(hasAssist)
    setEditMode(false)
  }


  async function handleEdit() {
    const token = await getItem("token");
    /* setLoading(true)
    axios.put("https://banana-bus.vercel.app/manager/editVehicle", 
      {
        vehicleId: vehicle._id,
        model: editModel,
        numberPlate: editNumberPlate,
        maxCapacity: editCapacity,
        maxLuggageCapacity: editLuggage,
        hasAssist: editHasAssist,
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      }
    ).then(() => {
      // set locally (dont need to refetch)
      setModel(editModel);
      setNumberPlate(editNumberPlate);
      setCapacity(editCapacity);
      setLuggage(editLuggage);
      setHasAssist(editHasAssist);
      setEditMode(false);
      setVisible(false);

    }).catch((err) => {
      setError(err.response.data.error)
    }).finally(() => {
      setLoading(false)
    }) */

    // set locally (dont need to refetch)
    setModel(editModel)
    setNumberPlate(editNumberPlate)
    setCapacity(editCapacity)
    setLuggage(editLuggage)
    setHasAssist(editHasAssist)

    setEditMode(false)
    setVisible(false)
  };

  function handleCancelEdit() {
    resetModal()
    setEditMode(false)
  }

  function handleClose() {
    if (editMode) resetModal()
    setVisible(false)
  }

  async function handleDelete() {
    /* const token = await getItem("token");
    axios.delete("https://banana-bus.vercel.app/manager/deleteVehicle", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      data: {
        vehicleId: vehicle._id,
      }
    }).catch((err) => {
      setError(err.response.data.error)
    }).finally(() => {
      setLoading(false)
      setDeleted(true)
    }) */
   Alert.alert(`Deleted ${vehicle.numberPlate} successfully`)
   setConfirmDeleteVisible(false)
   setVisible(false)
  }

  if (deleted) {
    return null
  }


  return(
    <View>
      <TouchableOpacity style={styles.vehicleBoxContainer} onPress={() => setVisible(true)}>
        <View style={styles.infoContainer}>
          <Text style={styles.model}>{model}</Text>
          <Text style={styles.numberPlate}>{numberPlate}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.variableContainer}>
            <FontAwesome name="user" style={[styles.icon, styles.personIcon]}/>
            <Text style={styles.variableValue}>{capacity}</Text>
          </View>
          <View style={styles.variableContainer}>
            <FontAwesome name="suitcase" style={styles.icon}/>
            <Text style={styles.variableValue}>{luggage}</Text>
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
            value={editModel}
            onChangeText={setEditModel}
            readOnly={!editMode}
          />
          <StyledTextInput
            label="Number Plate"
            value={editNumberPlate}
            onChangeText={setEditNumberPlate}
            readOnly={!editMode}
          />
          <StyledTextInput
            label="Max Capacity"
            value={editCapacity.toString()}
            onChangeText={(text) => {
              setEditCapacity(parseInt(text.replace(/\D/g, "")))
            }}
            keyboardType="numeric"
            readOnly={!editMode}
          />
          <StyledTextInput
            label="Max Luggage Capacity"
            value={editLuggage.toString()}
            onChangeText={(text) => {
              setEditLuggage(parseInt(text.replace(/\D/g, "")))
            }}
            keyboardType="numeric"
            readOnly={!editMode}
          />
          <View style={styles.assistContainer}> 
            <Switch
              value={editHasAssist}
              onValueChange={setEditHasAssist}
              trackColor={{ false: "#d3d3d3", true: "#3399ff" }}
              thumbColor={editHasAssist ? "#1e90ff" : "#888888"}
              disabled={!editMode}
            />
            <Text style={styles.assistText}>Wheelchair Accessible</Text>
          </View>

          {/* Buttons at the Bottom of Modal*/}
          { editMode ? (
            <View>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.minimalBtn} onPress={handleCancelEdit}>
                  <Text style={styles.minimalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.standardBtn} onPress={handleEdit}>
                  <Text style={styles.standardBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ): (
            <View>
              <View style={[styles.buttonsContainer, styles.spaceBtns]}>
                <TouchableOpacity style={[styles.standardBtn, styles.deleteBtn]} onPress={() => setConfirmDeleteVisible(true)}>
                  <Text style={styles.standardBtnText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.standardBtn} onPress={()=>  setVisible(false)}>
                  <Text style={styles.standardBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isVisible={confirmDeleteVisible}
        onBackButtonPress={() => setConfirmDeleteVisible(false)}
        onBackdropPress={() => setConfirmDeleteVisible(false)}
      >
        <View style={styles.confirmModal}>
          <Text style={styles.confirmTitle}>Delete Vehicle</Text>
          <Text style={styles.confirmQuestion}>
            Are you sure you want to delete vehicle "{model}({numberPlate})"?
          </Text>
          <Text style={styles.confirmUndone}>
            This action cannot be undone.
          </Text>
          <View style={[styles.buttonsContainer, styles.spaceBtns]}>
            <TouchableOpacity style={styles.standardBtn} onPress={() => setConfirmDeleteVisible(false)}>
              <Text style={styles.standardBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.standardBtn, styles.deleteBtn]} onPress={handleDelete}>
              <Text style={styles.standardBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
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

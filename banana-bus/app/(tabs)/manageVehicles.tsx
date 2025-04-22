import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, TextInput } from "react-native";
import { Header } from "@/components/Header";
import Container from "@/components/Container";

import AddVehicleButton from "@/components/vehicleComponents/addVehicleButton";
import VehicleBox from "@/components/vehicleComponents/vehicleBox";
import { getItem } from "expo-secure-store";
import axios from "axios";
import { Vehicle } from "@/api/interface";

export default function manageVehicles() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // TODO: replace with backend fetch
  // using mock data 
  const [vehicles, setVehicles] = useState(vs);
  const [searchResult, setSearchResult] = useState(vs);
  const [search, setSearch] = useState('');


  /* useEffect(() => {
    const fetchData = async () => {
        const token = await getItem("token");
        setLoading(true)
        axios.get("https://banana-bus.vercel.app/manager/getVehicles", {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        }).then((res) => {
            setVehicles(res.data.Vehicles)
            setSearchResult(res.data.Vehicles)
        }).catch((err) => {
            setError(err.response.data.error)
        }).finally(() => {
            setLoading(false)
        })
    }
    fetchData();
  }, []) */


  useEffect(() => {
    const filtered = vehicles.filter(v =>
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.numberPlate.toLowerCase().includes(search.toLowerCase())
    );
    setSearchResult(filtered);
  }, [search, vehicles]);

  return (
    <Container>
      <Header title="Vehicles" showGoBack={true} style={styles.header}/>
      <View style={styles.screen}>
        <View style={styles.searchAndAddContainer}>
          <TextInput
            placeholder="Search by model or plate..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
          />
          <AddVehicleButton
            onAddVehicle={(newVehicle) => {
              //adds vehicle to state rather than refetch
              setVehicles(prev => [...prev, newVehicle])
            }}
          />
        </View>
        <View style ={styles.listContainer}>
          <FlatList
            data={searchResult}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <VehicleBox vehicle={item} />}
            ListEmptyComponent={
            <View style= {styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No vehicles found</Text>
            </View>
            }
          />
        </View>
      </View>
    </Container>
  );
}


const styles = StyleSheet.create({
  header: {
    marginBottom: 0,
  },
  screen: {
    padding:20,
    flex: 1
  },
  searchAndAddContainer: {
    flexDirection: "row",
    marginBottom: 20
  },
  searchBar: {
    flex: 1, backgroundColor: "white",
    fontWeight: "700",
    padding: 10,
    borderRadius: 10,
    fontSize: 17,
    borderColor: "#ccc",
    borderWidth: 1
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#ccddeb",
    padding: 10,
    borderRadius: 10
  },
  emptyListContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyListText: {
    fontSize: 20, 
    fontWeight: "bold"
  }
});

// mock data
const vs = [
  {
    _id: "123",
    maxCapacity: 20,
    maxLuggageCapacity: 20,
    hasAssist: true,
    model: "Toyota",
    numberPlate: "abc123"
  },
  {
    _id: "124",
    maxCapacity: 22,
    maxLuggageCapacity: 34,
    hasAssist: false,
    model: "Audi",
    numberPlate: "123abc"
  },
  {
    _id: "121",
    maxCapacity: 20,
    maxLuggageCapacity: 20,
    hasAssist: true,
    model: "Ford",
    numberPlate: "pesadnsadsagufain"
  },
  {
    _id: "1232",
    maxCapacity: 20,
    maxLuggageCapacity: 20,
    hasAssist: true,
    model: "Fordd",
    numberPlate: "pedsadnguin"
  },
  {
    _id: "121222",
    maxCapacity: 201,
    maxLuggageCapacity: 20,
    hasAssist: true,
    model: "Fordd",
    numberPlate: "pdsadenguin"
  },
  {
    _id: "1212223",
    maxCapacity: 20,
    maxLuggageCapacity: 201,
    hasAssist: true,
    model: "Forsddd",
    numberPlate: "psad"
  },
]
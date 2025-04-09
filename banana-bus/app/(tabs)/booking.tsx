import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { View, Text, StyleSheet, Touchable, TouchableOpacity, TextInput, ScrollView, Dimensions, Image, Alert} from "react-native";
import { format } from "date-fns"
import TripListBox from "@/components/TripListBox";
import { useEffect, useState } from "react";
import axios from "axios";
import { TripBox } from "@/server/interface";
import { LoadingPage } from "@/components/LoadingPage";

// TODO: fix up stack/tabs so router back works properly

// sample trip until backend is created
const now = new Date()

const trip: TripBox = {
    tripId: 1,
    departureTime: new Date(now.getTime() + 30 * 60 * 1000),
    arrivalTime: new Date(now.getTime() + 2 *30 * 60 * 1000),
    price: 20,
    curCapacity: 14, 
    maxCapacity: 20,
    curLuggageCapacity: 5,
    maxLuggageCapacity: 10,
    luggagePrice: 10,
    disability: true, 
}

export default function booking() {
    const { departId, arriveId, tripId } = useLocalSearchParams<{departId: string; arriveId: string, tripId: string}>()
    const [ numPassenger, setNumPassenger ] = useState<number>(0)
    const [ numLuggage, setNumLuggage ] = useState<number>(0)

    const [loading, setLoading] = useState("");
    const [error, setError] = useState("")
    const [departName, setDepartName] = useState("airport");
    const [arriveName, setArriveName] = useState("utama mall");
    const [defaultCard, setDefaultCard] = useState({cardId: 1, type: "Mastercard", lastFour: "1234"})
    
    const navigation = useNavigation();
    // const [trip, setTrip] = useState<TripBox>();

    // TODO: backend to retrieve trip and card details
    /* useEffect(() => {
        setLoading(true)
        axios.get("http://localhost:3000/booking", {
            params: {
                tripId,
            }
        }).then((res) => {
            setDepartName(res.data.departName)
            setArriveName(res.data.arriveName)
            setTrip(res.data.trip)
        }).catch((err) => {
            console.log(err.response.data.error);
            console.log(err.response.status);
            setError(err.response.data.error)
        }).finally(() => {
            setLoading(false)
        })
    }, []) */

    function CheckoutHeader() {
        return(
            <View style= {styles.header}>
                <View style={styles.goBackContainer}>
                    <FontAwesome name="arrow-left" style = {styles.goBackArrow} onPress={() => router.back()}/>
                    <Text style = {styles.goBackText} onPress={() => router.back()}>go back</Text>
                </View>
                <Text style ={styles.headerText}>Secure Checkout</Text>
            </View>
        )
    }

    if (loading) {
        return(
            <View style={styles.screen}>
                <CheckoutHeader/>
                <LoadingPage/>
            </View>
        )
    }

    // make nicer or pop up
    if (error) {
        return(
            <Text>{error}</Text>
        )
    }    

    const maxTickets = trip.maxCapacity - trip.curCapacity

    function handlePassengerIncrease() {
        setNumPassenger(num => (num < maxTickets ? num + 1 : num))
    }

    function handlePassengerDecrease() {
        setNumPassenger(num => (num > 0 ? num - 1 : num))
    }

    const maxLuggage = trip.maxLuggageCapacity - trip.curLuggageCapacity

    function handleLuggageIncrease() {
        setNumLuggage(num => (num < maxLuggage ? num + 1 : num))
    }

    function handleLuggageDecrease() {
        setNumLuggage(num => (num > 0 ? num - 1 : num))
    }

    function totalPrice() {
        return (numPassenger * trip.price) + (numLuggage * trip.luggagePrice)
    }

    // TODO: API calls to backend or navigate to new routes
    function handleSelectSeat() {
    
    }

    function handleCardChange() {

    }
    
    async function handleCheckout() {
        // TODO: handle payment

        try {
            const res = await fetch('https://banana-bus.vercel.app/createBooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, tripId, departId, arriveId, numTickets: numPassenger }),
            });

            if (res.ok) {
                const data = await res.json();

                console.log(`Created booking with id ${data.insertedId}`);

                navigation.navigate("index");
            } else {
                const errorData = await res.json();
                Alert.alert('Error', errorData.error || 'Booking failed');
            }
        } catch (err) {
            Alert.alert('Error', 'An error occurred. Please try again.');
        }
    }


    return(
        <View style={styles.screen}>
            <CheckoutHeader/>
            <ScrollView style={styles.checkoutInfo}>
                <View style={styles.tripDetails}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>Trip Summary for </Text>
                        <Text style={styles.dateText}>{format(trip.departureTime, "E, do LLL y")}</Text>
                    </View>
                    <View style={styles.stopsContainer}>
                        <View style={styles.departContainer}>
                            <FontAwesome name="arrow-left" style={styles.stopsArrow}/>
                            <Text style={styles.stopsText}>{departName}</Text>
                        </View>
                        <View style={styles.arriveContainer}>
                        <FontAwesome name="arrow-right" style={styles.stopsArrow}/>
                            <Text style={styles.stopsText}>{arriveName}</Text>
                        </View>
                    </View>
                    <View style= {styles.tripBoxContainer}>
                        <TripListBox trip={trip}/>
                    </View>
                    <View style={styles.optionsContainer}>
                        <Text style={styles.optionsText}>Add Passengers</Text>
                        <View style={styles.incrementContainer}>
                            <TouchableOpacity onPress={handlePassengerDecrease}>
                                <FontAwesome name="minus" style={styles.increment}/>
                            </TouchableOpacity >
                            <Text style = {styles.incrementNum}>{numPassenger}</Text>
                            <TouchableOpacity onPress={handlePassengerIncrease}>
                                <FontAwesome name="plus" style={styles.increment}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.optionsContainer}>
                        <Text style={styles.optionsText}>Add Luggage</Text>
                        <View style={styles.incrementContainer}>
                            <TouchableOpacity onPress={handleLuggageDecrease}>
                                <FontAwesome name="minus" style={styles.increment}/>
                            </TouchableOpacity>
                            <Text style = {styles.incrementNum}>{numLuggage}</Text>
                            <TouchableOpacity onPress={handleLuggageIncrease}>
                                <FontAwesome name="plus" style={styles.increment}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.optionsContainer}>
                        <Text style={styles.optionsText}>Select Seats</Text>
                        <TouchableOpacity style={styles.seatsButton} onPress={handleSelectSeat}>
                            <FontAwesome name="arrow-right" style={styles.seatsArrow}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.optionsContainer}>
                        <Text style={styles.optionsText}>Promo Code</Text>
                        {/* to implement functionality*/}
                        <TextInput style={styles.promoInput}></TextInput>
                    </View>
                    <View style={styles.totalContainer}>
                        <Text style={styles.optionsText}>Total</Text>
                        <Text style={styles.optionsText}>RM {totalPrice()}</Text>
                    </View>
                </View>

                <View style={styles.paymentContainer}>
                    <View style = {styles.cardContainer}>
                        {/* maybe move to a component */}
                        <View style={styles.cardIcon}>
                            <View style={styles.typeIcon}>
                                {/* checking card type. could be function*/}
                                { defaultCard.type === "Mastercard" &&
                                    <Image 
                                        source={require("../../assets/images/mastercard.png")}
                                        style={styles.typeImage}
                                    />
                                }
                            </View> 
                        </View>
                        <View style={styles.cardInfoContainer}>
                            <Text style={styles.cardType}>
                                {defaultCard.type}
                            </Text>
                            <Text>
                                ending in {defaultCard.lastFour}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style= {styles.cardChangeButton} onPress={handleCardChange}>
                        <Text style= {styles.cardChangeText}>Change</Text>
                    </TouchableOpacity>
                </View> 
            </ScrollView>

            <View style= {styles.checkoutBar}>
                <Text style= {styles.checkoutTotal}>Total: RM {totalPrice()}</Text>
                <TouchableOpacity style={styles.checkoutButton}>
                    <Text style= {styles.checkoutText} onPress={handleCheckout}>Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        height: "100%",
        backgroundColor: "lightblue",
    },
    header: {
        backgroundColor: "#060c40",
        height: "10%",
        padding: 20,
        boxShadow: "0px 0px 5px grey",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    goBackContainer: {
        height: "100%",
        flexDirection: "row",
    },
    goBackArrow: {
        paddingTop: 5,
        color: "#009cff",
        fontSize: 20,
    },
    goBackText: {   
        fontWeight: "bold",
        fontSize: 20,
        color: "#009cff",
        paddingLeft: 10,
    },
    headerText: {
        color: "white",
        fontSize: 22,
        alignContent: "center"
    },
    checkoutInfo: {
        padding: 20,
    },
    tripDetails: {
        backgroundColor: "white",
        borderRadius: 10,
        boxShadow: "0px 2px 5px -2px grey",
        padding: 5,
        marginBottom: 20
    },
    dateContainer: {
        padding: 15,
    },
    dateText: {
        fontSize: 25,
        fontWeight: "bold"
    },
    stopsContainer: {
        paddingHorizontal: 15,
    },
    departContainer:{
        flexDirection: "row",
    },
    stopsArrow: {
        color: "#009cff",
        fontSize: 15,
        paddingTop: 3,
    },
    stopsText: {
        color: "#009cff",
        fontSize: 15,
        paddingLeft: 5,
    },
    arriveContainer:{
        flexDirection: "row",
    },
    tripBoxContainer: {
        padding: 15,
    },
    optionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopColor: "lightgrey",
        borderTopWidth: 1,
        padding: 15
    },
    optionsText: {
        fontSize: 15,
        fontWeight: "600",
    },
    incrementContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    increment: {
        color: "#2095ec",
        paddingHorizontal: 5,
        paddingTop: 2,
    },
    incrementNum: {
        backgroundColor: "#e0f4ff",
        color: "#2095ec",
        fontWeight:"bold",
        paddingHorizontal: 10
    },
    seatsButton: {
        justifyContent: "center",
        paddingHorizontal: 5,
    },
    seatsArrow:{
        fontSize: 15,
        color: "#2095ec",
    },
    promoInput: {
        backgroundColor: "#e0f4ff",
        padding: 3,
        width: 100,
        borderRadius: 3,
        borderBottomColor: "#2095ec",
        borderBottomWidth: 1,
    },
    totalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopColor: "black",
        borderTopWidth: 1,
        padding: 15,
    },
    paymentContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        boxShadow: "0px 2px 5px -2px grey",
        flexDirection: "row",
        paddingVertical: 15,
        paddingHorizontal: 20, 
        justifyContent: "space-between",
    },
    cardContainer: {
        flexDirection: "row"
    },
    cardIcon: {
        backgroundColor: "grey",
        width: 80,
        height: 60,
        borderRadius: 15
    },
    typeIcon: {
        position: "absolute",
        bottom: 10,
        right: 10,
    },
    typeImage: {
        width:25, 
        height: 20,
    },
    cardInfoContainer: {
        paddingLeft: 7, justifyContent: "flex-end"
    },
    cardType: {
        fontWeight:"500",
    },
    cardChangeButton:{
        justifyContent: "center"
    },
    cardChangeText: {
        fontWeight: "bold",
        color: "#2a8cdf"
    },
    checkoutBar: {
        backgroundColor: "#042C5C",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 15,
        flexDirection: "row" 
    },
    checkoutTotal: {
        color: "white",
        fontWeight:"bold",
        fontSize: 20,
    },
    checkoutButton: {
        backgroundColor: "#009cff",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    },
    checkoutText:{
        color: "white",
        fontWeight:"bold",
        fontSize: 20
    }
});
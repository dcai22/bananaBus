import React, { useCallback } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator} from "react-native";
import { format } from "date-fns"
import TripListBox from "@/components/TripListBox";
import { useEffect, useState } from "react";
import axios from "axios";
import { TripBox } from "@/api/interface";
import { LoadingPage } from "@/components/LoadingPage";
import { getItem } from "../helper";
import Container from "@/components/Container";
import { CheckoutHeader } from "@/components/Header";
import { initStripe, useStripe } from "@stripe/stripe-react-native";
import { API_BASE, STRIPE_PUBLISHABLE_KEY } from '@env';

// TODO: fix up stack/tabs so router back works properly

export default function booking() {
    const { departId, arriveId, tripId } = useLocalSearchParams<{departId: string; arriveId: string, tripId: string}>()
    const [ numPassenger, setNumPassenger ] = useState<number>(0)
    const [ numLuggage, setNumLuggage ] = useState<number>(0)
    const [trip, setTrip] = useState<TripBox>();

    const [refresh, setRefresh] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [departName, setDepartName] = useState("");
    const [arriveName, setArriveName] = useState("");
    const [defaultCard, setDefaultCard] = useState({cardId: 1, type: "Mastercard", lastFour: "1234"});
    
    const [isCheckout, setIsCheckout] = useState(false);

    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [totalPrice, setTotalPrice] = useState(0);

    const router = useRouter();
    
    // TODO: backend to retrieve card details
    
    useFocusEffect(
         useCallback(() => { 
            setRefresh(true)
            // Makes sure to reload page upon leaving page
            return () => {
                setLoading(true)
                setNumPassenger(0)
                setNumLuggage(0)
            };
        }, [])
    )

    useEffect(() => {
        if (!trip) {
            setTotalPrice(0)
            return;
        }
        setTotalPrice(numPassenger * trip.price + numLuggage * trip.luggagePrice);
    }, [numPassenger, numLuggage, trip, isCheckout]);

    useEffect(() => {
        if (!refresh) return
        const fetchData = async () => {
            const token = await getItem("token");
            setLoading(true)
            axios.get(`${API_BASE}/getTrip`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                params: {
                    departId,
                    arriveId,
                    tripId
                }
            }).then((res) => {
                setDepartName(res.data.departName)
                setArriveName(res.data.arriveName)
                setTrip(res.data.trip)
            }).catch((err) => {
                setError(err.response.data.error)
            }).finally(() => {
                setLoading(false)
                setRefresh(false)
            })
        }

        fetchData();
    }, [tripId, departId, arriveId, refresh])

    useEffect(() => {
        async function initialise() {
            await initStripe({
                publishableKey: STRIPE_PUBLISHABLE_KEY,
            });
        }
        initialise();
    })

    if (loading) {
        return(
            <Container>
                <CheckoutHeader/>
                <LoadingPage/>
            </Container>
        )
    }

    // make nicer or pop up
    if (error) {
        return(
            <Text>Error:{error}</Text>
        )
    }    
    
    if(!trip) {
        return (
            <Text> Trip not found</Text>
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

    // TODO: API calls to backend or navigate to new routes
    function handleSelectSeat() {
    
    }

    function handleCardChange() {

    }

    async function fetchPaymentSheetParams() {
        const token = await getItem("token");
        const price = totalPrice * 100;
        try {
            const response = await fetch(`${API_BASE}/createPaymentDetails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ price }),
            });
            const { paymentIntent, ephemeralKey, customer } = await response.json();
            return {
                paymentIntent,
                ephemeralKey,
                customer,
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function initialisePaymentSheet() {
        const paymentSheetParams = await fetchPaymentSheetParams();
        if (!paymentSheetParams) {
            console.error("Failed to fetch payment sheet parameters");
            return;
        }
        const { paymentIntent, ephemeralKey, customer } = paymentSheetParams;

        const { error } = await initPaymentSheet({
            merchantDisplayName: 'Banana Bus',
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,
            allowsDelayedPaymentMethods: true, 
        })
    }
    
    async function handleCheckout() {
        if (numPassenger === 0) {
            Alert.alert("Please select at least 1 passenger");
            return
        }
        setIsCheckout(true)
        await initialisePaymentSheet();

        const { error } = await presentPaymentSheet();

        if (error) {
            setIsCheckout(false)
            return;
        } else {
            const token = await getItem("token");
            try {
                const res = await fetch(`${API_BASE}/createBooking`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ token, tripId, originId: departId, destId: arriveId, numTickets: numPassenger, numLuggage }),
                });
    
                if (res.ok) {
                    const data = await res.json();
                    setIsCheckout(false);
                    // console.log(`Created booking with id ${data.insertedId}`);
                    // TODO probably change to something better
                    Alert.alert("Booking confirmed");
                    router.navigate("/(tabs)");
                } else {
                    setIsCheckout(false);
                    const errorData = await res.json();
                    Alert.alert('Error', errorData.error || 'Booking failed');
                }
            } catch (err) {
                Alert.alert('Error', 'An error occurred. Please try again.');
                setIsCheckout(false);
            }
        }
    }


    return(
        <Container>
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
                        <Text style={styles.optionsText}>Promo Code</Text>
                        {/* to implement functionality*/}
                        <TextInput style={styles.promoInput}></TextInput>
                    </View>
                    <View style={styles.totalContainer}>
                        <Text style={styles.optionsText}>Total</Text>
                        <Text style={styles.optionsText}>RM {totalPrice}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style= {styles.checkoutBar}>
                <Text style= {styles.checkoutTotal}>Total: RM {totalPrice}</Text>
                <TouchableOpacity style={styles.checkoutButton} disabled={isCheckout || numPassenger === 0}>
                    {isCheckout ? (
                        <ActivityIndicator size="small" color="white"/>
                    ): (
                        <Text style= {styles.checkoutText} onPress={handleCheckout}>Checkout</Text>
                    )}
                </TouchableOpacity>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
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
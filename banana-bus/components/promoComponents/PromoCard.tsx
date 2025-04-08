import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { format } from "date-fns"
import { FontAwesome } from "@expo/vector-icons";
import { Promotion } from "@/api/interface";

interface PromotionCard {
    promo: Promotion,
    onPress: () => void,
}

export default function PromoCard({promo, onPress}: PromotionCard) {
    const [ isImgLoading, setIsImgLoading ] = useState(true)
    
    const from = format(new Date(promo.validFrom), "d LLL y");
    const to  = format(new Date(promo.validTo), "d LLL y");
    
    return(
        <TouchableOpacity 
          style={styles.promoCard}
          onPress={onPress}
        >
            <View style = {{flex: 1, padding: 10, justifyContent: "center", "alignContent": "center"}}>
              {isImgLoading &&
                 <ActivityIndicator size="large" color="#007AFF" style={{flex: 1}}/>
              }
              <Image
                source={{uri: promo.img}}
                style={styles.img}
                onLoad={() => setIsImgLoading(true)}
                onLoadEnd={() => setIsImgLoading(false)}
              />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.dateContainer}>
                    <FontAwesome name="calendar" style={styles.calendarIcon}/>
                    <Text style={styles.dateText}>{from} - {to}</Text>
                </View>
                <Text style={styles.title} numberOfLines={1}>
                    {promo.title}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    promoCard: {
        width: "45%",
        aspectRatio: 0.65,
        backgroundColor: "white",
        borderRadius: 10,
        boxShadow: "0px 0px 5px grey"
    },
    imgContainer: {
        flex: 1,
        padding: 10,
        justifyContent: "center",
        alignContent: "center"
    },
    img: {
        width: "100%",
        resizeMode: "center",
        flex: 1
    },
    textContainer: {
        padding: 10,
        borderTopColor: "black",
        borderTopWidth: 2
    },
    dateContainer: {
        flexDirection: "row"
    },
    calendarIcon: {
        padding: 3
    },
    dateText: {
        fontSize: 11, paddingTop:2, textAlign: "center"
    },
    title: {
        fontSize: 15, fontWeight: "bold"
    }
})
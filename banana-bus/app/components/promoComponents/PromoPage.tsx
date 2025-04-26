import React from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";

import { Promotion } from "@/app/interface";
import PromoCard from "./PromoCard";

const { width } = Dimensions.get("window")

interface PromotionPage {
    pageData:Promotion[],
    onPress: (promo: Promotion) => void,
}

/**
 * PromoPage Component
 * 
 * A component that displays a list of promotional cards in a grid layout.
 * 
 * Props:
 * - `pageData` (Promotion[]): The promotional data to display in the grid.
 * - `onPress` (function): Callback function to handle card press events.
 * 
 * Example Usage:
 * <PromoPage pageData={promoData} onPress={(promo) => console.log(promo)} />
 */
export default function PromoPage({pageData, onPress}: PromotionPage) {
  return(
    <View style={{width}}>
        <FlatList
            data={pageData}
            renderItem={({item}) => <PromoCard promo={item} onPress={() => onPress(item)}/>}
            numColumns={2}
            contentContainerStyle={styles.contentContainer}
            columnWrapperStyle={styles.columnWrapper} 
        />
    </View>
  )  
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: "space-evenly"
    },
    columnWrapper: {
        justifyContent: "space-evenly"
    }
})

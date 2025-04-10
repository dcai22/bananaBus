import React from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";

import { Promotion } from "@/api/interface";
import PromoCard from "./PromoCard";

const { width } = Dimensions.get("window")

interface PromotionPage {
    pageData:Promotion[],
    onPress: (promo: Promotion) => void,
}

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

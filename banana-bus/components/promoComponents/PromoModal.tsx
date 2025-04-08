import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import Modal from 'react-native-modal'
import { Promotion } from "@/api/interface";

interface PromotionModal {
  promo: Promotion | null,
  visible: boolean,
  setVisible: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function PromoModal({promo, visible, setVisible}: PromotionModal) {
  const [ isImgLoading, setIsImgLoading ] = useState(true)

  return (
    <Modal
        isVisible={visible}
        onBackButtonPress={() => setVisible(false)}
        onBackdropPress={() => setVisible(false)}
    >   
        {promo &&
            <View style={styles.modalContainer}>
                {isImgLoading &&
                  <ActivityIndicator size="large" color="#007AFF" style={{flex: 1}}/>
                }
                <Image
                    source={{uri: promo.img}}
                    style={styles.img}
                    onLoad={() => setIsImgLoading(true)}
                    onLoadEnd={() => setIsImgLoading(false)}
                />
                <Text style={styles.title}>{promo.title}</Text>
                <View style={styles.locationContainer}>
                    <Text style={styles.locationContainer}>Location: </Text>
                    <Text>{promo.location}</Text>
                </View>

                <Text style={styles.descriptionHeader}>Description</Text>
                <Text>{promo.description}</Text>
                <View style={styles.closeBtnContainer}>
                    <TouchableOpacity  
                        style={styles.closeBtn}
                        onPress={() => setVisible(false)}
                    >
                            <Text style={styles.closeBtnText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        }
    </Modal>  
  )
}

const styles = StyleSheet.create({
    modalContainer: {
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10
    },
    img: {
        width: "100%",
        aspectRatio: 1,
        resizeMode: "center"
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        paddingVertical: 10
    },
    locationContainer: {
        flexDirection:"row"
    },
    locationHeader: {
        fontWeight: "bold"
    },
    descriptionHeader:{
        fontWeight: "bold",
        marginTop: 10
    },
    closeBtnContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 8
    },
    closeBtn: {
        backgroundColor: "#009cff",
        padding: 5,
        borderRadius: 3
    },
    closeBtnText: {
        color: "white",
        fontWeight: "bold"
    }
})
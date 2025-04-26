import React, { useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import Modal from 'react-native-modal'
import { Promotion } from "@/api/interface";
import { NoButton } from "../Buttons";

interface PromotionModal {
  promo: Promotion | null,
  visible: boolean,
  setVisible: React.Dispatch<React.SetStateAction<boolean>>,
}

/**
 * PromoModal Component
 * 
 * A modal component that displays promotional details, including an image, title, location, and description.
 * 
 * Props:
 * - `promo` (Promotion | null): The promotional data to display in the modal.
 * - `visible` (boolean): Controls the visibility of the modal.
 * - `setVisible` (function): Callback function to set the visibility of the modal.
 * 
 * Example Usage:
 * <PromoModal promo={promoData} visible={isModalVisible} setVisible={setModalVisible} />
 */
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
                    <NoButton
                        onPress={() => setVisible(false)}
                        text="Close"
                        style={styles.closeBtn}
                    />
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
    closeBtn: {
        flex: 0,
    },
})
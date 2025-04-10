import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, ActivityIndicator} from "react-native";
import AnimatedDotsCarousel, { DecreasingDot, DotConfig } from "react-native-animated-dots-carousel";
import PromoPage from "@/components/promoComponents/PromoPage";
import PromoModal from "@/components/promoComponents/PromoModal";
import { Promotion } from "@/api/interface";
import axios from "axios";
import { LoadingPage } from "@/components/LoadingPage";

const { width } = Dimensions.get("window")

export default function Deals() {
    const [promos, setPromos] = useState<Promotion[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        setLoading(true)
        axios.get("https://banana-psi-lemon.vercel.app/getDeals", {})
        .then((res) => {
            setPromos(res.data)
        })
        .catch((err) => {
            setError(err.response.data.error)
        })
        .finally(() => {
            setLoading(false)
        })
    }, [])

    function DealsHeader() {
        return (
            <View style={styles.header}>
                <Text style={styles.headerText}>Deals for you</Text>
            </View>
        )
    }
        
    if (loading) {
        return(
            <View style={styles.screen}>
                <DealsHeader/>
                <LoadingPage/>
            </View>
        )
    }

    // make nicer or pop up
    if (error) {
        return(
            <Text>Error:{error}</Text>
        )
    }

    const itemsPerPage = 4;
    const numPages = Math.ceil(promos.length/ itemsPerPage);

    //group promos into pages
    const pageDataArray = [...Array(numPages)].map((_, i) => promos.slice(i * itemsPerPage, (i + 1) * itemsPerPage))
    
    return (
        <View style={styles.screen}>
            <DealsHeader/>
            <View style={styles.promoPages}>
                <FlatList
                    data={pageDataArray}
                    renderItem={({item}) => 
                        <PromoPage 
                            pageData={item} 
                            onPress={(promo) => {
                                setSelectedPromo(promo)
                                setModalVisible(true)
                            }}
                        />
                    }
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.x / width);
                        setCurrentPage(index);
                    }}
                />
                <PromoModal promo={selectedPromo} visible={modalVisible} setVisible={setModalVisible}/>
            </View>
            {/* Pagination Dots */}
            <View style={styles.pageDotsContainer}>
                <AnimatedDotsCarousel
                    length={numPages}
                    currentIndex={currentPage}
                    maxIndicators={2}
                    activeIndicatorConfig={pageIndicatorConfig.active}
                    inactiveIndicatorConfig={pageIndicatorConfig.inactive}
                    decreasingDots={pageIndicatorConfig.decreasingDots}
                /> 
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
        backgroundColor: "white",
        height: 70,
        paddingHorizontal: 20,
        paddingVertical: 15,
        justifyContent: "center",
        boxShadow: "0px 0px 5px grey"
    },
    headerText: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#009cff"
    },
    promoPages: {
        flex: 1
    },
    pageDotsContainer: {
      flexDirection: "row",
      height: 30,
      width,
      justifyContent:"center",
      paddingVertical: 5
    }
});

// Config/Style for Pagination Dots
const pageIndicatorConfig: {active: DotConfig, inactive: DotConfig, decreasingDots: DecreasingDot[]} = {
    active: {
        color: "#007AFF",
        margin: 3,
        opacity: 1,
        size: 8,
    },
    inactive: {
        color: 'white',
        margin: 3,
        opacity: 0.5,
        size: 8,
    },
    decreasingDots: [
        {
            config: { color: 'white', margin: 3, opacity: 0.5, size: 6 },
            quantity: 1,
        },
        {
            config: { color: 'white', margin: 3, opacity: 0.5, size: 4 },
            quantity: 1,
        }
    ]
}

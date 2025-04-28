import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Dimensions, Alert } from "react-native";
import AnimatedDotsCarousel, { DecreasingDot, DotConfig } from "react-native-animated-dots-carousel";
import PromoPage from "@/app/components/promoComponents/PromoPage";
import PromoModal from "@/app/components/promoComponents/PromoModal";
import { Promotion } from "../interface";
import axios from "axios";
import { LoadingPage } from "@/app/components/LoadingPage";
import { Header } from "@/app/components/Header";
import Container from "@/app/components/Container";
import { FontAwesome } from "@expo/vector-icons";
import { getItem } from "../helper";

const { width } = Dimensions.get("window")

/**
 * Deals Screen
 * 
 * Displays promotional deals available at 1 Utama Mall. Scraps deals from webpage,
 * displays them in a horizontal scrollable list, and allows users to view more details about each deal.
 */
export default function Deals() {
    const [promos, setPromos] = useState<Promotion[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    /**
     * Fetches promotional deals from the API when the component mounts.
     */
    useEffect(() => {
        const fetchData = async () => {
            const token = await getItem("token");
            axios.get(`${process.env.EXPO_PUBLIC_API_BASE}/deals/get`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            .then((res) => {
                setPromos(res.data)
            })
            .catch((err) => {
                Alert.alert(`Error ${err.response.data.error}`)
            })
            .finally(() => {
                setLoading(false)
            })
        }
        setLoading(true);
        fetchData();
    }, [])

    if (loading) {
        return(
            <Container>
                <Header title="Deals" icon={<FontAwesome name="tags"/>} showGoBack={false} style={styles.header} />
                <LoadingPage/>
            </Container>
        )
    }

    if (error) {
        return(
            <Container>
                <Header title="Deals" icon={<FontAwesome name="tags"/>} showGoBack={false} style={styles.header} />
            </Container>
        )
    }

    const itemsPerPage = 4;
    const numPages = Math.ceil(promos.length/ itemsPerPage);
    //group promos into pages
    const pageDataArray = [...Array(numPages)].map((_, i) => promos.slice(i * itemsPerPage, (i + 1) * itemsPerPage))
    
    return (
        <Container>
            {/* Header Component */}
            <Header title="Deals" icon={<FontAwesome name="tags"/>} showGoBack={false} style={styles.header} />
            {/* Promo Pages */}
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
        </Container>
  );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 24,
        minHeight: 50,
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

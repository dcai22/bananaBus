import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import Modal from 'react-native-modal'
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import { format } from "date-fns"
import { FontAwesome } from "@expo/vector-icons";

interface Promotion {
    title: string,
    description: string,
    location: string,
    img: string,
    validFrom: string,
    validTo: string
}

const { width } = Dimensions.get("window")
// TODO: move Promo components to components folder
// TODO: backend (using copied pasted data)
// TODO: create stylesheet

function PromoCard({promo, onPress}: {promo: Promotion, onPress: () => void}) {
    const [ isImgLoading, setIsImgLoading ] = useState(true)
    const from = format(new Date(promo.validFrom), "d LLL y");
    const to  = format(new Date(promo.validTo), "d LLL y");
    
    return(
        <TouchableOpacity style={{ width: "45%", aspectRatio: 0.65, backgroundColor: "white", borderRadius: 10, boxShadow: "0px 0px 5px grey"}}
          onPress={onPress}
        >
            <View style = {{flex: 1, padding: 10, justifyContent: "center", "alignContent": "center"}}>
              {isImgLoading &&
                 <ActivityIndicator size="large" color="#007AFF" style={{flex: 1}}/>
              }
              <Image
                source={{uri: promo.img}}
                style={{width: "100%", resizeMode: "center", flex: 1}}
                onLoad={() => setIsImgLoading(true)}
                onLoadEnd={() => setIsImgLoading(false)}
              />
            </View>
              
            <View style={{padding: 10, borderTopColor: "black", borderTopWidth: 2}}>
                <View style={{flexDirection: "row"}}>
                    <FontAwesome name="calendar" style={{padding: 3}}/>
                    <Text style={{fontSize: 11, paddingTop:2, textAlign: "center"}}>{from} - {to}</Text>
                </View>
                <Text style={{fontSize: 15, fontWeight: "bold"}} numberOfLines={1}>
                    {promo.title}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

function PromoPage({pageData, onPress}: {pageData:Promotion[], onPress: (promo: Promotion) => void}) {
  return(
    <View style={{width}}>
        <FlatList
            data={pageData}
            renderItem={({item}) => <PromoCard promo={item} onPress={() => onPress(item)}/>}
            numColumns={2}
            contentContainerStyle={{flex: 1, justifyContent: "space-evenly"}}
            columnWrapperStyle={{justifyContent: "space-evenly"}} 
        />
    </View>
  )  
}

export default function Deals() {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const itemsPerPage = 4;
    const numPages = Math.ceil(promos.length/ itemsPerPage);

    //group promos into pages
    const pageDataArray = [...Array(numPages)].map((_, i) => promos.slice(i * itemsPerPage, (i + 1) * itemsPerPage))
    
    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Text style={{fontSize: 30, fontWeight: "bold", color: "#009cff"}}>Deals for you</Text>
            </View>
            <View style={{flex: 1}}>
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
                        console.log(index)
                        setCurrentPage(index);
                    }}
                />
                {/* modal for more info on event. maybe change to component*/}
                <Modal
                    isVisible={modalVisible}
                    onBackButtonPress={() => setModalVisible(false)}
                    onBackdropPress={() => setModalVisible(false)}
                >   
                    {selectedPromo &&
                        <View style={{padding: 20, backgroundColor: "white", borderRadius: 10}}>
                            <Image
                                source={{uri: selectedPromo.img}}
                                style={{width: "100%", aspectRatio: 1, resizeMode: "center"}}
                            />
                            <Text style={{ fontSize: 18, fontWeight: "bold", paddingVertical: 10 }}>
                                {selectedPromo.title}
                            </Text>
                            <View style={{flexDirection:"row"}}>
                                <Text style={{fontWeight: "bold"}}>Location: </Text>
                                <Text>{selectedPromo.location}</Text>
                            </View>

                            <Text style={{fontWeight: "bold", marginTop: 10}}>Description</Text>
                            <Text>{selectedPromo.description}</Text>
                            <View style={{flexDirection: "row", justifyContent: "flex-end", marginTop: 8}}>
                                <TouchableOpacity 
                                    onPress={() => setModalVisible(false)}
                                    style={{backgroundColor: "#009cff", padding: 5, borderRadius: 3}}
                                >
                                        <Text style={{ color: "white", fontWeight: "bold"}}>Close</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    }
                </Modal>  
            </View>
          
          {/* page dots */}
          <View style={{flexDirection: "row", height: 30, width, justifyContent: "center", paddingVertical: 5}}>
            <AnimatedDotsCarousel
                length={numPages}
                currentIndex={currentPage}
                maxIndicators={2}
                activeIndicatorConfig={{
                    color: "#007AFF",
                    margin: 3,
                    opacity: 1,
                    size: 8,
                }}
                inactiveIndicatorConfig={{
                    color: 'white',
                    margin: 3,
                    opacity: 0.5,
                    size: 8,
                }}
                decreasingDots={[
                    {
                        config: { color: 'white', margin: 3, opacity: 0.5, size: 6 },
                        quantity: 1,
                    },
                    {
                        config: { color: 'white', margin: 3, opacity: 0.5, size: 4 },
                        quantity: 1,
                    },
                ]}
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
    }
});

// copied and pasted some data from scraper
const promos = [
    {
      title: 'LCK',
      description: 'Enjoy discounted prices off selected 16oz and 22oz beverages. T&Cs apply.',
      location: 'Utama Mall SK2B',
      img: 'https://www.1utama.com.my/images/promotion/Website_LCK.png?20250406',
      validFrom: '2025-04-01T16:00:00.000Z',
      validTo: '2025-04-29T16:00:00.000Z'
    },
    {
      title: 'Leather Avenue',
      description: 'Meet the Lushberry Aviator 5 – Your Ultimate Travel Companion. Introducing the Aviator 5 luggage, crafted for the modern traveller who values style, strength, and convenience. With its sleek hard-shell design, effortless glide wheels, and secure locks, this suitcase is built to keep up with all your adventures—while keeping your essentials safe and sound. Ready to upgrade your travel game? Discover the Aviator 5 today at Leather Avenue store today.\r\n' +
        '\r\n',
      location: 'Utama Mall G123',
      img: 'https://www.1utama.com.my/images/promotion/Leather%20Avenue%201.jpg?20250406',
      validFrom: '2025-03-23T16:00:00.000Z',
      validTo: '2025-04-06T16:00:00.000Z'
    },
    {
      title: 'MANGO',
      description: '2X UPoints with a minimum spend of RM350. T&Cs apply.',
      location: 'Utama Mall F308-F309',
      img: 'https://www.1utama.com.my/images/promotion/WebsitePosting_Mango_March25.jpg?20250406',
      validFrom: '2025-03-13T16:00:00.000Z',
      validTo: '2025-04-05T16:00:00.000Z'
    },
    {
      title: 'Massimo Dutti',
      description: 'Enjoy 2X UPoints with min. spend RM550 in a single receipt. T&Cs apply.',
      location: 'Utama Mall G325',
      img: 'https://www.1utama.com.my/images/promotion/MD-Website-Posting_1000x1000.jpg?20250406',
      validFrom: '2025-03-06T16:00:00.000Z',
      validTo: '2025-04-05T16:00:00.000Z'
    },
    {
      title: 'Melvita',
      description: "Enjoy 10% off on baby, toiletries and L'Or Rose Range. T&Cs apply.",
      location: 'Utama Mall F141',
      img: 'https://www.1utama.com.my/images/promotion/WebsitePosting_Melvita_MomsBaby_2025.jpg?20250406',
      validFrom: '2024-12-31T16:00:00.000Z',
      validTo: '2025-09-29T16:00:00.000Z'
    },
    {
      title: 'MONTIGO',
      description: 'Make every sip a sweet sensation with Montigo’s Wonderama Collection. Inspired by indulgent treats, these pastel hues add a sprinkle of delight to every sip. Want to make it even sweeter? Personalize yours for a touch as unique as your favourite treat! \r\n' +
        '\r\n',
      location: 'Utama Mall FK108',
      img: 'https://www.1utama.com.my/images/promotion/MT%20Wonderama%20-%201%20Utama%20-%20Digital%20Channels%20-%201200x1200.jpg?20250406',
      validFrom: '2025-03-23T16:00:00.000Z',
      validTo: '2025-04-06T16:00:00.000Z'
    },
    {
      title: 'Mosaic Art Studio',
      description: 'Enjoy 20% discount on birthday party package (NP: RM200/pax)! T&Cs apply.',
      location: 'Utama Mall S328E-S328F',
      img: 'https://www.1utama.com.my/images/promotion/ONECARD-Website-Posting.jpg?20250406',
      validFrom: '2025-01-31T16:00:00.000Z',
      validTo: '2025-12-30T16:00:00.000Z'
    },
    {
      title: 'Mr Fish Fish & Seafood Noodle',
      description: 'New flavours, same great taste – now from just RM12.90 at Mr Fish Seafood Noodle. Try out the NEW Lala Sotong Soup Noodle, Fried Chicken Rice Set, and crowd favourites, Fish Paste Soup Noodle and receive complimentary Fried Enoki Mushroom, only on weekdays from 11am to 3pm.\r\n' +
        '\r\n' +
        'T&C’s apply.\r\n',
      location: 'Utama Mall LG333A',
      img: 'https://www.1utama.com.my/images/promotion/Mr%20Fish.jpg?20250406',
      validFrom: '2025-03-23T16:00:00.000Z',
      validTo: '2025-04-06T16:00:00.000Z'
    },
    {
      title: 'Neubodi',
      description: 'Celebrate Lebaran 2025 in style with 20% off Neubodi’s Bundle Deals. Promo valid till 6 April 2025. \r\n' +
        '\r\n' +
        'T&C’s apply.\r\n',
      location: 'Utama Mall F105',
      img: 'https://www.1utama.com.my/images/promotion/Neubodi.jpg?20250406',
      validFrom: '2025-03-23T16:00:00.000Z',
      validTo: '2025-04-05T16:00:00.000Z'
    },
    {
      title: 'Pandora',
      description: 'Sparkle this Raya with Pandora. Enjoy Buy 2 Free 1, Buy 3 Free 2, and Buy 4 Free 3 on all pieces, plus receive an exclusive Raya packet with a minimum spend of RM288. Complete your festive look with timeless jewellery. Promo valid till 6 April 2025.\r\n' +
        '\r\n' +
        'T&C’s apply.\r\n' +
        '\r\n' +
        '\r\n',
      location: 'Utama Mall F346A',
      img: 'https://www.1utama.com.my/images/promotion/PANDORA.jpg?20250406',
      validFrom: '2025-03-23T16:00:00.000Z',
      validTo: '2025-04-05T16:00:00.000Z'
    },
    {
      title: 'Potato Corner',
      description: 'Indulge in the ultimate cheesy treat with Potato Corner’s new Mozza Cheese Stick. Made with real mozzarella cheese and coated in a crispy, golden crust—crunchy on the outside, ooey-gooey on the inside for the perfect mozzarella pull. Promo valid till 20 April 2025. \r\n' +      
        '\r\n' +
        'T&C’s apply.\r\n' +
        '\r\n',
      location: 'Utama Mall LGK113',
      img: 'https://www.1utama.com.my/images/promotion/Potato%20Corner.jpg?20250406',
      validFrom: '2025-02-24T16:00:00.000Z',
      validTo: '2025-04-19T16:00:00.000Z'
    },
    {
      title: 'Pull & Bear',
      description: 'Enjoy 2X UPoints with min. spend RM200 in a single receipt. T&Cs apply. ',
      location: 'Utama Mall F313',
      img: 'https://www.1utama.com.my/images/promotion/PB-Website-Posting_1000x1000.jpg?20250406',
      validFrom: '2025-03-06T16:00:00.000Z',
      validTo: '2025-04-05T16:00:00.000Z'
    },
    {
      title: 'Rich Baker',
      description: 'Enjoy TWO Lucky Draws with RM88 spending. T&Cs apply.',
      location: 'Utama Mall LG220',
      img: 'https://www.1utama.com.my/images/promotion/Rich%20Baker%201000x1000.png?20250406',
      validFrom: '2025-03-31T16:00:00.000Z',
      validTo: '2025-04-29T16:00:00.000Z'
    },
    {
      title: 'Rich Baker',
      description: 'Enjoy 2X UPoints on Raya Gift Set. T&Cs apply, while stocks last.',
      location: 'Utama Mall LG220',
      img: 'https://www.1utama.com.my/images/promotion/Raya%20Box%201000x1000.png?20250406',
      validFrom: '2025-03-05T16:00:00.000Z',
      validTo: '2025-04-29T16:00:00.000Z'
    },
    {
      title: 'Rich Kopitiam',
      description: 'Enjoy TWO Lucky Draws with RM88 spending. T&Cs apply.',
      location: 'Utama Mall LG603-LG603A',
      img: 'https://www.1utama.com.my/images/promotion/Rich%20Kopitiam%201000x1000.png?20250406',
      validFrom: '2025-03-31T16:00:00.000Z',
      validTo: '2025-04-29T16:00:00.000Z'
    },
    {
      title: 'Rich Kopitiam',
      description: 'Enjoy 2X UPoints on Twin Bundle Promo consisting of White Coffee & Kaya. T&Cs apply, while stocks last.',
      location: 'Utama Mall LG603-LG603A',
      img: 'https://www.1utama.com.my/images/promotion/Website_RichKopitiam.png?20250406',
      validFrom: '2025-02-28T16:00:00.000Z',
      validTo: '2025-04-29T16:00:00.000Z'
    },
    {
      title: 'Ripcurl',
      description: 'The Rip Curl Raya Sale is here. Enjoy up to 50% off and get a Packable Backpack for RM30 with a minimum spend of RM300 in a single receipt. While stocks last. \r\n' +
        '\r\n' +
        'T&C’s apply.\r\n',
      location: 'Utama Mall F217',
      img: 'https://www.1utama.com.my/images/promotion/RIP%20Curl.jpg?20250406',
      validFrom: '2025-03-23T16:00:00.000Z',
      validTo: '2025-04-06T16:00:00.000Z'
    },
    {
      title: 'ROYCE',
      description: 'Sweeten your Raya celebrations with ROYCE’. Indulge in a selection of premium chocolates, beautifully packaged in exclusive Hari Raya designs—perfect for sharing, gifting, or a little self-treat. Receive a complimentary 8-piece Raya Packet set with a purchase of RM180, including one item from the Raya Collection. Promo valid till 30 April 2025. \r\n' +
        '\r\n' +
        'T&C’s apply.\r\n' +
        '\r\n',
      location: 'Utama Mall G145A',
      img: 'https://www.1utama.com.my/images/promotion/ROYCE.jpg?20250406',
      validFrom: '2025-02-24T16:00:00.000Z',
      validTo: '2025-04-29T16:00:00.000Z'
    },
    {
      title: 'Running Lab',
      description: 'Project Love Sneaker: Donate preloved running shoes at Running Lab (1-30 April) & get RM150 voucher!\r\n' +
        '<P> More info: www.instagram.com/runninglabmy.\r\n',
      location: 'Utama Mall S301',
      img: 'https://www.1utama.com.my/images/promotion/PLS%20RL1U%20-%201000x1000.png?20250406',
      validFrom: '2025-03-31T16:00:00.000Z',
      validTo: '2025-04-29T16:00:00.000Z'
    },
    {
      title: "Samtai YAMCH'A",
      description: 'Enjoy TWO Lucky Draws with RM88 spending. T&Cs apply.',
      location: 'Utama Mall LG122',
      img: 'https://www.1utama.com.my/images/promotion/Samtai%201000x1000.png?20250406',
      validFrom: '2025-03-31T16:00:00.000Z',
      validTo: '2025-04-29T16:00:00.000Z'
    },
    {
      title: 'senQ',
      description: 'Pre-order the iPhone 16e, powered by the A18 chip, and capture stunning photos with its 48MP Fusion camera. Enjoy installments as low as RM58.32 per month with a PWP offer on the Apple 20W Adapter.\r\n' +
        '\r\n' +
        'T&C’s apply.\r\n',
      location: 'Utama Mall LG102',
      img: 'https://www.1utama.com.my/images/promotion/SENQ.jpg?20250406',
      validFrom: '2025-03-23T16:00:00.000Z',
      validTo: '2025-04-06T16:00:00.000Z'
    },
    {
      title: 'Skechers',
      description: 'Reconnect with your Raya friends this festive season with Skechers. Enjoy up to 50% OFF your total bill when you purchase 4 or more items of footwear and apparel. Receive a complimentary green packet with every purchase of RM300 as a special Raya treat. Grab your favourite comfy pair. Promo valid till 6 April 2025.\r\n' +
        '\r\n' +
        'T&C’s apply.\r\n' +
        '\r\n',
      location: 'Utama Mall G117-G118-G119',
      img: 'https://www.1utama.com.my/images/promotion/Skechers.jpg?20250406',
      validFrom: '2025-03-23T16:00:00.000Z',
      validTo: '2025-04-05T16:00:00.000Z'
    },
    {
      title: 'Sushi King',
      description: "What's dark, pitch black even, and so irresistable it's bound to leave you wanting for more? Taste the darkness with Sushi King's Makkuro Feast for an experience like no other. Satisfy your unknown cravings with Sushi King from 17 Feb to 13 Apr 2025.\r\n" +
        '\r\n' +
        'T&C’s apply.\r\n',
      location: 'Utama Mall LG322',
      img: 'https://www.1utama.com.my/images/promotion/Sushi%20King.jpg?20250406',
      validFrom: '2025-02-16T16:00:00.000Z',
      validTo: '2025-04-12T16:00:00.000Z'
    },
    {
      title: 'TGI Fridays',
      description: 'Come hungry, leave happy. Enjoy a delicious lunch set at TGI Fridays from just RM19.90, available every Monday to Friday from 11 AM to 3 PM. Don’t miss out on this affordable lunch option. Promo valid till 30 April 2025. \r\n' +
        '\r\n' +
        'T&C’s apply.\r\n' +
        '\r\n' +
        '\r\n',
      location: 'Utama Mall G203A-G205-G206',
      img: 'https://www.1utama.com.my/images/promotion/TGI%20Friday.png?20250406',
      validFrom: '2025-02-24T16:00:00.000Z',
      validTo: '2025-04-29T16:00:00.000Z'
    },
    {
      title: 'Thai Hou Sek',
      description: 'Get a FREE Thai Tropical Tower when you celebrate your birthday with Thai Hou Sek with minimum spending of RM30 on ala carte items! T&Cs apply.',
      location: 'Utama Mall S132',
      img: 'https://www.1utama.com.my/images/promotion/Website_ThaiHouSek.jpg?20250406',
      validFrom: '2024-12-31T16:00:00.000Z',
      validTo: '2025-07-30T16:00:00.000Z'
    },
    {
      title: 'Thai Odyssey',
      description: 'Enjoy early bird savings at Thai Odyssey with 20% off full-body massage and 10% off any purchase of a full-body massage before 4 PM on weekdays throughout March. \r\n' +
        '\r\n' +
        'T&C’s apply.\r\n',
      location: 'Utama Mall B22',
      img: 'https://www.1utama.com.my/images/promotion/THAI%20ODYSSEY.jpg?20250406',
      validFrom: '2025-03-23T16:00:00.000Z',
      validTo: '2025-04-06T16:00:00.000Z'
    },
    {
      title: 'Tomei',
      description: 'Radiate elegance this Eid with timeless gold artistry from TOMEI Diamond Sale, crafted to perfection for your most cherished moments. Enjoy up to 40% OFF on exquisite diamond jewellery from 1 till 13 April 2025. \r\n' +
        '\r\n' +
        'T&C’s apply.\r\n',
      location: 'Utama Mall G126',
      img: 'https://www.1utama.com.my/images/promotion/TOMEI.jpg?20250406',
      validFrom: '2025-03-31T16:00:00.000Z',
      validTo: '2025-04-12T16:00:00.000Z'
    },
    {
      title: "Toys 'R' Us",
      description: 'Playful Raya Together at Toys"R"Us. Celebrate the joy of Raya with exciting gifts and surprises from 4 March till 20 April 2025. It’s the perfect time to start checking off your holiday toy list. Supercharge your playtime with Toys”R”Us 1 Utama.\r\n' +
        '\r\n' +
        'T&C’s apply.\r\n',
      location: 'Utama Mall S140',
      img: 'https://www.1utama.com.my/images/promotion/Toys%20R%20Us.jpg?20250406',
      validFrom: '2025-03-03T16:00:00.000Z',
      validTo: '2025-04-19T16:00:00.000Z'
    },
    {
      title: 'Yenji Clay Craft',
      description: 'Sign-up 12 lesson course at RM670 (NP: RM1,200). T&Cs apply. ',
      location: 'Utama Mall S327A-S327B',
      img: 'https://www.1utama.com.my/images/promotion/Yenji%20Website%20Posting.jpg?20250406',
      validFrom: '2025-03-14T16:00:00.000Z',
      validTo: '2025-04-14T16:00:00.000Z'
    },
    {
      title: 'ZARA',
      description: 'Enjoy 2X UPOints with min. spend RM280 in a single receipt. T&Cs apply.',
      location: 'Utama Mall G319',
      img: 'https://www.1utama.com.my/images/promotion/ZARA-Website-Posting_1000x1000.jpg?20250406',
      validFrom: '2025-03-06T16:00:00.000Z',
      validTo: '2025-04-05T16:00:00.000Z'
    },
    {
      title: 'ZARA',
      description: 'Discover the adorable Butterbear x Zara Kids collection, now available at Zara Kids 1 Utama.\r\n',
      location: 'Utama Mall G319',
      img: 'https://www.1utama.com.my/images/promotion/ZARA%20KIDS.jpg?20250406',
      validFrom: '2025-03-23T16:00:00.000Z',
      validTo: '2025-04-06T16:00:00.000Z'
    }
  ]

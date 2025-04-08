import { Text, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, useNavigation } from "expo-router";

export default function Payment() {
    const [cards, setCards] = useState([
        { id: 1, type: 'Visa', last4: '1234', isDefault: true },
        { id: 2, type: 'MasterCard', last4: '1234', isDefault: false },
        { id: 3, type: 'MasterCard', last4: '1234', isDefault: false },
    ]);

    useEffect(() => {
        // TODO Fetch payment datas
        // setCards([]);
    }, []);

    const handleEditCard = (cardId: number) => {
        console.log('Edit card:', cardId);
        // TODO navigate to edit card screen
    };

    const handleAddCard = () => {
        console.log('Add new card');
        // TODO navigate to add card
    };

	const renderCard = ({ item: card }) => (
        <View style={styles.card}>
            <Text style={styles.cardNumber}>•••• {card.last4}</Text>
            <Text style={styles.cardType}>{card.type}</Text>
            {card.isDefault && <Text style={styles.default}>Default</Text>}
            <TouchableOpacity onPress={() => handleEditCard(card.id)}>
                <Text style={styles.editCard}>Edit Card Details →</Text>
            </TouchableOpacity>
        </View>
    );
	
    return (
        <View style={styles.container}>
			<Link href="/account" style={styles.goBack}>← go back</Link>
			<Text style={styles.title}>My Wallet</Text>
			<FlatList
					data={cards}
					renderItem={renderCard}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.cardList}
					showsVerticalScrollIndicator={false}
				/>
			<TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
				<Text style={styles.addCardText}>Add new card →</Text>
			</TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#e5f0fa',
	},
	goBack: {
		color: '#007aff',
		marginTop: 20,
		fontWeight: 'bold',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		color: '#007aff',
	},
	card: {
		backgroundColor: '#d3d3d3',
		padding: 20,
		borderRadius: 10,
		marginBottom: 20,
	},
	cardNumber: {
		fontSize: 18,
		marginBottom: 10,
	},
	cardType: {
		fontSize: 16,
		marginBottom: 10,
	},
	default: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	editCard: {
		color: '#007aff',
	},
	addCardButton: {
		backgroundColor: 'white',
		padding: 15,
		borderRadius: 10,
	},
	addCardText: {
		color: 'black',
		fontSize: 20,
		fontWeight: 'bold',
	},
	cardList: {
        paddingBottom: 20,
    },
});
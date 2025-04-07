import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, useNavigation } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';

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

    return (
		<View style={styles.container}>
			<View style={styles.headerBox}>
				<Link href="/account" style={styles.goBack}>← go back</Link>
				<Text style={styles.header}>My Wallet</Text>
			</View>
			<View style={styles.cards}>
				{cards.map(card => (
						<TouchableOpacity
							key={card.id}
							style={styles.card}
							onPress={() => handleEditCard(card.id)}
							activeOpacity={0.7}
						>
							<View>
								<View style={styles.cardType}>
									<FontAwesome 
										name={card.type === 'Visa' ? 'cc-visa' : card.type === 'MasterCard' ? 'cc-mastercard' : 'credit-card'} 
										style={styles.cardIcon} 
									/>
									<Text style={styles.cardTypeText}>{card.type}	••••{card.last4}</Text>
								</View>
								{card.isDefault && <Text style={styles.default}>Default</Text>}
							</View>
							<FontAwesome name="chevron-right" style={styles.editCard}/>
						</TouchableOpacity>
				))}
				<TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
					<Text style={styles.addCardText}>Add payment method</Text>
				</TouchableOpacity>
			</View>
		</View>
    );
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#e5f0fa',
	},
	goBack: {
		color: '#74b9f1',
		marginTop: 20,
		fontWeight: 'bold',
	},
	headerBox: {
        backgroundColor: '#fff',
        marginBottom: 8,
        padding: 35,
        minHeight: 150,
		shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
    },
    header: {
        fontSize: 36,
        fontWeight: 'bold',
		color: '#4399dc',
    },
	cards: {
		flex: 1,
		padding: 16,
	},
	card: {
		backgroundColor: 'white',
		padding: 12,
		borderRadius: 10,
		marginBottom: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	cardType: {
		marginBottom: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	cardTypeText: {
		fontSize: 16,
		textAlignVertical: 'center',
	},
	cardIcon: {
		fontSize: 24,
		color: '#4399dc',
		marginRight: 8,
	},
	default: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	editCard: {
		color: '#4399dc',
		fontSize: 20,
		textAlignVertical: 'center',
		lineHeight: 20,
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
});
import { Text, View, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, useFocusEffect, useNavigation } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { NoButton, YesButton } from '@/components/Buttons';
import { getItem } from '../helper';

interface Card {
	_id: string;
	type: string;
	cardNumber: string;
	cvv: string;
	expiry: Date;
	last4: string;
	isDefault: boolean;
}

export default function Payment() {
	const [cards, setCards] = useState<Card[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedCard, setSelectedCard] = useState<string | null>(null);
	const [refresh, setRefresh] = useState(false);
	const navigation = useNavigation();

	useFocusEffect(
		React.useCallback(() => {
			setRefresh(true);
			return () => {};
		}, [])
	)

	useEffect(() => {
		const fetchData = async () => {
			const token = await getItem('token');
			try {
				const response = await fetch('https://banana-bus.vercel.app/getUserCards', {
					method : 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				});
				if (response.ok) {
					const data = await response.json();
					setCards(data.cards);
					console.log(data.cards);
					console.log(cards);
				}
			} catch (error) {
				console.error('Error fetching payment data:', error);
			}
		};
		fetchData();
		setRefresh(false);
	}, [refresh]);

	const handleEditCard = (cardId: string) => {
		setSelectedCard(cardId);
		setModalVisible(true);
	};

	const handleRemoveCard = async () => {
		const token = await getItem('token');
		try {
			const response = await fetch('https://banana-bus.vercel.app/deleteCard', {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ cardId: selectedCard }),
			});
			if (response.ok) {
				setCards(cards.filter(card => card._id !== selectedCard));
			}
		} catch (error) {
			Alert.alert('Error', 'Failed to remove card. Please try again later.');
		}
		setRefresh(true);
		closeModal();
	}

	const handleMakeDefault = async () => {
		const token = await getItem('token');
		try {
			const response = await fetch('https://banana-bus.vercel.app/makeDefaultCard', {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ cardId: selectedCard }),
			});
			if (response.ok) {
				setCards(cards.map(card => {
					if (card._id === selectedCard) {
						return { ...card, isDefault: true };
					}
					return { ...card, isDefault: false };
				}));
			}
		} catch (error) {
			Alert.alert('Error', 'Failed to make card default. Please try again later.');
		}
		closeModal();
	}

	const closeModal = () => {
		setModalVisible(false);
		setSelectedCard(null);
	}

	return (
		<View style={styles.container}>
			<View style={styles.headerBox}>
				<Link href="/account" style={styles.goBack}>← go back</Link>
				<Text style={styles.header}>My Wallet</Text>
			</View>
			<View style={styles.cards}>
				{cards.map(card => (
						<TouchableOpacity
							key={card._id}
							style={styles.card}
							onPress={() => handleEditCard(card._id)}
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
				<TouchableOpacity style={styles.addCardButton} onPress={() => navigation.navigate('newPayment')}>
					<Text style={styles.addCardText}>Add payment method</Text>
				</TouchableOpacity>
			</View>
			<Modal
				visible={modalVisible}
				transparent={true}
				animationType="slide"
				onRequestClose={closeModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Card Options</Text>
						<NoButton onPress={handleRemoveCard} text="Remove Card" />
						<NoButton onPress={handleMakeDefault} text="Make Default" />
						<YesButton onPress={closeModal} text="Cancel"/>
					</View>
				</View>
			</Modal>
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
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 10,
		width: '80%',
		alignItems: 'center',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 12,
	},
});
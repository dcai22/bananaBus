import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function Tab() {
    // TODO saved trip list that gets from backend
    const date: string = new Date().toISOString()
    console.log(date)
    return (
        <View style={styles.container}>
            <Text>Tab [Home|Settings]</Text>
            <Link
                style= {{
                    height: 100,
                    backgroundColor: "grey"
                }}
                href={{
                pathname: '/tripsList',
                params: { routeId: 1, departId: 1, arriveId: 2, date: `${date}`},
                }}>
                View route's trip list
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

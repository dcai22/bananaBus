import { Text, View } from "react-native";
import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
    // TODO if (!user) {
    //     return <Redirect href="/(tabs)/login" />;
    // }

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text>Edit app/index.tsx to edit this screen.</Text>
            <Text>Edit app/index.tsx to edit this screen.</Text>
            <Text>Edit app/index.tsx to edit this screen.</Text>
            <Text>Edit app/index.tsx to edit this screen.</Text>
            <Text>Edit app/index.tsx to edit this screen.</Text>
            <Text>Edit app/index.tsx to edit this screen.</Text>
            <Text>Edit app/index.tsx to edit this screen.</Text>
            <Text>Edit app/index.tsx to edit this screen.</Text>
        </View>
    );
}

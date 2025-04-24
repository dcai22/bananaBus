import { Redirect } from "expo-router";
import React from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function Index() {
    React.useEffect(() => {
        GoogleSignin.configure({
            webClientId: "800099148650-9cvgb86han5qvg54u0v8qbldaq7d2j1v.apps.googleusercontent.com"
        });
    })
    return (
            <Redirect href="/(tabs)/login" />
    );
}

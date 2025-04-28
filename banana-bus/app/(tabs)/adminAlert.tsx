import React from "react"
import { Header } from "@/app/components/Header";
import Container from "@/app/components/Container";

/**
 * Manager Alerts Screen
 */
export default function adminAlert() {
    return (
        <Container>
            {/* Header */}
            <Header title="Alerts" showGoBack={true}/>
        </Container>
    );
}

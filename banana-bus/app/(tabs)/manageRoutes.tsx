import React from "react";
import { Header } from "@/app/components/Header";
import Container from "@/app/components/Container";

/**
 * Manage Routes Screen
 */
export default function manageRoutes() {
    return (
        <Container>
            {/* Header */}
            <Header title="Routes" showGoBack={true}/>
        </Container>
    );
}

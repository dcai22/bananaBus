import React from "react"
import { Header } from "@/app/components/Header";
import Container from "@/app/components/Container";

/**
 * Manage Users Screen
 */
export default function manageUsers() {
    return (
        <Container>
            {/* Header */}
            <Header title="Users" showGoBack={true}/>
        </Container>
    );
}

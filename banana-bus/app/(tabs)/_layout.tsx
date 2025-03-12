import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs initialRouteName="login">
        <Tabs.Screen
            name="login"
            options={{
                href: null,
            }}
        />
    </Tabs>
  );
}

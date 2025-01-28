import React from "react";
import { Stack } from "expo-router";

const TabsLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide headers globally
      }}
    >
      {/* Tasks Layout */}
      <Stack.Screen name="(tasks)" />

      {/* Profile Screen */}
      <Stack.Screen name="Profile"/>
    </Stack>
  );
};

export default TabsLayout;

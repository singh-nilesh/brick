import React from "react";
import { View, StyleSheet } from "react-native";
import Foundation from "@expo/vector-icons/Foundation";
import { Tabs, usePathname } from "expo-router";
import AddMenu from "./AddMenu"; // Import the Floating Action Menu

export default function TabLayout() {

  // Get the current page path
  const pagePath = usePathname();
  const bottomTabBarVisible = ["/FetchAiResponse", "/Profile", "/GroupOverview", "/ExplorePage"].includes(pagePath) ? "none" : 'flex';


  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            ...styles.tabBarStyle,
            display: bottomTabBarVisible,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            tabBarIcon: ({ focused }) => (
              <Foundation name="home" size={30} color={focused ? "black" : "grey"} />
            ),
          }}
        />
        <Tabs.Screen
          name="(progress)"
          options={{
            tabBarIcon: ({ focused }) => (
              <Foundation name="mountains" size={30} color={focused ? "black" : "grey"} />
            ),
          }}
        />

        <Tabs.Screen name="AddMenu" />

        <Tabs.Screen
          name="(feeds)"
          options={{
            tabBarIcon: ({ focused }) => (
              <Foundation name="results" size={30} color={focused ? "black" : "grey"} />
            ),
          }}
        />
        <Tabs.Screen
          name="(user)"
          options={{
            tabBarIcon: ({ focused }) => (
              <Foundation name="torso" size={30} color={focused ? "black" : "grey"} />
            ),
          }}
        />
      </Tabs>

      {/* Floating Action Menu */
      bottomTabBarVisible === 'flex' && <AddMenu/>}
      
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    position: "absolute",
    bottom: 10,
    height: 50,
    left: 10,
    right: 10,
    marginHorizontal: 10,
    backgroundColor: "#f7f7f7",
    borderColor: "transparent",
    borderRadius: 20,
    flexDirection: "row",
    paddingBottom: 30,
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
});

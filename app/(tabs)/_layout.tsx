import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import Octicons from '@expo/vector-icons/Octicons';
import Foundation from '@expo/vector-icons/Foundation';
import { Tabs } from "expo-router";
import { View, TouchableOpacity, StyleSheet, Text, KeyboardAvoidingView, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import * as SQLite from 'expo-sqlite';


export default function TabLayout() {

  const db = SQLite.openDatabaseSync('brick.db');
  useDrizzleStudio(db);

  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuOption = (option: string) => {
    console.log(option); // Handle the selected menu option here
    setMenuVisible(false); // Close the menu after selection
  };

  const handleAddTask = () => {
    console.log("Add Task");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>

      <StatusBar backgroundColor="white" style="dark" />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBarStyle,
          tabBarShowLabel: false,
          tabBarActiveTintColor: "black",
          tabBarInactiveTintColor: "#333",
        }}
      >
        <Tabs.Screen
          name="(progress)"
          options={{
            title: "Progress",
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.tabIconWrapper,
                  focused && styles.activeTabIconWrapper,
                ]}
              >
                <Foundation name="mountains" size={27} color={focused ? "black" : "grey"} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="(tasks)"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.tabIconWrapper,
                  focused && styles.activeTabIconWrapper,
                ]}
              >
                <Foundation name="home" size={27} color={focused ? "black" : 'grey'} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="(feeds)"
          options={{
            title: "Feeds",
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.tabIconWrapper,
                  focused && styles.activeTabIconWrapper,
                ]}
              >
                <Foundation name="results" size={27} color={focused ? "black" : 'grey'} />
              </View>
            ),
          }}
        />
      </Tabs>


      {/* Floating Menu */}
      {menuVisible && (
        <View style={styles.floatingMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleAddTask()}
          >
            <Text style={styles.menuText}>Add Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuOption("Add Todo")}
          >
            <Text style={styles.menuText}>Add Todo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuOption("Add Habit")}
          >
            <Text style={styles.menuText}>Add Habit</Text>
          </TouchableOpacity>
        </View>
      )}


      {/* Connecting Line */}
      <View style={styles.connectorLine} />

      {/* Floating "+" Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={toggleMenu}>
        <AntDesign name="pluscircle" size={45} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    paddingTop: 7,
    position: "absolute",
    bottom: 20,
    start: 20,
    height: 55,
    width: "55%",
    backgroundColor: "#f0f0f0",
    borderRadius: 40,
    borderEndEndRadius: 50,
    borderEndStartRadius: 50,
    shadowColor: "transparent",
    paddingHorizontal: 5,
  },

  floatingButton: {
    width: 60,
    height: 55,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    borderStartEndRadius: 50,
    borderStartStartRadius: 50,
    position: "absolute",
    bottom: 20,
    right: 20,
  },

  connectorLine: {
    position: "absolute",
    width: "23%",
    start: "59%",
    bottom: 37,
    height: 20,
    backgroundColor: "#f0f0f0", // Line color
  },

  tabIconWrapper: {
    width: 55,
    height: 48, // Reduced height for less bottom padding
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  activeTabIconWrapper: {
    backgroundColor: "#FFF",
  },
  floatingMenu: {
    position: "absolute",
    bottom: 70, // Adjusted position above the "+" button
    right: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderEndColor: "black",
    borderWidth: 5,
  },
  menuItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  menuText: {
    backgroundColor: 'black',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
    color: "white",
  },
});

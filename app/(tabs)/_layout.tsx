import React, { useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Tabs } from "expo-router";
import { View, TouchableOpacity, StyleSheet, Text, KeyboardAvoidingView, TouchableWithoutFeedback } from "react-native";

export default function TabLayout() {

  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuOption = (option: string) => {
    console.log(option); // Handle the selected menu option here
    setMenuVisible(false); // Close the menu after selection
  };

  const dismissMenu = () => {
    if (menuVisible) setMenuVisible(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={dismissMenu}>
        <View style={{ flex: 1 }}>

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
                    <FontAwesome5 name="chart-line" size={27} color={focused ? "black" : "grey"} />
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
                    <FontAwesome5 name="home" size={27} color={focused ? "black" : 'grey'} />
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
                    <FontAwesome5 name="newspaper" size={28} color={focused ? "black" : 'grey     '} />
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
                onPress={() => handleMenuOption("Add Task")}
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
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    backgroundColor: "#DADADA",
    borderRadius: 40,
    borderEndEndRadius: 50,
    borderEndStartRadius: 50,
    shadowColor: "transparent",
    paddingHorizontal: 5,
  },

  floatingButton: {
    width: 60,
    height: 55,
    backgroundColor: "#DADADA",
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
    backgroundColor: "#DDD", // Line color
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

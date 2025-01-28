import React from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Slot, useRouter } from "expo-router";
import { format } from "date-fns"; // Import date-fns for formatting today's date
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const categories = [
  { name: "Today", route: "/(tabs)/(tasks)/Today" },
  { name: "Upcoming", route: "/(tabs)/(tasks)/Upcoming" },
  { name: "Todo", route: "/(tabs)/(tasks)/TodoScreen" },
];

const TasksLayout = () => {

  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("Today");
  const todayDate = format(new Date(), "MMM, dd ");
  const todayDay = format(new Date(), "EEEE");



  const [showHeader, setShowHeader] = React.useState(true);

  const handleTabPress = (category: { name: string; route: string }) => {
    setActiveTab(category.name);

    // Determine whether to show the header based on the current route
    (category.name === "Today") ? setShowHeader(true) : setShowHeader(false);
    router.push(category.route as any);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.dateText}>{todayDate}
            <Text style={{ color: 'grey', fontSize: 20 }}>  {todayDay}</Text>
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/Profile')}>
            <FontAwesome6 name="user-astronaut" size={30} color="black" />
          </TouchableOpacity>
          {/*<EvilIcons name="user" size={40} color="black"> */}

        </View>
      )}
      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tabButton, activeTab === category.name && styles.activeTabButton]}
              onPress={() => handleTabPress(category)}
            >
              <Text style={[styles.tabText, activeTab === category.name && styles.activeTabText]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Render Nested Screens */}
      <Slot />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  dateText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  container: {
    backgroundColor: "#FFF",
    height: 50,
  },
  scrollContainer: {
    flexDirection: "row",
    padding: 5,
    backgroundColor: "#FFF",
  },
  tabButton: {
    backgroundColor: "#f7f7f7",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  tabText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
  },
  activeTabButton: {
    backgroundColor: 'black', //"#FF6A3D",
  },
  activeTabText: {
    color: "#FFF", // Active text color
  },
});

export default TasksLayout;

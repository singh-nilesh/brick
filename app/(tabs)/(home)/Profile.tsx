import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const Profile = () => {
  const router = useRouter();
  

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/(tasks)/Today")}>
        <Text style={styles.backButtonText}>Back to Tasks</Text>
      </TouchableOpacity>
      <Text style={styles.text}>Welcome to the Profile Page!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 20,
    padding: 10,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "black",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});

export default Profile;
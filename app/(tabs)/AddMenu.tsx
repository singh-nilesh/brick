import React, { useState, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import SpeechToText from "@/components/SpeechToText";

export default function AddMenu() {
  const [menuVisible, setMenuVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [speechToTextVisible, setSpeechToTextVisible] = useState(false);

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 0, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  };

  const menuItems: { icon: "plus" | "camera" | "mic"; angle: number; onPress: () => void }[] = [
    { icon: "camera", angle: 225, onPress: () => console.log("Camera Clicked!") },
    { icon: "plus", angle: 270, onPress: () => console.log("Plus Clicked!") },
    { icon: "mic", angle: 315, onPress: () => {setSpeechToTextVisible(true); setMenuVisible(false);} },
  ];

  return (
    <View style={styles.fabContainer}>
      {menuVisible &&
        menuItems.map((item) => {
          const angleRad = (item.angle * Math.PI) / 180;
          const radius = 80;

          return (
            <Animated.View
              key={item.icon}
              style={[
                styles.menuItem,
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateX: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, radius * Math.cos(angleRad)] }) },
                    { translateY: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, radius * Math.sin(angleRad)] }) },
                  ],
                  opacity: opacityAnim,
                },
              ]}
            >
              <TouchableOpacity style={styles.fabMiniItem} onPress={item.onPress}>
                <Feather name={item.icon} size={20} color="white" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

      <TouchableOpacity style={styles.fab} onPress={toggleMenu}>
        <Feather name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/*Speech to text visible */
      speechToTextVisible && <SpeechToText visible={speechToTextVisible} closeModal={() => setSpeechToTextVisible(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 13,
    alignSelf: "center",
  },
  fab: {
    width: 45,
    height: 45,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    elevation: 2,
  },
  menuItem: {
    position: "absolute",
    alignItems: "stretch",
  },
  fabMiniItem: {
    width: 45,
    height: 45,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginVertical: 5,
  },
});


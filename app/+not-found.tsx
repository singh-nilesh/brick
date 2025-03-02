import { Link, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Text, View } from '../components/Themed';
import React from 'react';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{headerShown:false}} />
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  }
});

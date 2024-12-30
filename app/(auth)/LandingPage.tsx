import { View, Text, StyleSheet, Button, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useOAuth } from '@clerk/clerk-expo'
import * as WebBrowser from 'expo-web-browser'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';

const LandingPage = () => {

  const router = useRouter();

  // Google Authentication
  const { startOAuthFlow: googleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const handelGoogleAuth = async () => {
    try {
      // creates a session ID and sets it as active
      const { createdSessionId, setActive } = await googleOAuth();

      if (createdSessionId) {
        setActive!({ session: createdSessionId })
        router.replace('/TaskScreen'); // Navigate to TaskScreen
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  // Apple Authentication
  const { startOAuthFlow: appleOAuth } = useOAuth({ strategy: 'oauth_apple' });
  const handelAppleAuth = async () => {
    try {
      const { createdSessionId, setActive } = await appleOAuth();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.replace('/TaskScreen'); // Navigate to TaskScreen
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  // Link for FAQ 
  const openLink = async () => {
    WebBrowser.openBrowserAsync('https://www.google.com')
  }

  return (
    <View style={styles.container}>

      <Text style={styles.titleText}>Join us and build your career,</Text>
      <Text style={styles.titleText}>one brick at a time.</Text>

      <Image source={require('@/assets/images/brickStack.png')} style={styles.bannerImage} />

      <View style={styles.buttonContainer}>

        <TouchableOpacity style={styles.buttons} onPress={handelGoogleAuth}>
          <Ionicons  name="logo-google" size={24} color="black" />
          <Text> Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttons} onPress={handelAppleAuth}>
        <Ionicons name="logo-apple" size={24} color="black" />
          <Text> Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttons} onPress={() => router.push('/(auth)/Login')}>
        <Ionicons name="mail" size={24} color="black" />
          <Text> Continue with Email</Text>
        </TouchableOpacity>

        <Text style={{paddingVertical: 40}}>
          <Text style={styles.description}>By continuing, you agree to our </Text>
          <TouchableOpacity onPress={openLink}>
            <Text style={styles.link}>Terms of Service and Privacy Policy</Text>
          </TouchableOpacity>
        </Text>

      </View>

    </View>
  )
}

export default LandingPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 25,
    paddingVertical: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bannerImage: {
    height: 350,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    gap: 10,
    marginHorizontal: 20,
  },
  buttons: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  description:{
    fontSize: 12,
    color: 'grey',
    textAlign: 'center',
  },
  link:{
    color: 'grey',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
  }
});
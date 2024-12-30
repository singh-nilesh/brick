import { View, Text } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const index = () => {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/TaskScreen'} />
  }
  else {
    return <Redirect href={'/LandingPage'} />
  }
}

export default index
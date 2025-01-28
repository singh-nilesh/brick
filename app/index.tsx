import React from 'react'
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const index = () => {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/(tabs)/(home)/(tasks)/Today'} />
  }
  else {
    return <Redirect href={'/LandingPage'} />
  }
}

export default index
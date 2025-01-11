import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/(tabs)/(tasks)/Today'} />
  }

  return (
    <Stack>
      <Stack.Screen name='LandingPage' options={{headerShown:false}}/>
      <Stack.Screen name='Login' options={{ headerTitle:'Email Login'}}/>
      <Stack.Screen name='Register' options={{ headerTitle:"Register User"}}/>
      <Stack.Screen name='PwReset' options={{ headerTitle:'Password Reset'}}/>
    </Stack>
  )
}
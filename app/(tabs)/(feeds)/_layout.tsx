import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
  return (
    <Stack>
        <Stack.Screen name="WebFeeds" options={{headerShown:false}} />
        <Stack.Screen name="ExplorePage" options={{headerShown:false}} />
        <Stack.Screen name="AddPost" options={{headerShown:false}} />
    </Stack>
  )
}

export default _layout
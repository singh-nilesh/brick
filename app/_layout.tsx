import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Suspense, useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@/cache';
import { SQLiteProvider } from 'expo-sqlite';
import { ActivityIndicator, View, Text } from 'react-native';
import { migrateDbIfNeeded } from '@/utils/Database';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


// main Function
export default function RootLayout() {

  // Load fonts and hide the splash screen when they're ready.
  const [fontLoaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded]);

  if (!fontLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}



// edited section
const RootLayoutNav = () => {
  const colorScheme = useColorScheme();
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env')
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>

        <GestureHandlerRootView>
          <SafeAreaProvider>
            { /* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}

              <Suspense fallback={<Fallback />}>
                <SQLiteProvider databaseName="brick.db" onInit={migrateDbIfNeeded} useSuspense>

                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                  </Stack>

                </SQLiteProvider>
              </Suspense>
              
            {/* </ThemeProvider> */}
          </SafeAreaProvider>
        </GestureHandlerRootView>

      </ClerkLoaded>
    </ClerkProvider>
  );
}

function Fallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator  size="large" color="#0000ff"/>
      <Text>Loading Database...</Text>
    </View>
  )
}
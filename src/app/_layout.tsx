import { Stack } from 'expo-router';
import { View, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  Figtree_900Black,
} from '@expo-google-fonts/figtree';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { initDatabase } from '@/lib/database';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();
// setOptions is a dev-build API — calling it in Expo Go only logs a warning.
if (Constants.appOwnership !== 'expo') {
  SplashScreen.setOptions({
    duration: 800,
    fade: true,
  });
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
    Figtree_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    initDatabase();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider initialWindowMetrics={initialWindowMetrics}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaProvider>
  );
}

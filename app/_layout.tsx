import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider as ReduxProvider } from 'react-redux';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { initializeDatabase } from '../src/services/database/dbInit';
import { store } from '../src/store';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Initialize database on app start
  useEffect(() => {
    initializeDatabase().catch((error) => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, segments, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Fallback: Force hide splash screen after 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync().catch(console.error);
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="document" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

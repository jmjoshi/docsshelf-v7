// Polyfills for jszip (must be first)
import { Buffer } from 'buffer';
import process from 'process';
global.Buffer = Buffer;
global.process = process;

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-reanimated';
import { Provider as ReduxProvider } from 'react-redux';

// Disable LogBox completely in production
if (!__DEV__) {
  LogBox.ignoreAllLogs();
} else {
  // Only ignore specific non-critical warnings in development
  LogBox.ignoreLogs([
    'Unable to activate keep awake', // Non-critical: screen dimming is fine during development
  ]);
}

// Suppress non-critical unhandled promise rejections
const isNonCriticalError = (error: any) => {
  const message = error?.message || String(error);
  return message.includes('Unable to activate keep awake');
};

// Handle unhandled promise rejections globally
if (typeof global.addEventListener === 'function') {
  global.addEventListener('unhandledrejection', (event: any) => {
    if (isNonCriticalError(event.reason)) {
      event.preventDefault();
      return;
    }
  });
}

import { PersistentBottomNav } from '../components/PersistentBottomNav';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { Toast } from '../src/components/common/Toast';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { initializeDatabase } from '../src/services/database/dbInit';
import { store } from '../src/store';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Suppress splash screen initialization errors
});

// Suppress non-critical error messages in console (development only)
if (__DEV__) {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string') {
      // Suppress splash screen errors (common on iOS with modals)
      if (args[0].includes('No native splash screen registered')) {
        return;
      }
      // Suppress keep-awake errors (non-critical development warning)
      if (args[0].includes('Unable to activate keep awake')) {
        return;
      }
    }
    
    // Check for Error objects with keep-awake message
    if (args[0] instanceof Error && args[0].message?.includes('Unable to activate keep awake')) {
      return;
    }
    
    originalError(...args);
  };
}

function RootLayoutNav() {
  const { colorScheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Initialize database on app start with timeout
  useEffect(() => {
    console.log('[App] Initializing database...');
    const timeoutId = setTimeout(() => {
      console.warn('[App] Database initialization timed out after 5s');
    }, 5000);

    initializeDatabase()
      .then(() => {
        console.log('[App] Database initialized successfully');
        clearTimeout(timeoutId);
      })
      .catch((error) => {
        console.error('[App] Failed to initialize database:', error);
        clearTimeout(timeoutId);
      });

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (isLoading) {
      console.log('[App] Still loading auth state...');
      return;
    }

    console.log('[App] Auth loading complete. Authenticated:', isAuthenticated);
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      console.log('[App] Redirecting to login');
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated
      console.log('[App] Redirecting to tabs');
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, segments, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      console.log('[App] Hiding splash screen');
      SplashScreen.hideAsync().catch((err) => {
        console.log('[App] Splash screen already hidden or error:', err);
      });
    }
  }, [isLoading]);

  // Fallback: Force hide splash screen after 5 seconds
  useEffect(() => {
    console.log('[App] Setting up 5-second splash screen timeout');
    const timeout = setTimeout(() => {
      console.warn('[App] Force hiding splash screen after 5s timeout');
      SplashScreen.hideAsync().catch(() => {
        console.log('[App] Splash screen already hidden');
      });
    }, 5000);
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
        <Stack.Screen 
          name="document" 
          options={{ 
            presentation: 'card',
            animation: 'slide_from_right'
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            presentation: 'card',
            animation: 'slide_from_right'
          }} 
        />
        <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <PersistentBottomNav />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <Toast>
          <AuthProvider>
            <CustomThemeProvider>
              <RootLayoutNav />
            </CustomThemeProvider>
          </AuthProvider>
        </Toast>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

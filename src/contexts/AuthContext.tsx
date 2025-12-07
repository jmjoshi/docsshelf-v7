import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { endSession, isSessionValid, startActivityMonitoring, startSession, stopActivityMonitoring } from '../services/auth/sessionService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Set up session monitoring when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('[Auth] Starting session monitoring');
      startActivityMonitoring(() => {
        // Session expired callback
        console.log('[Auth] Session expired callback triggered');
        stopActivityMonitoring(); // Stop immediately to prevent loops
        Alert.alert(
          'Session Expired',
          'Your session has expired due to inactivity. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                logout();
              },
            },
          ]
        );
      });
    } else if (!isAuthenticated) {
      console.log('[Auth] Stopping session monitoring (not authenticated)');
      stopActivityMonitoring();
    }

    return () => {
      stopActivityMonitoring();
    };
  }, [isAuthenticated, isLoading]);

  const checkAuthStatus = async () => {
    try {
      console.log('[Auth] Checking auth status...');
      
      const authStatus = await SecureStore.getItemAsync('user_authenticated');
      console.log('[Auth] Auth status from SecureStore:', authStatus);
      
      if (authStatus === 'true') {
        // Check session validity with timeout
        const validSession = await Promise.race([
          isSessionValid(),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000))
        ]);
        
        console.log('[Auth] Session valid:', validSession);
        
        if (validSession) {
          setIsAuthenticated(true);
        } else {
          // Session expired, clean up and show login
          console.log('[Auth] Session expired, clearing auth');
          await SecureStore.deleteItemAsync('user_authenticated');
          await endSession(); // Make sure session is cleared
          setIsAuthenticated(false);
        }
      } else {
        console.log('[Auth] No auth status found, user not authenticated');
        setIsAuthenticated(false);
      }
      
      console.log('[Auth] Auth check completed');
    } catch (e) {
      console.warn('[Auth] Auth check failed:', e);
      // On error, assume not authenticated
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      console.log('[Auth] Auth loading complete');
    }
  };

  const login = async () => {
    await SecureStore.setItemAsync('user_authenticated', 'true');
    await startSession();
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('user_authenticated');
    await endSession();
    stopActivityMonitoring();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

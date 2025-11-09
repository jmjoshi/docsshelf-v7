import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { startSession, endSession, startActivityMonitoring, stopActivityMonitoring, isSessionValid } from '../services/auth/sessionService';

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
    if (isAuthenticated) {
      startActivityMonitoring(() => {
        // Session expired callback
        console.log('[Auth] Session expired, logging out');
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
    } else {
      stopActivityMonitoring();
    }

    return () => {
      stopActivityMonitoring();
    };
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await SecureStore.getItemAsync('user_authenticated');
      if (authStatus === 'true') {
        // Check if session is still valid
        const validSession = await isSessionValid();
        if (validSession) {
          setIsAuthenticated(true);
        } else {
          // Session expired, clear auth status
          await SecureStore.deleteItemAsync('user_authenticated');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.warn('Auth check failed:', e);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
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

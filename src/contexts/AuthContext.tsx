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
      console.log('[Auth] Checking auth status...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth check timeout')), 3000)
      );
      
      const authCheckPromise = async () => {
        const authStatus = await SecureStore.getItemAsync('user_authenticated');
        console.log('[Auth] Auth status from SecureStore:', authStatus);
        
        if (authStatus === 'true') {
          const validSession = await isSessionValid();
          console.log('[Auth] Session valid:', validSession);
          
          if (validSession) {
            setIsAuthenticated(true);
          } else {
            await SecureStore.deleteItemAsync('user_authenticated');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      };
      
      await Promise.race([authCheckPromise(), timeoutPromise]);
      console.log('[Auth] Auth check completed');
    } catch (e) {
      console.warn('[Auth] Auth check failed or timed out:', e);
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

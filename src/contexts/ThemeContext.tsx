/**
 * Theme Context
 * Provides app-wide theme state based on user preferences
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { getPreferences } from '../services/database/preferenceService';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  refreshTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user's dark mode preference from database
  const loadThemePreference = async () => {
    try {
      const prefs = await getPreferences();
      // Use user preference if set, otherwise follow system
      const preferredScheme = prefs.darkMode ? 'dark' : 'light';
      setColorSchemeState(preferredScheme);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      // Fallback to system preference
      setColorSchemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
      setIsInitialized(true);
    }
  };

  // Initial load
  useEffect(() => {
    loadThemePreference();
  }, []);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
  };

  const refreshTheme = async () => {
    await loadThemePreference();
  };

  // Don't render children until theme is initialized to avoid flash
  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

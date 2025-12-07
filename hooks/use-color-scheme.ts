/**
 * Custom useColorScheme hook that reads from user preferences via ThemeContext
 * This replaces React Native's useColorScheme to support user-controlled dark mode
 */
import { ThemeContext } from '@/src/contexts/ThemeContext';
import { useContext } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme() {
  const themeContext = useContext(ThemeContext);
  
  // If ThemeContext is available, use it (user preference)
  if (themeContext) {
    return themeContext.colorScheme;
  }
  
  // Fallback to system color scheme if context not available
  return useSystemColorScheme();
}

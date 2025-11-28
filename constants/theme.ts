/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  primary: '#007AFF',
  secondary: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  success: '#34C759',
  info: '#3b82f6',
  
  // Semantic colors for status indicators
  status: {
    online: '#10b981',      // green-500
    offline: '#6b7280',     // gray-500
    pending: '#f59e0b',     // amber-500
    syncing: '#3b82f6',     // blue-500
    error: '#ef4444',       // red-500
    success: '#10b981',     // green-500
    warning: '#f59e0b',     // amber-500
  },
  
  // Category colors (for document organization)
  category: {
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    yellow: '#f59e0b',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6',
    orange: '#f97316',
    gray: '#6b7280',
  },
  
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#9BA1A6',
    background: '#fff',
    backgroundSecondary: '#f9fafb',    // gray-50
    backgroundTertiary: '#f3f4f6',     // gray-100
    border: '#e5e7eb',                  // gray-200
    borderSecondary: '#d1d5db',         // gray-300
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#6b7280',
    background: '#151718',
    backgroundSecondary: '#1c1c1e',     // iOS dark secondary
    backgroundTertiary: '#2c2c2e',      // iOS dark tertiary
    border: '#38383a',                   // iOS dark border
    borderSecondary: '#48484a',          // iOS dark border secondary
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: '#1c1c1e',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

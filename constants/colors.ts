/**
 * DocsShelf Color System
 * Professional, accessible color palette
 */

export const Colors = {
  // Primary Brand Colors
  primary: {
    main: '#2563EB', // Professional blue
    light: '#3B82F6',
    dark: '#1E40AF',
    contrast: '#FFFFFF',
  },

  // Secondary Colors
  secondary: {
    main: '#10B981', // Success green
    light: '#34D399',
    dark: '#059669',
    contrast: '#FFFFFF',
  },

  // Accent Colors
  accent: {
    main: '#8B5CF6', // Purple accent
    light: '#A78BFA',
    dark: '#7C3AED',
    contrast: '#FFFFFF',
  },

  // Neutral/Gray Scale
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic Colors
  success: {
    main: '#10B981',
    light: '#D1FAE5',
    dark: '#065F46',
  },

  error: {
    main: '#EF4444',
    light: '#FEE2E2',
    dark: '#991B1B',
  },

  warning: {
    main: '#F59E0B',
    light: '#FEF3C7',
    dark: '#92400E',
  },

  info: {
    main: '#3B82F6',
    light: '#DBEAFE',
    dark: '#1E3A8A',
  },

  // Background Colors
  background: {
    default: '#FFFFFF',
    paper: '#F9FAFB',
    elevated: '#FFFFFF',
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    hint: '#9CA3AF',
    placeholder: '#9CA3AF',
  },

  // Border Colors
  border: {
    light: '#E5E7EB',
    main: '#D1D5DB',
    dark: '#9CA3AF',
  },

  // Surface Colors (for cards, modals, etc.)
  surface: {
    default: '#FFFFFF',
    hover: '#F9FAFB',
    active: '#F3F4F6',
  },
};

// Shadow configurations
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

// Border Radius
export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Spacing (matches Tailwind spacing scale)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// Typography
export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Animation Durations
export const Duration = {
  fast: 150,
  normal: 300,
  slow: 500,
};

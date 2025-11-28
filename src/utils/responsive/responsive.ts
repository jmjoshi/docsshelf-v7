/**
 * Responsive Design Utilities
 * Helpers for tablet layouts and different screen sizes
 */

import { Dimensions, Platform, ScaledSize } from 'react-native';

export interface ScreenDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

/**
 * Get current screen dimensions
 */
export const getScreenDimensions = (): ScreenDimensions => {
  const { width, height, scale, fontScale } = Dimensions.get('window');
  return { width, height, scale, fontScale };
};

/**
 * Device types
 */
export enum DeviceType {
  PHONE_SMALL = 'phone-small',      // < 375px (iPhone SE)
  PHONE = 'phone',                  // 375-767px
  TABLET_SMALL = 'tablet-small',    // 768-1023px (iPad Mini)
  TABLET = 'tablet',                // 1024px+ (iPad Pro)
}

/**
 * Get device type based on screen width
 */
export const getDeviceType = (): DeviceType => {
  const { width } = getScreenDimensions();
  
  if (width < 375) {
    return DeviceType.PHONE_SMALL;
  } else if (width < 768) {
    return DeviceType.PHONE;
  } else if (width < 1024) {
    return DeviceType.TABLET_SMALL;
  } else {
    return DeviceType.TABLET;
  }
};

/**
 * Check if device is a tablet
 */
export const isTablet = (): boolean => {
  const deviceType = getDeviceType();
  return deviceType === DeviceType.TABLET || deviceType === DeviceType.TABLET_SMALL;
};

/**
 * Check if device is a phone
 */
export const isPhone = (): boolean => {
  return !isTablet();
};

/**
 * Check if device is small phone (iPhone SE size)
 */
export const isSmallPhone = (): boolean => {
  return getDeviceType() === DeviceType.PHONE_SMALL;
};

/**
 * Orientation types
 */
export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

/**
 * Get current orientation
 */
export const getOrientation = (): Orientation => {
  const { width, height } = getScreenDimensions();
  return width > height ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
};

/**
 * Check if device is in landscape mode
 */
export const isLandscape = (): boolean => {
  return getOrientation() === Orientation.LANDSCAPE;
};

/**
 * Check if device is in portrait mode
 */
export const isPortrait = (): boolean => {
  return getOrientation() === Orientation.PORTRAIT;
};

/**
 * Responsive value selector
 * Returns different values based on device type
 */
export const responsiveValue = <T>(values: {
  phoneSmall?: T;
  phone?: T;
  tabletSmall?: T;
  tablet?: T;
  default: T;
}): T => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case DeviceType.PHONE_SMALL:
      return values.phoneSmall ?? values.phone ?? values.default;
    case DeviceType.PHONE:
      return values.phone ?? values.default;
    case DeviceType.TABLET_SMALL:
      return values.tabletSmall ?? values.tablet ?? values.default;
    case DeviceType.TABLET:
      return values.tablet ?? values.default;
    default:
      return values.default;
  }
};

/**
 * Responsive font size
 */
export const responsiveFontSize = (baseSize: number): number => {
  return responsiveValue({
    phoneSmall: baseSize * 0.9,
    phone: baseSize,
    tabletSmall: baseSize * 1.1,
    tablet: baseSize * 1.2,
    default: baseSize,
  });
};

/**
 * Responsive spacing
 */
export const responsiveSpacing = (baseSpacing: number): number => {
  return responsiveValue({
    phoneSmall: baseSpacing * 0.8,
    phone: baseSpacing,
    tabletSmall: baseSpacing * 1.2,
    tablet: baseSpacing * 1.5,
    default: baseSpacing,
  });
};

/**
 * Number of columns for grid layout
 */
export const getGridColumns = (): number => {
  return responsiveValue({
    phoneSmall: 1,
    phone: 1,
    tabletSmall: 2,
    tablet: 3,
    default: 1,
  });
};

/**
 * Maximum content width (for readability on large screens)
 */
export const getMaxContentWidth = (): number => {
  return responsiveValue({
    phoneSmall: Dimensions.get('window').width,
    phone: Dimensions.get('window').width,
    tabletSmall: 720,
    tablet: 960,
    default: Dimensions.get('window').width,
  });
};

/**
 * Responsive padding for content containers
 */
export const getContainerPadding = (): number => {
  return responsiveValue({
    phoneSmall: 12,
    phone: 16,
    tabletSmall: 24,
    tablet: 32,
    default: 16,
  });
};

/**
 * Check if device supports split view (iPad)
 */
export const supportsSplitView = (): boolean => {
  return Platform.OS === 'ios' && isTablet();
};

/**
 * Responsive card width
 */
export const getCardWidth = (numberOfColumns?: number): number => {
  const { width } = getScreenDimensions();
  const padding = getContainerPadding();
  const gap = 16;
  const columns = numberOfColumns ?? getGridColumns();
  
  if (columns === 1) {
    return width - (padding * 2);
  }
  
  return (width - (padding * 2) - (gap * (columns - 1))) / columns;
};

/**
 * Hook to listen for dimension changes
 * Call onChange when screen dimensions change
 */
export const subscribeToScreenChanges = (
  onChange: (dimensions: ScaledSize) => void
): (() => void) => {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    onChange(window);
  });
  
  return () => subscription?.remove();
};

/**
 * Responsive breakpoints (similar to Tailwind CSS)
 */
export const Breakpoints = {
  xs: 0,      // Extra small (all phones)
  sm: 375,    // Small (iPhone 6+)
  md: 768,    // Medium (tablets portrait)
  lg: 1024,   // Large (tablets landscape)
  xl: 1280,   // Extra large (large tablets)
} as const;

/**
 * Check if screen width is above a breakpoint
 */
export const isAboveBreakpoint = (breakpoint: keyof typeof Breakpoints): boolean => {
  const { width } = getScreenDimensions();
  return width >= Breakpoints[breakpoint];
};

/**
 * Check if screen width is below a breakpoint
 */
export const isBelowBreakpoint = (breakpoint: keyof typeof Breakpoints): boolean => {
  const { width } = getScreenDimensions();
  return width < Breakpoints[breakpoint];
};

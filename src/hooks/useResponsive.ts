/**
 * useResponsive Hook
 * React hook for responsive design with real-time updates
 */

import { useEffect, useState } from 'react';
import {
  DeviceType,
  getDeviceType,
  getOrientation,
  getScreenDimensions,
  isTablet,
  Orientation,
  ScreenDimensions,
  subscribeToScreenChanges,
} from '../utils/responsive/responsive';

interface ResponsiveState {
  dimensions: ScreenDimensions;
  deviceType: DeviceType;
  isTablet: boolean;
  isPhone: boolean;
  orientation: Orientation;
  isLandscape: boolean;
  isPortrait: boolean;
}

/**
 * Hook to get current responsive state with automatic updates
 */
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    dimensions: getScreenDimensions(),
    deviceType: getDeviceType(),
    isTablet: isTablet(),
    isPhone: !isTablet(),
    orientation: getOrientation(),
    isLandscape: getOrientation() === Orientation.LANDSCAPE,
    isPortrait: getOrientation() === Orientation.PORTRAIT,
  });

  useEffect(() => {
    const unsubscribe = subscribeToScreenChanges(() => {
      setState({
        dimensions: getScreenDimensions(),
        deviceType: getDeviceType(),
        isTablet: isTablet(),
        isPhone: !isTablet(),
        orientation: getOrientation(),
        isLandscape: getOrientation() === Orientation.LANDSCAPE,
        isPortrait: getOrientation() === Orientation.PORTRAIT,
      });
    });

    return unsubscribe;
  }, []);

  return state;
};

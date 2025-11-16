/**
 * Camera Service
 * Handles camera permissions and image capture for document scanning
 * Part of FR-MAIN-003: Document Scanning Feature
 * Uses expo-camera v17+ API
 */

import { Camera } from 'expo-camera';
import { Alert, Linking, Platform } from 'react-native';
import type { CameraPermissionStatus } from '../../types/scan.types';

class CameraService {
  /**
   * Request camera permissions from the user
   * @returns Promise resolving to permission status
   */
  async requestPermissions(): Promise<boolean> {
    try {
      console.log('[CameraService] Requesting camera permissions...');
      const { status, canAskAgain, granted } = await Camera.requestCameraPermissionsAsync();
      
      console.log('[CameraService] Permission result:', { status, canAskAgain, granted });
      
      if (status !== 'granted') {
        if (canAskAgain) {
          Alert.alert(
            'Camera Permission Required',
            'DocsShelf needs access to your camera to scan documents.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Grant Permission', 
                onPress: async () => {
                  await this.requestPermissions();
                }
              }
            ]
          );
        } else {
          // Permission permanently denied, need to open settings
          Alert.alert(
            'Camera Access Denied',
            'Please enable camera access in Settings to scan documents.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
        }
        return false;
      }

      console.log('[CameraService] Camera permission granted');
      return true;
    } catch (error) {
      console.error('[CameraService] Error requesting camera permissions:', error);
      Alert.alert(
        'Permission Error',
        'Failed to request camera permissions. Please try again.'
      );
      return false;
    }
  }

  /**
   * Check current camera permission status without requesting
   * @returns Promise resolving to permission status
   */
  async checkPermissions(): Promise<CameraPermissionStatus> {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      
      if (status === 'granted') return 'granted';
      if (status === 'denied') return 'denied';
      return 'undetermined';
    } catch (error) {
      console.error('[CameraService] Error checking camera permissions:', error);
      return 'denied';
    }
  }

  /**
   * Check if device has a camera available
   * @returns Promise resolving to camera availability
   */
  async hasCamera(): Promise<boolean> {
    try {
      // Check if camera permissions can be requested (indicates camera exists)
      const { status } = await Camera.getCameraPermissionsAsync();
      return status !== undefined;
    } catch (error) {
      console.error('[CameraService] Error checking camera availability:', error);
      return false;
    }
  }

  /**
   * Get supported flash modes for the device
   * @returns Array of supported flash modes
   */
  getSupportedFlashModes(): Array<'on' | 'off' | 'auto'> {
    // All devices support off mode
    return ['off', 'on', 'auto'];
  }

  /**
   * Convert flash mode string to valid flash mode
   */
  getFlashModeValue(mode: string): 'on' | 'off' | 'auto' {
    switch (mode) {
      case 'on':
        return 'on';
      case 'auto':
        return 'auto';
      case 'off':
      default:
        return 'off';
    }
  }

  /**
   * Show error alert for camera issues
   */
  showCameraError(message: string): void {
    Alert.alert('Camera Error', message, [{ text: 'OK' }]);
  }

  /**
   * Show error alert for camera not available
   */
  showCameraUnavailable(): void {
    Alert.alert(
      'Camera Unavailable',
      'Your device does not have a camera or it is not accessible. Please use the file upload option instead.',
      [{ text: 'OK' }]
    );
  }
}

// Export singleton instance
export const cameraService = new CameraService();
export default cameraService;

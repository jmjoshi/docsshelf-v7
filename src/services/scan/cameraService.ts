/**
 * Camera Service
 * Handles camera permissions and image capture for document scanning
 * Part of FR-MAIN-003: Document Scanning Feature
 */

import { Camera, FlashMode } from 'expo-camera';
import { Alert, Platform } from 'react-native';
import type { CameraPermissionStatus } from '../../types/scan.types';

class CameraService {
  /**
   * Request camera permissions from the user
   * @returns Promise resolving to permission status
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'DocsShelf needs access to your camera to scan documents. Please enable camera access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  // On iOS, user needs to manually go to Settings
                  Alert.alert(
                    'Enable Camera Access',
                    'Go to Settings > DocsShelf > Camera and enable access.'
                  );
                }
              }
            }
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
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
      console.error('Error checking camera permissions:', error);
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
      console.error('Error checking camera availability:', error);
      return false;
    }
  }

  /**
   * Get supported flash modes for the device
   * @returns Array of supported flash modes
   */
  getSupportedFlashModes(): FlashMode[] {
    // All devices support off mode
    return ['off', 'on', 'auto'];
  }

  /**
   * Convert flash mode string to expo-camera FlashMode enum
   */
  getFlashModeValue(mode: string): FlashMode {
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

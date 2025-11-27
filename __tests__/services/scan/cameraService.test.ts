/**
 * Camera Service Tests
 * Tests for FR-MAIN-003: Document Scanning Feature
 * Covers camera permissions, hardware detection, and error handling
 */

import { cameraService } from '../../../src/services/scan/cameraService';
import { Camera } from 'expo-camera';
import { Alert, Linking, Platform } from 'react-native';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
    getCameraPermissionsAsync: jest.fn(),
  },
}));

// Mock react-native modules
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    openSettings: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('CameraService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestPermissions', () => {
    it('should return true when permission is granted', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
      });

      const result = await cameraService.requestPermissions();

      expect(result).toBe(true);
      expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    it('should return false when permission is denied but can ask again', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
        canAskAgain: true,
        granted: false,
      });

      const result = await cameraService.requestPermissions();

      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Camera Permission Required',
        'DocsShelf needs access to your camera to scan documents.',
        expect.any(Array)
      );
    });

    it('should show settings alert when permission is permanently denied', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
        granted: false,
      });

      const result = await cameraService.requestPermissions();

      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Camera Access Denied',
        'Please enable camera access in Settings to scan documents.',
        expect.any(Array)
      );
    });

    it('should handle iOS settings navigation', async () => {
      Platform.OS = 'ios';
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
        granted: false,
      });

      await cameraService.requestPermissions();

      // Trigger the "Open Settings" button
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const lastCall = alertCalls[alertCalls.length - 1];
      const buttons = lastCall[2];
      const openSettingsButton = buttons.find((btn: any) => btn.text === 'Open Settings');
      
      if (openSettingsButton?.onPress) {
        openSettingsButton.onPress();
        expect(Linking.openURL).toHaveBeenCalledWith('app-settings:');
      }
    });

    it('should handle Android settings navigation', async () => {
      Platform.OS = 'android';
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
        granted: false,
      });

      await cameraService.requestPermissions();

      // Trigger the "Open Settings" button
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const lastCall = alertCalls[alertCalls.length - 1];
      const buttons = lastCall[2];
      const openSettingsButton = buttons.find((btn: any) => btn.text === 'Open Settings');
      
      if (openSettingsButton?.onPress) {
        openSettingsButton.onPress();
        expect(Linking.openSettings).toHaveBeenCalled();
      }
    });

    it('should handle errors during permission request', async () => {
      const error = new Error('Permission request failed');
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(error);

      const result = await cameraService.requestPermissions();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        '[CameraService] Error requesting camera permissions:',
        error
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Error',
        'Failed to request camera permissions. Please try again.'
      );
    });

    it('should log permission request flow', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
      });

      await cameraService.requestPermissions();

      expect(console.log).toHaveBeenCalledWith(
        '[CameraService] Requesting camera permissions...'
      );
      expect(console.log).toHaveBeenCalledWith(
        '[CameraService] Permission result:',
        { status: 'granted', canAskAgain: true, granted: true }
      );
      expect(console.log).toHaveBeenCalledWith(
        '[CameraService] Camera permission granted'
      );
    });
  });

  describe('checkPermissions', () => {
    it('should return "granted" when permission is granted', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await cameraService.checkPermissions();

      expect(result).toBe('granted');
      expect(Camera.getCameraPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    it('should return "denied" when permission is denied', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await cameraService.checkPermissions();

      expect(result).toBe('denied');
    });

    it('should return "undetermined" when permission is undetermined', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const result = await cameraService.checkPermissions();

      expect(result).toBe('undetermined');
    });

    it('should return "denied" on error', async () => {
      const error = new Error('Check permission failed');
      (Camera.getCameraPermissionsAsync as jest.Mock).mockRejectedValue(error);

      const result = await cameraService.checkPermissions();

      expect(result).toBe('denied');
      expect(console.error).toHaveBeenCalledWith(
        '[CameraService] Error checking camera permissions:',
        error
      );
    });
  });

  describe('hasCamera', () => {
    it('should return true when camera is available', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await cameraService.hasCamera();

      expect(result).toBe(true);
    });

    it('should return true even when permission is denied (camera exists)', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await cameraService.hasCamera();

      expect(result).toBe(true);
    });

    it('should return false on error (camera likely unavailable)', async () => {
      const error = new Error('Camera not found');
      (Camera.getCameraPermissionsAsync as jest.Mock).mockRejectedValue(error);

      const result = await cameraService.hasCamera();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        '[CameraService] Error checking camera availability:',
        error
      );
    });
  });

  describe('getSupportedFlashModes', () => {
    it('should return all flash modes', () => {
      const modes = cameraService.getSupportedFlashModes();

      expect(modes).toEqual(['off', 'on', 'auto']);
      expect(modes).toHaveLength(3);
    });

    it('should always include "off" mode', () => {
      const modes = cameraService.getSupportedFlashModes();

      expect(modes).toContain('off');
    });
  });

  describe('getFlashModeValue', () => {
    it('should return "on" for "on" input', () => {
      expect(cameraService.getFlashModeValue('on')).toBe('on');
    });

    it('should return "off" for "off" input', () => {
      expect(cameraService.getFlashModeValue('off')).toBe('off');
    });

    it('should return "auto" for "auto" input', () => {
      expect(cameraService.getFlashModeValue('auto')).toBe('auto');
    });

    it('should return "off" for invalid input', () => {
      expect(cameraService.getFlashModeValue('invalid')).toBe('off');
    });

    it('should return "off" for empty string', () => {
      expect(cameraService.getFlashModeValue('')).toBe('off');
    });
  });

  describe('showCameraError', () => {
    it('should show alert with error message', () => {
      const errorMessage = 'Camera initialization failed';

      cameraService.showCameraError(errorMessage);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Camera Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    });

    it('should show alert with custom error message', () => {
      const errorMessage = 'Flash mode not supported';

      cameraService.showCameraError(errorMessage);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Camera Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    });
  });

  describe('showCameraUnavailable', () => {
    it('should show alert for camera unavailable', () => {
      cameraService.showCameraUnavailable();

      expect(Alert.alert).toHaveBeenCalledWith(
        'Camera Unavailable',
        'Your device does not have a camera or it is not accessible. Please use the file upload option instead.',
        [{ text: 'OK' }]
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete permission flow with retry', async () => {
      // First request denied but can ask again
      (Camera.requestCameraPermissionsAsync as jest.Mock)
        .mockResolvedValueOnce({
          status: 'denied',
          canAskAgain: true,
          granted: false,
        })
        .mockResolvedValueOnce({
          status: 'granted',
          canAskAgain: true,
          granted: true,
        });

      // First attempt
      const result1 = await cameraService.requestPermissions();
      expect(result1).toBe(false);

      // Trigger retry button
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const lastCall = alertCalls[alertCalls.length - 1];
      const buttons = lastCall[2];
      const grantButton = buttons.find((btn: any) => btn.text === 'Grant Permission');
      
      if (grantButton?.onPress) {
        await grantButton.onPress();
        // Second attempt should succeed
        expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalledTimes(2);
      }
    });

    it('should handle permission check before camera use', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const status = await cameraService.checkPermissions();
      const hasCamera = await cameraService.hasCamera();

      expect(status).toBe('granted');
      expect(hasCamera).toBe(true);
    });
  });
});

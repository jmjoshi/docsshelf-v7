/**
 * Document Scan Screen
 * Camera interface for scanning documents
 * Part of FR-MAIN-003: Document Scanning Feature
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFormatLabel } from '../../services/scan/formatConstants';
import type { ScanFormat } from '../../types/scan.types';

interface DocumentScanScreenProps {
  format: ScanFormat;
  onCapture: (imageUri: string) => void;
  onCancel: () => void;
}

export default function DocumentScanScreen({
  format,
  onCapture,
  onCancel,
}: DocumentScanScreenProps) {
  const cameraRef = useRef<any>(null);
  
  // Use the camera permissions hook (recommended for expo-camera v17)
  const [permission, requestPermission] = useCameraPermissions();
  
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Request permissions on mount
  useEffect(() => {
    console.log('[DocumentScanScreen] Component mounted, format:', format);
    console.log('[DocumentScanScreen] Current permission state:', permission);
    
    // Only run once when permission state is loaded
    if (!permission) {
      return;
    }

    // If permission not granted yet, request it
    if (!permission.granted) {
      if (permission.canAskAgain) {
        console.log('[DocumentScanScreen] Requesting permissions...');
        
        // Set a timeout in case the permission request hangs
        const timeoutId = setTimeout(() => {
          console.error('[DocumentScanScreen] Permission request timed out');
          Alert.alert(
            'Camera Permission Timeout',
            'Camera permission request timed out. Please try again or check your device settings.',
            [
              { text: 'Cancel', onPress: onCancel },
              { text: 'Retry', onPress: () => requestPermission() }
            ]
          );
        }, 10000); // 10 second timeout

        requestPermission()
          .then((result) => {
            clearTimeout(timeoutId);
            console.log('[DocumentScanScreen] Permission result:', result);
            if (!result.granted) {
              console.log('[DocumentScanScreen] Permission denied, cancelling...');
              Alert.alert(
                'Camera Access Denied',
                'Camera access is required to scan documents.',
                [{ text: 'OK', onPress: onCancel }]
              );
            }
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            console.error('[DocumentScanScreen] Error requesting permission:', error);
            Alert.alert(
              'Permission Error',
              'Failed to request camera permission. Please try again.',
              [
                { text: 'Cancel', onPress: onCancel },
                { text: 'Retry', onPress: () => requestPermission() }
              ]
            );
          });
      } else {
        // Permission permanently denied
        console.log('[DocumentScanScreen] Permission permanently denied');
        Alert.alert(
          'Camera Access Required',
          'Please enable camera access in Settings to scan documents.',
          [
            { text: 'Cancel', onPress: onCancel },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
                onCancel();
              }
            }
          ]
        );
      }
    }
  }, [permission]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing || !cameraReady) {
      return;
    }

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onCapture(photo.uri);
      } else {
        Alert.alert('Error', 'Failed to capture image. Please try again.');
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert(
        'Capture Error',
        'Failed to capture image. Please try again.'
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  console.log('[DocumentScanScreen] Rendering, permission:', permission?.granted, 'cameraReady:', cameraReady);

  // Loading state while checking permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  // Permission denied or waiting for response
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera" size={64} color="#999" />
        <Text style={styles.errorText}>
          {permission.status === 'undetermined' ? 'Requesting Camera Access' : 'Camera Access Required'}
        </Text>
        <Text style={styles.errorSubtext}>
          {permission.status === 'undetermined' 
            ? 'A permission dialog should appear. Please tap "Allow" to continue.' 
            : 'Please enable camera access in Settings to scan documents.'}
        </Text>
        {permission.status !== 'undetermined' && (
          <>
            <TouchableOpacity 
              style={[styles.backButton, { marginBottom: 12 }]} 
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }}
            >
              <Text style={styles.backButtonText}>Open Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={onCancel}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </>
        )}
        {permission.status === 'undetermined' && (
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Camera view
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera Preview */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash={flashMode}
        onCameraReady={handleCameraReady}
      />
      
      {/* Camera Overlay - outside CameraView to avoid warning */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.formatBadge}>
            <Text style={styles.formatBadgeText}>
              Scanning as {getFormatLabel(format)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.topButton}
            onPress={toggleFlash}
            activeOpacity={0.7}
          >
            <Ionicons
              name={flashMode === 'on' ? 'flash' : 'flash-off'}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Document Alignment Grid (Optional) */}
        <View style={styles.gridOverlay}>
          <View style={styles.gridHorizontal} />
          <View style={styles.gridVertical} />
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomBar}>
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                (isCapturing || !cameraReady) && styles.captureButtonDisabled,
              ]}
              onPress={handleCapture}
              disabled={isCapturing || !cameraReady}
              activeOpacity={0.7}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>

          {/* Hint Text */}
          <Text style={styles.hintText}>
            Position document within frame and tap to capture
          </Text>
        </View>
      </View>

      {/* Camera not ready overlay */}
      {!cameraReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingOverlayText}>
            Initializing camera...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  formatBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridHorizontal: {
    position: 'absolute',
    top: '50%',
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridVertical: {
    position: 'absolute',
    left: '50%',
    height: '60%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  captureButtonContainer: {
    marginBottom: 16,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#2196F3',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2196F3',
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
  },
});

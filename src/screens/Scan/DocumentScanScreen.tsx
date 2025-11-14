/**
 * Document Scan Screen
 * Camera interface for scanning documents
 * Part of FR-MAIN-003: Document Scanning Feature
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { cameraService } from '../../services/scan/cameraService';
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
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const granted = await cameraService.requestPermissions();
    setHasPermission(granted);

    if (!granted) {
      // User denied permissions, go back
      setTimeout(() => {
        onCancel();
      }, 1000);
    }
  };

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

  // Loading state while checking permissions
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Requesting camera access...</Text>
      </View>
    );
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera" size={64} color="#999" />
        <Text style={styles.errorText}>Camera access denied</Text>
        <Text style={styles.errorSubtext}>
          Please enable camera access in your device settings to scan documents.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera Preview */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash={flashMode}
        onCameraReady={handleCameraReady}
      >
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
      </CameraView>

      {/* Camera not ready overlay */}
      {!cameraReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingOverlayText}>
            Initializing camera...
          </Text>
        </View>
      )}
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight || 40,
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

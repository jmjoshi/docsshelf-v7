/**
 * Scan Flow Coordinator
 * Manages the complete document scanning flow:
 * Format Selection → Camera → Preview → Upload Integration
 * Part of FR-MAIN-003: Document Scanning Feature
 */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FormatSelectionModal from '../../components/scan/FormatSelectionModal';
import { getRecommendedFormat } from '../../services/scan/formatConstants';
import type { ScanFormat } from '../../types/scan.types';
import DocumentScanScreen from './DocumentScanScreen';
import ImagePreviewScreen from './ImagePreviewScreen';

type ScanStep = 'format-selection' | 'camera' | 'preview';

export default function ScanFlowScreen() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<ScanStep>('format-selection');
  const [selectedFormat, setSelectedFormat] = useState<ScanFormat>(
    getRecommendedFormat()
  );
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

  // Step 1: Format Selection
  const handleFormatSelected = (format: ScanFormat) => {
    setSelectedFormat(format);
    // Small delay to allow modal to close smoothly before camera opens
    setTimeout(() => {
      setCurrentStep('camera');
    }, 300);
  };

  const handleCancelFormatSelection = () => {
    router.back();
  };

  // Step 2: Camera
  const handleImageCaptured = (imageUri: string) => {
    setCapturedImageUri(imageUri);
    setCurrentStep('preview');
  };

  const handleCancelCamera = () => {
    setCurrentStep('format-selection');
  };

  // Step 3: Preview
  const handleRetake = () => {
    setCapturedImageUri(null);
    setCurrentStep('camera');
  };

  const handleConfirmImage = (processedUri: string) => {
    // Navigate to upload screen with scanned document
    router.push({
      pathname: '/document/upload',
      params: {
        scannedImageUri: processedUri,
        scannedFormat: selectedFormat,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Format Selection Modal */}
      <FormatSelectionModal
        visible={currentStep === 'format-selection'}
        onClose={handleCancelFormatSelection}
        onSelectFormat={handleFormatSelected}
        selectedFormat={selectedFormat}
      />

      {/* Camera Screen */}
      {currentStep === 'camera' && (
        <DocumentScanScreen
          format={selectedFormat}
          onCapture={handleImageCaptured}
          onCancel={handleCancelCamera}
        />
      )}

      {/* Preview Screen */}
      {currentStep === 'preview' && capturedImageUri && (
        <ImagePreviewScreen
          imageUri={capturedImageUri}
          format={selectedFormat}
          onRetake={handleRetake}
          onConfirm={handleConfirmImage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

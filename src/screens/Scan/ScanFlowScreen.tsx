/**
 * Scan Flow Coordinator
 * Manages the complete document scanning flow:
 * Format Selection → Camera → Preview → Upload Integration
 * Part of FR-MAIN-003: Document Scanning Feature
 */

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  // Debug current step changes
  useEffect(() => {
    console.log('[ScanFlowScreen] Current step changed to:', currentStep);
  }, [currentStep]);

  // Step 1: Format Selection
  const handleFormatSelected = (format: ScanFormat) => {
    console.log('[ScanFlowScreen] Format selected:', format);
    setSelectedFormat(format);
    // Small delay to allow modal to close smoothly before camera opens
    setTimeout(() => {
      console.log('[ScanFlowScreen] Transitioning to camera screen');
      setCurrentStep('camera');
    }, 300);
  };

  const handleCancelFormatSelection = () => {
    console.log('[ScanFlowScreen] Format selection cancelled');
    router.back();
  };

  // Step 2: Camera
  const handleImageCaptured = (imageUri: string) => {
    console.log('[ScanFlowScreen] Image captured:', imageUri);
    setCapturedImageUri(imageUri);
    setCurrentStep('preview');
  };

  const handleCancelCamera = () => {
    console.log('[ScanFlowScreen] Camera cancelled, returning to format selection');
    setCurrentStep('format-selection');
  };

  // Step 3: Preview
  const handleRetake = () => {
    console.log('[ScanFlowScreen] Retaking photo');
    setCapturedImageUri(null);
    setCurrentStep('camera');
  };

  const handleCancelPreview = () => {
    console.log('[ScanFlowScreen] Preview cancelled, going back to documents');
    router.back();
  };

  const handleConfirmImage = (processedUri: string) => {
    console.log('[ScanFlowScreen] Image confirmed, navigating to upload');
    
    // Use replace instead of push to ensure clean navigation
    // Add small delay to ensure preview screen unmounts cleanly
    setTimeout(() => {
      console.log('[ScanFlowScreen] Executing navigation with params:', {
        uri: processedUri,
        format: selectedFormat,
      });
      
      router.replace({
        pathname: '/document/upload',
        params: {
          scannedImageUri: processedUri,
          scannedFormat: selectedFormat,
        },
      });
    }, 100);
  };

  console.log('[ScanFlowScreen] Rendering with step:', currentStep);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Format Selection Modal */}
      {currentStep === 'format-selection' && (
        <FormatSelectionModal
          visible={true}
          onClose={handleCancelFormatSelection}
          onSelectFormat={handleFormatSelected}
          selectedFormat={selectedFormat}
        />
      )}

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
          onCancel={handleCancelPreview}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

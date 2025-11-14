/**
 * Image Preview Screen
 * Allows user to review captured image and confirm or retake
 * Handles format conversion before passing to upload
 * Part of FR-MAIN-003: Document Scanning Feature
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getFormatLabel } from '../../services/scan/formatConstants';
import { imageConverter } from '../../services/scan/imageConverter';
import type { ScanFormat } from '../../types/scan.types';

interface ImagePreviewScreenProps {
  imageUri: string;
  format: ScanFormat;
  onRetake: () => void;
  onConfirm: (processedUri: string) => void;
}

export default function ImagePreviewScreen({
  imageUri,
  format,
  onRetake,
  onConfirm,
}: ImagePreviewScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUri, setProcessedUri] = useState<string | null>(null);

  // Auto-process image if format is not JPEG
  useEffect(() => {
    if (format !== 'jpeg') {
      processImage();
    } else {
      setProcessedUri(imageUri); // No processing needed for JPEG
    }
  }, [imageUri, format]);

  const processImage = async () => {
    try {
      setIsProcessing(true);

      const result = await imageConverter.convert(imageUri, format);

      if (result.success && result.uri) {
        setProcessedUri(result.uri);
      } else {
        Alert.alert(
          'Conversion Error',
          result.error || 'Failed to convert image to selected format',
          [
            { text: 'Retake', onPress: onRetake },
            {
              text: 'Use Original',
              onPress: () => setProcessedUri(imageUri),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert(
        'Processing Error',
        'Failed to process image. Would you like to retake or use the original?',
        [
          { text: 'Retake', onPress: onRetake },
          {
            text: 'Use Original',
            onPress: () => setProcessedUri(imageUri),
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (processedUri) {
      onConfirm(processedUri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Scanned as {getFormatLabel(format)}
        </Text>
        {isProcessing && (
          <Text style={styles.processingText}>
            Converting to {getFormatLabel(format)}...
          </Text>
        )}
      </View>

      {/* Image Preview */}
      <View style={styles.imageContainer}>
        {format === 'pdf' ? (
          // PDF can't be previewed as image, show placeholder
          <View style={styles.pdfPlaceholder}>
            <Ionicons name="document-text" size={80} color="#2196F3" />
            <Text style={styles.pdfText}>PDF Document</Text>
            <Text style={styles.pdfSubtext}>
              PDF created successfully
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: processedUri || imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingOverlayText}>
              Converting to {getFormatLabel(format)}...
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.retakeButton]}
          onPress={onRetake}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <Ionicons name="camera-reverse" size={24} color="#666" />
          <Text style={styles.retakeButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.confirmButton,
            (isProcessing || !processedUri) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={isProcessing || !processedUri}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.confirmButtonText}>Use Image</Text>
        </TouchableOpacity>
      </View>

      {/* Format Info */}
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={16} color="#666" />
          <Text style={styles.infoText}>
            {format === 'jpeg' && 'High quality photo format'}
            {format === 'gif' && 'Compact file size for quick sharing'}
            {format === 'pdf' && 'Standard document format'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  processingText: {
    fontSize: 14,
    color: '#2196F3',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pdfPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  pdfText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  pdfSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingOverlayText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#1a1a1a',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: '#333',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  confirmButtonDisabled: {
    backgroundColor: '#555',
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});

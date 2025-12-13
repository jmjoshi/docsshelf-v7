/**
 * Document Upload Screen
 * Allows users to select and upload documents with encryption and progress tracking
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from 'react-native-toast-notifications';
import { HierarchicalCategoryPicker } from '../../../components/ui/HierarchicalCategoryPicker';
import { getCurrentUserId } from '../../services/database/userService';
import { imageConverter } from '../../services/scan/imageConverter';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    loadCategories,
    selectAllCategories,
} from '../../store/slices/categorySlice';
import {
    selectActiveUploads,
    selectDocumentError,
    uploadDocumentWithProgress,
} from '../../store/slices/documentSlice';
import { hapticFeedback } from '../../utils/feedbackUtils';

export default function DocumentUploadScreen() {
  console.log('[DocumentUploadScreen] Component mounting/rendering');
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ scannedImageUri?: string; scannedFormat?: string }>();
  
  console.log('[DocumentUploadScreen] Params received:', params);
  
  const categories = useAppSelector(selectAllCategories);
  const activeUploads = useAppSelector(selectActiveUploads);
  const error = useAppSelector(selectDocumentError);

  const [userId, setUserId] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Uncategorized');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [showPostUploadModal, setShowPostUploadModal] = useState(false);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<number | null>(null);
  const [isFromScan, setIsFromScan] = useState(false);
  
  // Track if we've already processed the scanned document
  const processedUriRef = useRef<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Handle scanned document passed from scan flow (only once per unique URI)
    if (params.scannedImageUri && params.scannedFormat && 
        params.scannedImageUri !== processedUriRef.current) {
      processedUriRef.current = params.scannedImageUri;
      setIsFromScan(true); // Mark that this upload came from scan flow
      handleScannedDocument(params.scannedImageUri, params.scannedFormat);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      const id = await getCurrentUserId();
      if (id) {
        setUserId(id);
        dispatch(loadCategories(id));
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const handleScannedDocument = async (uri: string, format: string) => {
    try {
      console.log('[DocumentUploadScreen] Handling scanned document:', uri, format);
      const mimeType = imageConverter.getMimeType(format as any);
      const extension = imageConverter.getFileExtension(format as any);
      
      // Get file info using legacy FileSystem API (required for expo-file-system v17)
      const fileInfo = await FileSystemLegacy.getInfoAsync(uri);
      
      console.log('[DocumentUploadScreen] File info:', fileInfo);
      
      // Create a DocumentPickerAsset-like object for the scanned document
      const scannedFile: DocumentPicker.DocumentPickerAsset = {
        uri,
        name: `Scanned_Document_${Date.now()}${extension}`,
        mimeType,
        size: fileInfo.exists && !fileInfo.isDirectory ? fileInfo.size || 0 : 0,
        lastModified: Date.now(),
      };
      
      console.log('[DocumentUploadScreen] Scanned file created:', scannedFile);
      setSelectedFile(scannedFile);
    } catch (err) {
      console.error('Error handling scanned document:', err);
      Alert.alert('Error', 'Failed to load scanned document. Please try again.');
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleSelectCategory = (categoryId: number | null, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setShowCategoryModal(false);
  };

  const validateUpload = (): boolean => {
    if (!selectedFile) {
      Alert.alert('Validation Error', 'Please select a file to upload');
      return false;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!validateUpload() || !selectedFile || !userId) return;

    try {
      // Convert DocumentPickerAsset to DocumentPickerResult format
      const file = {
        uri: selectedFile.uri,
        name: selectedFile.name,
        size: selectedFile.size || 0,
        mimeType: selectedFile.mimeType || 'application/octet-stream',
      };

      const result = await dispatch(
        uploadDocumentWithProgress({
          file,
          options: {
            categoryId: selectedCategoryId,
          },
        })
      ).unwrap();
      // Success - show toast
      await hapticFeedback.success();
      if (toast) {
        toast.show('Document uploaded successfully', {
          type: 'success',
          duration: 2000,
        });
      }
      
      // If this is from scan flow, show post-upload options modal
      // Otherwise, navigate directly to document view (traditional upload)
      if (isFromScan) {
        setUploadedDocumentId(result.id);
        setShowPostUploadModal(true);
      } else {
        // Traditional file picker upload - go straight to document view
        router.push(`/document/${result.id}`);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      await hapticFeedback.error();
      
      // Check for duplicate document error
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      const isDuplicate = errorMessage.includes('UNIQUE constraint failed') || 
                         errorMessage.includes('duplicate') ||
                         errorMessage.includes('checksum');
      
      const friendlyMessage = isDuplicate 
        ? 'This document has already been uploaded. Duplicate documents are not allowed.'
        : errorMessage;
      
      if (toast) {
        toast.show(friendlyMessage, {
          type: 'danger',
          duration: 4000,
        });
      } else {
        Alert.alert(
          isDuplicate ? 'Duplicate Document' : 'Upload Failed',
          friendlyMessage
        );
      }
    }
  };

  const getFileSize = (bytes: number | undefined): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderUploadProgress = ({ item }: { item: any }) => (
    <View style={styles.uploadProgressItem}>
      <Text style={styles.uploadFileName} numberOfLines={1}>
        {item.filename}
      </Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${item.percentage}%` }]} />
      </View>
      <View style={styles.uploadStatusRow}>
        <Text style={styles.uploadStatusText}>{item.status}</Text>
        <Text style={styles.uploadProgressText}>{Math.round(item.percentage)}%</Text>
      </View>
      {item.error && <Text style={styles.uploadErrorText}>{item.error}</Text>}
    </View>
  );

  const handleCancel = () => {
    if (selectedFile || activeUploads.length > 0) {
      Alert.alert(
        'Cancel Upload',
        'Are you sure you want to cancel? Any progress will be lost.',
        [
          { text: 'Continue Upload', style: 'cancel' },
          {
            text: 'Cancel',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // Post-upload modal handlers
  const handleScanMore = () => {
    setShowPostUploadModal(false);
    // Reset the upload form
    setSelectedFile(null);
    setUploadedDocumentId(null);
    processedUriRef.current = null;
    
    // Navigate back to scan flow
    router.replace('/scan');
  };

  const handleViewDocument = () => {
    setShowPostUploadModal(false);
    if (uploadedDocumentId) {
      router.replace(`/document/${uploadedDocumentId}`);
    }
  };

  const handleDone = () => {
    setShowPostUploadModal(false);
    // Navigate to documents list
    router.replace('/(tabs)/documents');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header with Cancel Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Upload Document</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>
            Select a file and provide details for secure encrypted storage
          </Text>
        </View>

      {/* File Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>File Selection</Text>
        <TouchableOpacity style={styles.selectButton} onPress={handleSelectFile}>
          <Text style={styles.selectButtonText}>
            {selectedFile ? 'Change File' : 'Select File'}
          </Text>
        </TouchableOpacity>
        {selectedFile && (
          <View style={styles.selectedFileInfo}>
            <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
            <Text style={styles.selectedFileSize}>{getFileSize(selectedFile.size)}</Text>
            <Text style={styles.selectedFileType}>Type: {selectedFile.mimeType || 'Unknown'}</Text>
          </View>
        )}
      </View>

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Category</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.categorySelectorText}>{selectedCategoryName}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upload Button */}
      <TouchableOpacity
        style={[styles.uploadButton, !selectedFile && styles.uploadButtonDisabled]}
        onPress={handleUpload}
        disabled={!selectedFile}
      >
        <Text style={styles.uploadButtonText}>Upload Document</Text>
      </TouchableOpacity>

      {/* Active Uploads */}
      {activeUploads.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Progress</Text>
          <FlatList
            data={activeUploads}
            renderItem={renderUploadProgress}
            keyExtractor={(item) => item.filename}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Category Selection Modal */}
      <HierarchicalCategoryPicker
        visible={showCategoryModal}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        onClose={() => setShowCategoryModal(false)}
        showUncategorized={true}
        title="Select Category"
      />

      {/* Post-Upload Options Modal */}
      <Modal
        visible={showPostUploadModal}
        transparent
        animationType="fade"
        onRequestClose={handleDone}
      >
        <View style={styles.postUploadModalOverlay}>
          <View style={styles.postUploadModalContainer}>
            <View style={styles.postUploadHeader}>
              <Text style={styles.postUploadTitle}>✓ Document Uploaded</Text>
              <Text style={styles.postUploadSubtitle}>What would you like to do next?</Text>
            </View>

            <View style={styles.postUploadOptions}>
              <TouchableOpacity
                style={styles.postUploadButton}
                onPress={handleScanMore}
              >
                <Text style={styles.postUploadButtonIcon}>📷</Text>
                <Text style={styles.postUploadButtonText}>Scan More</Text>
                <Text style={styles.postUploadButtonSubtext}>Continue scanning documents</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.postUploadButton}
                onPress={handleViewDocument}
              >
                <Text style={styles.postUploadButtonIcon}>👁️</Text>
                <Text style={styles.postUploadButtonText}>View Document</Text>
                <Text style={styles.postUploadButtonSubtext}>See what you just uploaded</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.postUploadButton, styles.postUploadButtonDone]}
                onPress={handleDone}
              >
                <Text style={styles.postUploadButtonIcon}>✓</Text>
                <Text style={styles.postUploadButtonText}>Done</Text>
                <Text style={styles.postUploadButtonSubtext}>Go to documents list</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '500',
  },
  headerSpacer: {
    width: 70, // Same width as cancel button for centering
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 250, // Extra space for bottom navigation and upload progress messages
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  selectButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedFileInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  selectedFileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedFileSize: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  selectedFileType: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#333',
  },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteLabel: {
    fontSize: 16,
    color: '#333',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadProgressItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  uploadFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  uploadStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  uploadStatusText: {
    fontSize: 12,
    color: '#666',
  },
  uploadProgressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  uploadErrorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 5,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  // Post-Upload Modal Styles
  postUploadModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  postUploadModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  postUploadHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  postUploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  postUploadSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  postUploadOptions: {
    padding: 16,
  },
  postUploadButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  postUploadButtonDone: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  postUploadButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  postUploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  postUploadButtonSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

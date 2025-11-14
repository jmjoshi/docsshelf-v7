/**
 * Document Upload Screen
 * Allows users to select and upload documents with encryption and progress tracking
 */

import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function DocumentUploadScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useLocalSearchParams<{ scannedImageUri?: string; scannedFormat?: string }>();
  const categories = useAppSelector(selectAllCategories);
  const activeUploads = useAppSelector(selectActiveUploads);
  const error = useAppSelector(selectDocumentError);

  const [userId, setUserId] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Uncategorized');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  useEffect(() => {
    loadUserData();
    
    // Handle scanned document passed from scan flow
    if (params.scannedImageUri && params.scannedFormat) {
      handleScannedDocument(params.scannedImageUri, params.scannedFormat);
    }
  }, [params.scannedImageUri]);

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
      const mimeType = imageConverter.getMimeType(format as any);
      const extension = imageConverter.getFileExtension(format as any);
      
      // Get file info
      const FileSystem = await import('expo-file-system');
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      // Create a DocumentPickerAsset-like object for the scanned document
      const scannedFile: DocumentPicker.DocumentPickerAsset = {
        uri,
        name: `Scanned_Document_${Date.now()}${extension}`,
        mimeType,
        size: fileInfo.exists && !fileInfo.isDirectory ? fileInfo.size || 0 : 0,
        lastModified: Date.now(),
      };
      
      setSelectedFile(scannedFile);
    } catch (err) {
      console.error('Error handling scanned document:', err);
      Alert.alert('Error', 'Failed to load scanned document');
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

      // Success - reset form and navigate back
      Alert.alert('Success', 'Document uploaded successfully', [
        {
          text: 'View Document',
          onPress: () => {
            router.push(`/document/${result.id}`);
          },
        },
        {
          text: 'Upload Another',
          onPress: () => {
            setSelectedFile(null);
            setSelectedCategoryId(null);
            setSelectedCategoryName('Uncategorized');
          },
        },
      ]);
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Upload Failed', err instanceof Error ? err.message : 'Failed to upload document');
    }
  };

  const getFileSize = (bytes: number | undefined): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleSelectCategory(item.id, item.name)}
    >
      <View style={[styles.colorIndicator, { backgroundColor: item.color || '#2196F3' }]} />
      <Text style={styles.categoryItemText}>{item.name}</Text>
      {item.document_count !== undefined && (
        <Text style={styles.documentCount}>({item.document_count})</Text>
      )}
    </TouchableOpacity>
  );

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

  return (
    <View style={styles.container}>
      {/* Header with Cancel Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Upload Document</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContent}>
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
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => handleSelectCategory(null, 'Uncategorized')}
            >
              <View style={[styles.colorIndicator, { backgroundColor: '#999' }]} />
              <Text style={styles.categoryItemText}>Uncategorized</Text>
            </TouchableOpacity>

            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.categoryList}
            />
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
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
    paddingTop: 50,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  documentCount: {
    fontSize: 14,
    color: '#999',
  },
});

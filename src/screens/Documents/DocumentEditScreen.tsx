/**
 * Document Edit Screen
 * Allows users to update document metadata and settings
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  loadCategories,
  selectAllCategories,
} from '../../store/slices/categorySlice';
import {
  updateDocumentMetadata,
  selectDocumentById,
  selectDocumentError,
} from '../../store/slices/documentSlice';
import { getCurrentUserId } from '../../services/database/userService';

export default function DocumentEditScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();
  const documentId = Number(params.id);

  const document = useAppSelector((state) => selectDocumentById(state, documentId));
  const categories = useAppSelector(selectAllCategories);
  const error = useAppSelector(selectDocumentError);

  const [filename, setFilename] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('Uncategorized');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (document) {
      setFilename(document.filename);
      setSelectedCategoryId(document.category_id);
      setIsFavorite(document.is_favorite);
      
      const category = categories.find((cat) => cat.id === document.category_id);
      setSelectedCategoryName(category?.name || 'Uncategorized');
    }
  }, [document, categories]);

  const loadUserData = async () => {
    try {
      const id = await getCurrentUserId();
      if (id) {
        dispatch(loadCategories(id));
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const handleSelectCategory = (categoryId: number | null, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setShowCategoryModal(false);
    setHasChanges(true);
  };

  const handleFilenameChange = (text: string) => {
    setFilename(text);
    setHasChanges(true);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setHasChanges(true);
  };

  const validateChanges = (): boolean => {
    if (!filename.trim()) {
      Alert.alert('Validation Error', 'Filename cannot be empty');
      return false;
    }

    // Check if filename has an extension
    if (!filename.includes('.')) {
      Alert.alert('Validation Error', 'Filename must include an extension (e.g., .pdf, .jpg)');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!document || !hasChanges) {
      Alert.alert('No Changes', 'No changes to save');
      return;
    }

    if (!validateChanges()) return;

    try {
      // Update metadata
      await dispatch(
        updateDocumentMetadata({
          documentId: document.id,
          updates: {
            filename: filename.trim(),
            category_id: selectedCategoryId,
            is_favorite: isFavorite,
          },
        })
      ).unwrap();

      Alert.alert('Success', 'Document updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error('Failed to update document:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update document');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (!document) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Document not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Document</Text>

        <TouchableOpacity 
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges}
        >
          <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Document Info Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Original Name</Text>
            <Text style={styles.infoValue}>{document.original_filename}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{document.mime_type}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Size</Text>
            <Text style={styles.infoValue}>
              {(document.file_size / 1024).toFixed(2)} KB
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(document.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Edit Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Filename *</Text>
            <TextInput
              style={styles.input}
              value={filename}
              onChangeText={handleFilenameChange}
              placeholder="Enter filename"
              placeholderTextColor="#999"
            />
            <Text style={styles.helperText}>Include file extension (e.g., .pdf, .jpg)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.categorySelectorText}>{selectedCategoryName}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.favoriteToggle} onPress={handleToggleFavorite}>
            <View style={[styles.checkbox, isFavorite && styles.checkboxChecked]}>
              {isFavorite && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.favoriteLabel}>Mark as Favorite</Text>
          </TouchableOpacity>
        </View>

        {/* Metadata Section */}
        {document.ocr_text && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extracted Text (OCR)</Text>
            <ScrollView style={styles.ocrContainer} nestedScrollEnabled>
              <Text style={styles.ocrText}>{document.ocr_text}</Text>
            </ScrollView>
            {document.ocr_confidence && (
              <Text style={styles.confidenceText}>
                Confidence: {Math.round(document.ocr_confidence * 100)}%
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
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

            <ScrollView style={styles.categoryList}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.categoryItem}
                  onPress={() => handleSelectCategory(item.id, item.name)}
                >
                  <View style={[styles.colorIndicator, { backgroundColor: item.color || '#2196F3' }]} />
                  <Text style={styles.categoryItemText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    padding: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    padding: 5,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  chevron: {
    fontSize: 24,
    color: '#999',
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
  ocrContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  ocrText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorBanner: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorBannerText: {
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

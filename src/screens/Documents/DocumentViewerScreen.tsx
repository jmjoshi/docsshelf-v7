/**
 * Document Viewer Screen
 * Displays document content with support for multiple file types
 */

import * as FileSystemLegacy from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HierarchicalCategoryPicker } from '../../../components/ui/HierarchicalCategoryPicker';
import PdfViewer from '../../components/documents/PdfViewer';
import { getCategories } from '../../services/database/categoryService';
import { readDocument } from '../../services/database/documentService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    removeDocument,
    selectDocumentById,
    selectDocumentError,
    toggleFavorite,
    updateDocumentMetadata,
} from '../../store/slices/documentSlice';
import { Category } from '../../types/category';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DocumentViewerScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();
  const documentId = Number(params.id);

  const document = useAppSelector((state) => selectDocumentById(state, documentId));
  const error = useAppSelector(selectDocumentError);

  const [decryptedContent, setDecryptedContent] = useState<string | Uint8Array | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    if (document) {
      loadDocument();
    }
    loadCategories();
  }, [document]);

  const loadCategories = async () => {
    try {
      console.log('[DocumentViewerScreen] Loading categories...');
      const allCategories = await getCategories();
      console.log('[DocumentViewerScreen] Categories loaded:', allCategories.length);
      console.log('[DocumentViewerScreen] First category:', allCategories[0]);
      setCategories(allCategories);
    } catch (err) {
      console.error('[DocumentViewerScreen] Failed to load categories:', err);
    }
  };

  const loadDocument = async () => {
    if (!document) return;

    setIsDecrypting(true);
    try {
      // Read document directly from service (don't store in Redux to avoid serialization issues)
      const content = await readDocument(documentId);
      
      // Convert Uint8Array to string for text files, or base64 for images/PDFs
      if (document.mime_type.startsWith('text/')) {
        const decoder = new TextDecoder();
        setDecryptedContent(decoder.decode(content));
      } else if (document.mime_type.startsWith('image/') || document.mime_type === 'application/pdf') {
        // Convert Uint8Array to base64 data URI for images and PDFs
        const base64 = arrayBufferToBase64(content);
        const dataUri = `data:${document.mime_type};base64,${base64}`;
        setDecryptedContent(dataUri);
      } else {
        setDecryptedContent(content);
      }
    } catch (err) {
      console.error('Failed to load document:', err);
      Alert.alert('Error', 'Failed to decrypt and load document');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!document) return;

    try {
      await dispatch(toggleFavorite(documentId)).unwrap();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleShare = async () => {
    if (!document || !decryptedContent) return;

    try {
      // For text content, share directly
      if (document.mime_type.startsWith('text/') && typeof decryptedContent === 'string') {
        await Share.share({
          message: decryptedContent,
          title: document.filename,
        });
        return;
      }

      // For binary files (images, PDFs, etc.), save to temp file and share
      const tempDir = `${FileSystemLegacy.cacheDirectory}share/`;
      await FileSystemLegacy.makeDirectoryAsync(tempDir, { intermediates: true });
      
      const tempFilePath = `${tempDir}${document.original_filename}`;
      
      // Convert content to base64 if it's Uint8Array
      let base64Content: string;
      if (decryptedContent instanceof Uint8Array) {
        base64Content = arrayBufferToBase64(decryptedContent);
      } else if (typeof decryptedContent === 'string') {
        // If it's a data URI (data:image/jpeg;base64,xxxxx), extract base64 part
        if (decryptedContent.startsWith('data:')) {
          const base64Index = decryptedContent.indexOf('base64,');
          if (base64Index !== -1) {
            base64Content = decryptedContent.substring(base64Index + 7);
          } else {
            base64Content = decryptedContent;
          }
        } else {
          base64Content = decryptedContent;
        }
      } else {
        throw new Error('Unsupported content type for sharing');
      }

      // Write decrypted content to temp file
      await FileSystemLegacy.writeAsStringAsync(tempFilePath, base64Content, {
        encoding: FileSystemLegacy.EncodingType.Base64,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      // Share the file
      await Sharing.shareAsync(tempFilePath, {
        mimeType: document.mime_type,
        dialogTitle: `Share ${document.filename}`,
        UTI: document.mime_type,
      });

      // Clean up temp file after a delay
      setTimeout(async () => {
        try {
          await FileSystemLegacy.deleteAsync(tempFilePath, { idempotent: true });
        } catch (cleanupErr) {
          console.log('Failed to cleanup temp file:', cleanupErr);
        }
      }, 5000);
    } catch (err) {
      console.error('Failed to share:', err);
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const handleDelete = () => {
    if (!document) return;

    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.filename}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(removeDocument(documentId)).unwrap();
              Alert.alert('Success', 'Document deleted successfully');
              router.back();
            } catch (err) {
              console.error('Failed to delete document:', err);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!document) return;
    router.push(`/document/edit/${document.id}`);
  };

  const handlePrint = async () => {
    if (!document) return;
    Alert.alert('Print', 'Print functionality will be available in the next update');
  };

  const handleDuplicate = async () => {
    if (!document) return;
    Alert.alert(
      'Duplicate Document',
      `Create a copy of "${document.filename}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: () => {
            Alert.alert('Success', 'Document duplicated successfully');
          },
        },
      ]
    );
  };

  const handleShowInfo = () => {
    if (!document) return;
    const info = `
Filename: ${document.filename}
Original: ${document.original_filename}
Size: ${formatFileSize(document.file_size)}
Type: ${document.mime_type}
Created: ${formatDate(document.created_at)}
Modified: ${formatDate(document.updated_at)}
Last Accessed: ${document.last_accessed_at ? formatDate(document.last_accessed_at) : 'Never'}
Favorite: ${document.is_favorite ? 'Yes' : 'No'}
Encrypted: Yes`;
    
    Alert.alert('Document Information', info);
  };

  const handleMove = () => {
    if (!document) return;
    setShowMoveModal(true);
  };

  const handleMoveToCategory = async (categoryId: number | null, categoryName: string) => {
    if (!document) return;

    try {
      // Use Redux action to update both database and store
      await dispatch(updateDocumentMetadata({
        documentId: document.id,
        updates: { category_id: categoryId },
      })).unwrap();

      setShowMoveModal(false);
      Alert.alert('Success', `Document moved to ${categoryName}`);
      
      // Reload document to reflect changes locally
      loadDocument();
    } catch (err) {
      console.error('Failed to move document:', err);
      Alert.alert('Error', 'Failed to move document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const arrayBufferToBase64 = (buffer: Uint8Array): string => {
    let binary = '';
    const CHUNK_SIZE = 8192;
    for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
      const chunk = buffer.subarray(i, Math.min(i + CHUNK_SIZE, buffer.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  };

  const renderContent = () => {
    if (isDecrypting) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Decrypting document...</Text>
        </View>
      );
    }

    if (!decryptedContent) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyText}>No content available</Text>
        </View>
      );
    }

    // Render based on MIME type
    if (document?.mime_type.startsWith('text/') && typeof decryptedContent === 'string') {
      return (
        <ScrollView style={styles.textContentContainer}>
          <Text style={styles.textContent}>{decryptedContent}</Text>
        </ScrollView>
      );
    }

    if (document?.mime_type.startsWith('image/') && typeof decryptedContent === 'string') {
      // For images, content would be base64 or file URI
      return (
        <View style={styles.imageContainer}>
          <ScrollView
            contentContainerStyle={styles.imageContentContainer}
            maximumZoomScale={3}
            minimumZoomScale={1}
          >
            <Image
              source={{ uri: decryptedContent }}
              style={styles.image}
              resizeMode="contain"
            />
          </ScrollView>
          {/* Timestamp overlay */}
          <View style={styles.timestampOverlay}>
            <Text style={styles.timestampText}>
              {new Date(document.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              }).replace(/\//g, '.')} {new Date(document.created_at).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </Text>
          </View>
        </View>
      );
    }

    if (document?.mime_type === 'application/pdf' && typeof decryptedContent === 'string') {
      // For PDFs, use the PdfViewer component
      return (
        <PdfViewer
          source={{ uri: decryptedContent }}
          filename={document.filename}
          onError={(error) => {
            console.error('PDF viewer error:', error);
            Alert.alert('PDF Error', 'Failed to load PDF document');
          }}
        />
      );
    }

    // Default fallback for other file types
    return (
      <View style={styles.unsupportedContainer}>
        <Text style={styles.unsupportedIcon}>📎</Text>
        <Text style={styles.unsupportedTitle}>Preview Not Available</Text>
        <Text style={styles.unsupportedText}>
          This file type cannot be previewed. You can download or share the file.
        </Text>
      </View>
    );
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {document.filename}
          </Text>
          <Text style={styles.headerSubtitle}>
            {formatFileSize(document.file_size)} • {document.mime_type}
          </Text>
        </View>

        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
          <Text style={styles.favoriteIcon}>{document.is_favorite ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {/* Document Info */}
      <View style={styles.infoBar}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoValue}>{formatDate(document.created_at)}</Text>
        </View>
        <View style={[styles.infoRow, styles.lastInfoRow]}>
          <Text style={styles.infoLabel}>Last Accessed</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoValue}>
            {document.last_accessed_at ? formatDate(document.last_accessed_at) : 'Never'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentArea}>{renderContent()}</View>

      {/* Action Bar - Compact Single Row */}
      <View style={styles.actionBar}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
            <Text style={styles.actionIcon}>🖨️</Text>
            <Text style={styles.actionText}>Print</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDuplicate}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShowInfo}>
            <Text style={styles.actionIcon}>ℹ️</Text>
            <Text style={styles.actionText}>Info</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleMove}>
            <Text style={styles.actionIcon}>📁</Text>
            <Text style={styles.actionText}>Move</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={[styles.actionText, styles.deleteActionText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Move to Category Modal */}
      <HierarchicalCategoryPicker
        visible={showMoveModal}
        categories={categories}
        selectedCategoryId={document?.category_id || null}
        onSelectCategory={handleMoveToCategory}
        onClose={() => setShowMoveModal(false)}
        showUncategorized={true}
        title="Move to Category"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
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
  backIconButton: {
    padding: 5,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 28,
    color: '#2196F3',
  },
  headerInfo: {
    flex: 1,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteIcon: {
    fontSize: 28,
    color: '#FFD700',
  },
  infoBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoRow: {
    paddingVertical: 6,
  },
  lastInfoRow: {
    marginTop: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '400',
  },
  descriptionContainer: {
    marginTop: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  textContentContainer: {
    flex: 1,
    padding: 20,
  },
  textContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  imageContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  timestampOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  unsupportedIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  unsupportedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  unsupportedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 6,
    marginBottom: 90,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    minWidth: 45,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  actionText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '400',
  },
  deleteActionText: {
    color: '#f44336',
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
    bottom: 80,
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
});

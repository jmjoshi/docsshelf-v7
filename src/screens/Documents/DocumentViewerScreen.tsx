/**
 * Document Viewer Screen
 * Displays document content with support for multiple file types
 */

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
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  readDocumentContent,
  removeDocument,
  toggleFavorite,
  selectDocumentById,
  selectDocumentError,
} from '../../store/slices/documentSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DocumentViewerScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();
  const documentId = Number(params.id);

  const document = useAppSelector((state) => selectDocumentById(state, documentId));
  const error = useAppSelector(selectDocumentError);

  const [decryptedContent, setDecryptedContent] = useState<Uint8Array | string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    if (document) {
      loadDocument();
    }
  }, [document]);

  const loadDocument = async () => {
    if (!document) return;

    setIsDecrypting(true);
    try {
      const result = await dispatch(readDocumentContent(documentId)).unwrap();
      // Convert Uint8Array to string for text files, or keep as Uint8Array for binary
      if (document.mime_type.startsWith('text/')) {
        const decoder = new TextDecoder();
        setDecryptedContent(decoder.decode(result.content));
      } else {
        setDecryptedContent(result.content);
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
      } else {
        // For other files, would need to save decrypted content to temp file
        Alert.alert('Share', 'File sharing will be implemented in next update');
      }
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
        <ScrollView
          style={styles.imageContainer}
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
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
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>{formatDate(document.created_at)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Accessed</Text>
          <Text style={styles.infoValue}>
            {document.last_accessed_at ? formatDate(document.last_accessed_at) : 'Never'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentArea}>{renderContent()}</View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteActionButton]}
          onPress={handleDelete}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={[styles.actionText, styles.deleteActionText]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoItem: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
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
  },
  imageContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: SCREEN_WIDTH - 20,
    height: '100%',
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
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  deleteActionButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#ffebee',
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

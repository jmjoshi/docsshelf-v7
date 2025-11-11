/**
 * Document List Screen
 * Displays all documents with search, filter, and sorting capabilities
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCurrentUserId } from '../../services/database/userService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  loadCategories,
  selectAllCategories,
} from '../../store/slices/categorySlice';
import {
  loadDocuments,
  loadDocumentStats,
  removeDocument,
  toggleFavorite,
  selectAllDocuments,
  selectDocumentLoading,
  selectDocumentError,
  selectDocumentStats,
  selectFavoriteDocuments,
  selectRecentDocuments,
} from '../../store/slices/documentSlice';
import type { Document } from '../../types/document';

type ViewMode = 'all' | 'favorites' | 'recent';
type SortMode = 'name' | 'date' | 'size';

export default function DocumentListScreen() {
  const dispatch = useAppDispatch();
  const allDocuments = useAppSelector(selectAllDocuments);
  const favoriteDocuments = useAppSelector(selectFavoriteDocuments);
  const recentDocuments = useAppSelector((state) => selectRecentDocuments(state, 20));
  const categories = useAppSelector(selectAllCategories);
  const loading = useAppSelector(selectDocumentLoading);
  const error = useAppSelector(selectDocumentError);
  const stats = useAppSelector(selectDocumentStats);

  const [userId, setUserId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const id = await getCurrentUserId();
      if (id) {
        setUserId(id);
        dispatch(loadCategories(id));
        dispatch(loadDocuments(undefined));
        dispatch(loadDocumentStats());
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(loadDocuments(undefined)),
        dispatch(loadDocumentStats()),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleFavorite = async (documentId: number) => {
    try {
      await dispatch(toggleFavorite(documentId)).unwrap();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleDeleteDocument = (document: Document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.file_name}"? This action cannot be undone.`,
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
              await dispatch(removeDocument(document.id)).unwrap();
              Alert.alert('Success', 'Document deleted successfully');
            } catch (err) {
              console.error('Failed to delete document:', err);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const getDisplayDocuments = (): Document[] => {
    let documents: Document[] = [];
    
    // Select base documents based on view mode
    switch (viewMode) {
      case 'favorites':
        documents = favoriteDocuments;
        break;
      case 'recent':
        documents = recentDocuments;
        break;
      case 'all':
      default:
        documents = allDocuments;
        break;
    }

    // Filter by category
    if (selectedCategoryId !== null) {
      documents = documents.filter((doc) => doc.category_id === selectedCategoryId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      documents = documents.filter(
        (doc) =>
          doc.file_name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
      );
    }

    // Sort documents
    const sorted = [...documents];
    switch (sortMode) {
      case 'name':
        sorted.sort((a, b) => a.file_name.localeCompare(b.file_name));
        break;
      case 'size':
        sorted.sort((a, b) => b.file_size - a.file_size);
        break;
      case 'date':
      default:
        sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return sorted;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getCategoryName = (categoryId: number | null): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  const renderDocumentItem = ({ item }: { item: Document }) => (
    <TouchableOpacity
      style={styles.documentItem}
      onPress={() => {
        // TODO: Navigate to document detail screen
        Alert.alert('View Document', `Opening: ${item.file_name}`);
      }}
    >
      <View style={styles.documentContent}>
        <View style={styles.documentHeader}>
          <Text style={styles.documentName} numberOfLines={1}>
            {item.file_name}
          </Text>
          <TouchableOpacity
            onPress={() => handleToggleFavorite(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>{item.is_favorite ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.documentMeta}>
          <Text style={styles.documentMetaText}>
            {getCategoryName(item.category_id)} • {formatFileSize(item.file_size)} • {formatDate(item.created_at)}
          </Text>
        </View>

        {item.description && (
          <Text style={styles.documentDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.documentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // TODO: Navigate to document viewer
              Alert.alert('View', `View: ${item.file_name}`);
            }}
          >
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteDocument(item)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📄</Text>
      <Text style={styles.emptyTitle}>No Documents Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Try adjusting your search or filters'
          : 'Upload your first document to get started'}
      </Text>
    </View>
  );

  const displayDocuments = getDisplayDocuments();

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_count}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.favorite_count}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatFileSize(stats.total_size)}</Text>
            <Text style={styles.statLabel}>Storage</Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search documents..."
          placeholderTextColor="#999"
        />
      </View>

      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'all' && styles.toggleButtonActive]}
          onPress={() => setViewMode('all')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'all' && styles.toggleButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'favorites' && styles.toggleButtonActive]}
          onPress={() => setViewMode('favorites')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'favorites' && styles.toggleButtonTextActive]}>
            Favorites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'recent' && styles.toggleButtonActive]}
          onPress={() => setViewMode('recent')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'recent' && styles.toggleButtonTextActive]}>
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortMode === 'date' && styles.sortButtonActive]}
          onPress={() => setSortMode('date')}
        >
          <Text style={[styles.sortButtonText, sortMode === 'date' && styles.sortButtonTextActive]}>
            Date
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortMode === 'name' && styles.sortButtonActive]}
          onPress={() => setSortMode('name')}
        >
          <Text style={[styles.sortButtonText, sortMode === 'name' && styles.sortButtonTextActive]}>
            Name
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortMode === 'size' && styles.sortButtonActive]}
          onPress={() => setSortMode('size')}
        >
          <Text style={[styles.sortButtonText, sortMode === 'size' && styles.sortButtonTextActive]}>
            Size
          </Text>
        </TouchableOpacity>
      </View>

      {/* Document List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      ) : (
        <FlatList
          data={displayDocuments}
          renderItem={renderDocumentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  toggleButtonActive: {
    backgroundColor: '#2196F3',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  sortButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  sortButtonActive: {
    backgroundColor: '#e3f2fd',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#2196F3',
    fontWeight: '500',
  },
  listContent: {
    padding: 10,
  },
  documentItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  documentContent: {
    padding: 15,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  favoriteIcon: {
    fontSize: 24,
    color: '#FFD700',
  },
  documentMeta: {
    marginBottom: 8,
  },
  documentMetaText: {
    fontSize: 12,
    color: '#999',
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#2196F3',
    marginLeft: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: '#fff',
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
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
});

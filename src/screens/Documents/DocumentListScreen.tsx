/**
 * Document List Screen
 * Displays all documents with search, filter, and sorting capabilities
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from 'react-native-toast-notifications';
import { DocumentListSkeleton } from '../../components/common/LoadingSkeleton';
import FilterModal, { DocumentFilters } from '../../components/documents/FilterModal';
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
    selectAllDocuments,
    selectDocumentError,
    selectDocumentLoading,
    selectDocumentStats,
    selectFavoriteDocuments,
    selectRecentDocuments,
    toggleFavorite,
} from '../../store/slices/documentSlice';
import type { Document } from '../../types/document';

type ViewMode = 'all' | 'favorites' | 'recent';
type SortMode = 'name' | 'date' | 'size' | 'type';

export default function DocumentListScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const colorScheme = useColorScheme();
  const allDocuments = useAppSelector(selectAllDocuments);
  const favoriteDocuments = useAppSelector(selectFavoriteDocuments);
  const recentDocuments = useAppSelector((state) => selectRecentDocuments(state, 20));
  const categories = useAppSelector(selectAllCategories);
  const loading = useAppSelector(selectDocumentLoading);
  const error = useAppSelector(selectDocumentError);
  const stats = useAppSelector(selectDocumentStats);

  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<DocumentFilters>({
    categoryIds: [],
    fileTypes: [],
    dateRange: { start: null, end: null },
    sizeRange: { min: null, max: null },
    favoritesOnly: false,
  });

  const loadUserData = useCallback(async () => {
    try {
      const id = await getCurrentUserId();
      if (id) {
        dispatch(loadCategories(id));
        dispatch(loadDocuments(undefined));
        dispatch(loadDocumentStats());
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      Alert.alert('Error', 'Failed to load user data');
    }
  }, [dispatch]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

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

  const handleToggleFavorite = useCallback(async (documentId: number, isFavorite: boolean) => {
    try {
      await dispatch(toggleFavorite(documentId)).unwrap();
      if (toast) {
        toast.show(
          isFavorite ? 'Removed from favorites' : 'Added to favorites',
          {
            type: 'success',
            duration: 1500,
          }
        );
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      if (toast) {
        toast.show('Failed to update favorite status', {
          type: 'danger',
          duration: 2000,
        });
      }
    }
  }, [dispatch, toast]);

  const handleDeleteDocument = useCallback((document: Document) => {
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
              await dispatch(removeDocument(document.id)).unwrap();
              if (toast) {
                toast.show('Document deleted successfully', {
                  type: 'success',
                  duration: 2000,
                });
              }
            } catch (err) {
              console.error('Failed to delete document:', err);
              if (toast) {
                toast.show('Failed to delete document', {
                  type: 'danger',
                  duration: 3000,
                });
              }
            }
          },
        },
      ]
    );
  }, [dispatch, toast]);

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.categoryIds.length > 0) count++;
    if (filters.fileTypes.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.sizeRange.min !== null || filters.sizeRange.max !== null) count++;
    if (filters.favoritesOnly) count++;
    return count;
  };

  const handleApplyFilters = (newFilters: DocumentFilters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    setFilters({
      categoryIds: [],
      fileTypes: [],
      dateRange: { start: null, end: null },
      sizeRange: { min: null, max: null },
      favoritesOnly: false,
    });
    setFilterModalVisible(false);
  };

  const getDisplayDocuments = useMemo((): Document[] => {
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

    // Filter by category (legacy support)
    if (selectedCategoryId !== null) {
      documents = documents.filter((doc) => doc.category_id === selectedCategoryId);
    }

    // Apply advanced filters
    // Filter by category IDs
    if (filters.categoryIds.length > 0) {
      documents = documents.filter((doc) => 
        doc.category_id !== null && filters.categoryIds.includes(doc.category_id)
      );
    }

    // Filter by file types
    if (filters.fileTypes.length > 0) {
      documents = documents.filter((doc) => {
        // Extract file extension from filename
        const ext = doc.filename.split('.').pop()?.toLowerCase() || '';
        return filters.fileTypes.some((type) => {
          switch (type) {
            case 'PDF':
              return ext === 'pdf' || doc.mime_type === 'application/pdf';
            case 'Images':
              return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic'].includes(ext) ||
                     doc.mime_type.startsWith('image/');
            case 'Text':
              return ['txt', 'doc', 'docx', 'rtf', 'md'].includes(ext) ||
                     doc.mime_type.startsWith('text/') ||
                     doc.mime_type === 'application/msword' ||
                     doc.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            default:
              return false;
          }
        });
      });
    }

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      documents = documents.filter((doc) => {
        const docDate = new Date(doc.created_at);
        if (filters.dateRange.start && docDate < filters.dateRange.start) return false;
        if (filters.dateRange.end) {
          const endOfDay = new Date(filters.dateRange.end);
          endOfDay.setHours(23, 59, 59, 999);
          if (docDate > endOfDay) return false;
        }
        return true;
      });
    }

    // Filter by size range
    if (filters.sizeRange.min !== null || filters.sizeRange.max !== null) {
      documents = documents.filter((doc) => {
        if (filters.sizeRange.min !== null && doc.file_size < filters.sizeRange.min) return false;
        if (filters.sizeRange.max !== null && doc.file_size > filters.sizeRange.max) return false;
        return true;
      });
    }

    // Filter by favorites only
    if (filters.favoritesOnly) {
      documents = documents.filter((doc) => doc.is_favorite);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      documents = documents.filter(
        (doc) =>
          doc.filename.toLowerCase().includes(query) ||
          doc.ocr_text?.toLowerCase().includes(query)
      );
    }

    // Sort documents
    const sorted = [...documents];
    switch (sortMode) {
      case 'name':
        sorted.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
      case 'size':
        sorted.sort((a, b) => b.file_size - a.file_size);
        break;
      case 'type':
        sorted.sort((a, b) => {
          const extA = a.filename.split('.').pop()?.toLowerCase() || '';
          const extB = b.filename.split('.').pop()?.toLowerCase() || '';
          return extA.localeCompare(extB);
        });
        break;
      case 'date':
      default:
        sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return sorted;
  }, [viewMode, allDocuments, favoriteDocuments, recentDocuments, selectedCategoryId, filters, searchQuery, sortMode]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  }, []);

  const getCategoryName = useCallback((categoryId: number | null): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || 'Unknown';
  }, [categories]);

  const renderDocumentItem = useCallback(({ item }: { item: Document }) => (
    <TouchableOpacity
      style={[styles.documentItem, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
      onPress={() => {
        router.push(`/document/${item.id}`);
      }}
    >
      <View style={styles.documentContent}>
        <View style={styles.documentHeader}>
          <Text style={[styles.documentName, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={1}>
            {item.filename}
          </Text>
          <TouchableOpacity
            onPress={() => handleToggleFavorite(item.id, item.is_favorite)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>{item.is_favorite ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.documentMeta}>
          <Text style={[styles.documentMetaText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            {getCategoryName(item.category_id)} • {formatFileSize(item.file_size)} • {formatDate(item.created_at)}
          </Text>
        </View>

        {item.ocr_text && (
          <Text style={[styles.documentDescription, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]} numberOfLines={2}>
            {item.ocr_text}
          </Text>
        )}

        <View style={styles.documentActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => {
              router.push(`/document/${item.id}`);
            }}
          >
            <Text style={[styles.actionButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>View</Text>
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
  ), [router, handleToggleFavorite, handleDeleteDocument, getCategoryName, formatFileSize, formatDate, colorScheme]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📄</Text>
      <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>No Documents Found</Text>
      <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
        {searchQuery
          ? 'Try adjusting your search or filters'
          : 'Upload your first document to get started'}
      </Text>
    </View>
  ), [searchQuery, colorScheme]);

  const displayDocuments = getDisplayDocuments;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['top']}>
      {/* Header with Stats */}
      {stats && (
        <View style={[styles.statsContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].tint }]}>{stats.totalDocuments}</Text>
            <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].tint }]}>{favoriteDocuments.length}</Text>
            <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Favorites</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].tint }]}>{formatFileSize(stats.totalSize)}</Text>
            <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Storage</Text>
          </View>
        </View>
      )}

      {/* Search Bar and Filter Button */}
      <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, color: Colors[colorScheme ?? 'light'].text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search documents..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
        />
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={[styles.filterButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>🔍 Filters</Text>
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={[styles.toggleContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }, viewMode === 'all' && { backgroundColor: Colors.primary }]}
          onPress={() => setViewMode('all')}
        >
          <Text style={[styles.toggleButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }, viewMode === 'all' && { color: '#fff', fontWeight: '600' }]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }, viewMode === 'favorites' && { backgroundColor: Colors.primary }]}
          onPress={() => setViewMode('favorites')}
        >
          <Text style={[styles.toggleButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }, viewMode === 'favorites' && { color: '#fff', fontWeight: '600' }]}>
            Favorites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }, viewMode === 'recent' && { backgroundColor: Colors.primary }]}
          onPress={() => setViewMode('recent')}
        >
          <Text style={[styles.toggleButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }, viewMode === 'recent' && { color: '#fff', fontWeight: '600' }]}>
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={[styles.sortContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <Text style={[styles.sortLabel, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }, sortMode === 'date' && styles.sortButtonActive]}
          onPress={() => setSortMode('date')}
        >
          <Text style={[styles.sortButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }, sortMode === 'date' && { color: Colors[colorScheme ?? 'light'].tint, fontWeight: '500' }]}>
            Date
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }, sortMode === 'name' && styles.sortButtonActive]}
          onPress={() => setSortMode('name')}
        >
          <Text style={[styles.sortButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }, sortMode === 'name' && { color: Colors[colorScheme ?? 'light'].tint, fontWeight: '500' }]}>
            Name
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }, sortMode === 'size' && styles.sortButtonActive]}
          onPress={() => setSortMode('size')}
        >
          <Text style={[styles.sortButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }, sortMode === 'size' && { color: Colors[colorScheme ?? 'light'].tint, fontWeight: '500' }]}>
            Size
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }, sortMode === 'type' && styles.sortButtonActive]}
          onPress={() => setSortMode('type')}
        >
          <Text style={[styles.sortButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }, sortMode === 'type' && { color: Colors[colorScheme ?? 'light'].tint, fontWeight: '500' }]}>
            Type
          </Text>
        </TouchableOpacity>
      </View>

      {/* Document List */}
      {loading && !refreshing ? (
        <DocumentListSkeleton count={8} />
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

      {/* Scan FAB (top button) */}
      <TouchableOpacity
        style={[styles.scanFab, { backgroundColor: '#4CAF50' }]}
        onPress={() => router.push('/scan' as any)}
      >
        <Text style={styles.fabIcon}>📷</Text>
      </TouchableOpacity>

      {/* Upload FAB (bottom button) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.primary }]}
        onPress={() => router.push('/document/upload')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        categories={categories}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onClose={() => setFilterModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  filterButton: {
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 10,
  },
  sortButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    borderRadius: 15,
  },
  sortButtonActive: {
    backgroundColor: 'transparent',
  },
  sortButtonText: {
    fontSize: 13,
  },
  listContent: {
    padding: 10,
    paddingBottom: 100, // Extra space for bottom nav + FABs
  },
  documentItem: {
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
  },
  documentDescription: {
    fontSize: 14,
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
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
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
  scanFab: {
    position: 'absolute',
    right: 20,
    bottom: 210, // Above bottom nav + more clearance
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 140, // Above bottom nav + more clearance
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});

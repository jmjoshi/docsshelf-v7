/**
 * Tag Management Screen
 * Allows users to create, edit, and delete tags
 */

import { BottomNavBar } from '@/src/components/navigation/BottomNavBar';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TagChip from '../../components/documents/TagChip';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    clearTagError,
    createNewTag,
    loadTags,
    loadTagStats,
    removeTag,
    selectAllTags,
    selectTagError,
    selectTagLoading,
    selectTagStats,
    updateExistingTag,
} from '../../store/slices/tagSlice';
import type { Tag, TagWithCount } from '../../types/document';

const COLOR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E67E22', '#34495E', '#16A085', '#D35400',
];

export default function TagManagementScreen() {
  const dispatch = useAppDispatch();
  const tags = useAppSelector(selectAllTags);
  const stats = useAppSelector(selectTagStats);
  const loading = useAppSelector(selectTagLoading);
  const error = useAppSelector(selectTagError);

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(loadTags());
    dispatch(loadTagStats());
  }, [dispatch]);

  const filteredTags = tags.filter((tag: Tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTag = () => {
    setEditingTag({ id: 0, name: '', color: COLOR_PALETTE[0], user_id: 0, created_at: '' } as Tag);
    setEditName('');
    setEditColor(COLOR_PALETTE[0]);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleSaveTag = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Tag name cannot be empty');
      return;
    }

    try {
      if (editingTag?.id === 0) {
        // Create new tag
        await dispatch(
          createNewTag({
            name: editName.trim(),
            color: editColor,
          })
        ).unwrap();
      } else if (editingTag) {
        // Update existing tag
        await dispatch(
          updateExistingTag({
            tagId: editingTag.id,
            updates: { name: editName.trim(), color: editColor },
          })
        ).unwrap();
      }
      setEditingTag(null);
      setEditName('');
      setEditColor('');
    } catch (err) {
      Alert.alert('Error', err as string);
    }
  };

  const handleDeleteTag = (tag: Tag) => {
    const docCount = (tag as TagWithCount).document_count || 0;
    const message =
      docCount > 0
        ? `This tag is used in ${docCount} document${docCount > 1 ? 's' : ''}. Are you sure you want to delete it?`
        : 'Are you sure you want to delete this tag?';

    Alert.alert('Delete Tag', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(removeTag(tag.id)).unwrap();
          } catch (err) {
            Alert.alert('Error', err as string);
          }
        },
      },
    ]);
  };

  const renderTagItem = ({ item }: { item: Tag & { document_count?: number } }) => (
    <View style={styles.tagItem}>
      <View style={styles.tagItemLeft}>
        <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
        <View style={styles.tagInfo}>
          <Text style={styles.tagName}>{item.name}</Text>
          <Text style={styles.tagCount}>
            {item.document_count || 0} document{(item.document_count || 0) !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      <View style={styles.tagActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditTag(item)}>
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteTag(item)}>
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tag Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateTag}>
          <Ionicons name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalTags}</Text>
            <Text style={styles.statLabel}>Total Tags</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalTaggedDocuments}</Text>
            <Text style={styles.statLabel}>Tagged Documents</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.avgTagsPerDocument.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Tags/Doc</Text>
          </View>
        </View>
      )}

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => dispatch(clearTagError())}>
            <Ionicons name="close" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}

      {/* Tags list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredTags}
          renderItem={renderTagItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No tags found' : 'No tags yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? 'Try a different search'
                  : 'Create your first tag using the + button above'}
              </Text>
            </View>
          }
        />
      )}

      {/* Edit/Create Tag Modal */}
      <Modal
        visible={editingTag !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingTag(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditingTag(null)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingTag?.id === 0 ? 'Create Tag' : 'Edit Tag'}
            </Text>
            <TouchableOpacity onPress={handleSaveTag}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewChip}>
                <TagChip
                  tag={{ ...editingTag!, name: editName || 'Tag Name', color: editColor }}
                  size="large"
                />
              </View>
            </View>

            {/* Tag Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tag Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter tag name"
                value={editName}
                onChangeText={setEditName}
                autoFocus
                maxLength={50}
              />
              <Text style={styles.formHint}>{editName.length}/50 characters</Text>
            </View>

            {/* Color Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tag Color</Text>
              <View style={styles.colorGrid}>
                {COLOR_PALETTE.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      editColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setEditColor(color)}
                  >
                    {editColor === color && (
                      <Ionicons name="checkmark" size={24} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Usage info for existing tags */}
            {editingTag && editingTag.id !== 0 && (
              <View style={styles.usageContainer}>
                <Ionicons name="information-circle" size={20} color="#666" />
                <Text style={styles.usageText}>
                  This tag is used in {(editingTag as TagWithCount).document_count || 0} document
                  {((editingTag as TagWithCount).document_count || 0) !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FF3B30',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tagItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tagCount: {
    fontSize: 13,
    color: '#999',
  },
  tagActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  previewContainer: {
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewChip: {
    alignItems: 'flex-start',
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  formHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#333',
    borderWidth: 3,
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  usageText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

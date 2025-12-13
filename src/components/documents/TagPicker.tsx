/**
 * TagPicker Component
 * Multi-select tag picker with search functionality
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    clearTagError,
    createNewTag,
    loadTags,
    selectAllTags,
    selectTagError,
    selectTagLoading,
} from '../../store/slices/tagSlice';
import type { Tag, TagWithCount } from '../../types/document';
import TagChip from './TagChip';

interface TagPickerProps {
  visible: boolean;
  selectedTagIds: number[];
  onClose: () => void;
  onSave: (tagIds: number[]) => void;
  title?: string;
}

export default function TagPicker({
  visible,
  selectedTagIds,
  onClose,
  onSave,
  title = 'Select Tags',
}: TagPickerProps) {
  const dispatch = useAppDispatch();
  const allTags = useAppSelector(selectAllTags);
  const loading = useAppSelector(selectTagLoading);
  const error = useAppSelector(selectTagError);

  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(selectedTagIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    if (visible) {
      dispatch(loadTags());
      setLocalSelectedIds(selectedTagIds);
      setSearchQuery('');
      setIsCreatingTag(false);
      setNewTagName('');
    }
  }, [visible, dispatch, selectedTagIds]);

  const filteredTags = allTags.filter((tag: Tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleTag = (tagId: number) => {
    setLocalSelectedIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = () => {
    onSave(localSelectedIds);
    onClose();
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const result = await dispatch(
        createNewTag({
          name: newTagName.trim(),
          color: generateRandomColor(),
        })
      ).unwrap();

      // Add newly created tag to selection
      setLocalSelectedIds((prev) => [...prev, result.id]);
      setIsCreatingTag(false);
      setNewTagName('');
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to create tag:', err);
    }
  };

  const generateRandomColor = () => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
      '#F8B739',
      '#52B788',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderTagItem = ({ item }: { item: Tag }) => {
    const isSelected = localSelectedIds.includes(item.id);
    const tagWithCount = item as TagWithCount;
    return (
      <TouchableOpacity style={styles.tagItem} onPress={() => handleToggleTag(item.id)}>
        <View style={styles.tagItemLeft}>
          <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
          <Text style={styles.tagName}>{item.name}</Text>
          {tagWithCount.document_count !== undefined && tagWithCount.document_count > 0 && (
            <Text style={styles.tagCount}>({tagWithCount.document_count})</Text>
          )}
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#007AFF" />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

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

        {/* Selected tags preview */}
        {localSelectedIds.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedLabel}>Selected ({localSelectedIds.length}):</Text>
            <View style={styles.selectedTags}>
              {allTags
                .filter((tag: Tag) => localSelectedIds.includes(tag.id))
                .map((tag: Tag) => (
                  <TagChip
                    key={tag.id}
                    tag={tag}
                    size="small"
                    removable
                    onRemove={() => handleToggleTag(tag.id)}
                  />
                ))}
            </View>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => dispatch(clearTagError())}>
              <Ionicons name="close" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}

        {/* Tag list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <>
            {/* Create new tag button */}
            {!isCreatingTag && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setIsCreatingTag(true)}
              >
                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                <Text style={styles.createButtonText}>Create New Tag</Text>
              </TouchableOpacity>
            )}

            {/* Create tag form */}
            {isCreatingTag && (
              <View style={styles.createForm}>
                <TextInput
                  style={styles.createInput}
                  placeholder="Tag name..."
                  value={newTagName}
                  onChangeText={setNewTagName}
                  autoFocus
                  maxLength={50}
                />
                <TouchableOpacity
                  style={[styles.createSaveButton, !newTagName.trim() && styles.createSaveButtonDisabled]}
                  onPress={handleCreateTag}
                  disabled={!newTagName.trim()}
                >
                  <Ionicons name="checkmark" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createCancelButton}
                  onPress={() => {
                    setIsCreatingTag(false);
                    setNewTagName('');
                  }}
                >
                  <Ionicons name="close" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            )}

            {/* Tags list */}
            <FlatList
              data={filteredTags}
              renderItem={renderTagItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="pricetag-outline" size={48} color="#CCC" />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No tags found' : 'No tags yet'}
                  </Text>
                  {!searchQuery && (
                    <Text style={styles.emptySubtext}>Create your first tag to get started</Text>
                  )}
                </View>
              }
            />
          </>
        )}
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    minWidth: 60,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'right',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 12,
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
  selectedContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  createForm: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  createInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  createSaveButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  createSaveButtonDisabled: {
    backgroundColor: '#CCC',
  },
  createCancelButton: {
    padding: 8,
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderRadius: 10,
  },
  tagItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  tagName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  tagCount: {
    fontSize: 14,
    color: '#999',
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
  },
});

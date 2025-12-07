/**
 * Category Management Screen
 * Allows users to organize documents into categories and folders
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUserId } from '../services/database/userService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    createCategory,
    deleteCategory,
    loadCategories,
    selectCategoryError,
    selectCategoryLoading,
    selectCategoryTree,
    setSelectedCategory,
    updateCategory,
} from '../store/slices/categorySlice';
import { CATEGORY_COLORS, CATEGORY_ICONS, CategoryTreeNode } from '../types/category';

export default function CategoryManagementScreen() {
  const dispatch = useAppDispatch();
  const categoryTree = useAppSelector(selectCategoryTree);
  const loading = useAppSelector(selectCategoryLoading);
  const error = useAppSelector(selectCategoryError);
  const colorScheme = useColorScheme();

  const [userId, setUserId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryTreeNode | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  // Form state
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [selectedColor, setSelectedColor] = useState('#2196F3');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadUserData();
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

  const handleRefresh = () => {
    if (userId) {
      dispatch(loadCategories(userId));
    }
  };

  const handleAddCategory = () => {
    console.log('handleAddCategory called');
    setSelectedParentId(null);
    setCategoryName('');
    setSelectedIcon('📁');
    setSelectedColor('#2196F3');
    setDescription('');
    setShowAddModal(true);
    console.log('Modal should be visible now');
  };

  const handleAddSubcategory = (parentId: number) => {
    setSelectedParentId(parentId);
    setCategoryName('');
    setSelectedIcon('📁');
    setSelectedColor('#2196F3');
    setDescription('');
    setShowAddModal(true);
  };

  const handleEditCategory = (category: CategoryTreeNode) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setSelectedIcon(category.icon || 'folder');
    setSelectedColor(category.color || '#2196F3');
    setDescription(category.description || '');
    setShowEditModal(true);
  };

  const handleDeleteCategory = (category: CategoryTreeNode) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?${
        category.children.length > 0
          ? '\n\nThis will also delete all subcategories.'
          : ''
      }${
        category.documentCount > 0
          ? `\n\nThis category contains ${category.documentCount} document(s).`
          : ''
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteCategory(category.id)).unwrap();
              Alert.alert('Success', 'Category deleted successfully');
              if (userId) {
                dispatch(loadCategories(userId));
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleSaveNewCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      await dispatch(
        createCategory({
          user_id: userId,
          name: categoryName.trim(),
          parent_id: selectedParentId,
          icon: selectedIcon,
          color: selectedColor,
          description: description.trim() || undefined,
        })
      ).unwrap();

      setShowAddModal(false);
      Alert.alert('Success', 'Category created successfully');
      dispatch(loadCategories(userId));
    } catch (err) {
      Alert.alert('Error', 'Failed to create category');
    }
  };

  const handleSaveEditCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (!editingCategory) return;

    try {
      await dispatch(
        updateCategory({
          id: editingCategory.id,
          updates: {
            name: categoryName.trim(),
            icon: selectedIcon,
            color: selectedColor,
            description: description.trim() || undefined,
          },
        })
      ).unwrap();

      setShowEditModal(false);
      Alert.alert('Success', 'Category updated successfully');
      if (userId) {
        dispatch(loadCategories(userId));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update category');
    }
  };

  const renderCategoryItem = ({ item, depth = 0 }: { item: CategoryTreeNode; depth?: number }) => (
    <View style={styles.categoryItemContainer}>
      <View style={[styles.categoryItem, { marginLeft: depth * 20, backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <TouchableOpacity
          style={styles.categoryContent}
          onPress={() => dispatch(setSelectedCategory(item.id))}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.color || Colors[colorScheme ?? 'light'].tint }]}>
            <Text style={styles.iconText}>{item.icon || '📁'}</Text>
          </View>
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryName, { color: Colors[colorScheme ?? 'light'].text }]}>{item.name}</Text>
            {item.description && (
              <Text style={[styles.categoryDescription, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]} numberOfLines={1}>
                {item.description}
              </Text>
            )}
            <Text style={[styles.categoryStats, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              {item.documentCount} document{item.documentCount !== 1 ? 's' : ''} • Depth: {item.depth}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }]}
            onPress={() => handleAddSubcategory(item.id)}
          >
            <Text style={styles.actionButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }]}
            onPress={() => handleEditCategory(item)}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCategory(item)}
          >
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {item.children.length > 0 && (
        <View>
          {item.children.map((child: CategoryTreeNode) => (
            <View key={child.id}>{renderCategoryItem({ item: child, depth: depth + 1 })}</View>
          ))}
        </View>
      )}
    </View>
  );

  const renderCategoryForm = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.formLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Category Name *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, borderColor: Colors[colorScheme ?? 'light'].border, color: Colors[colorScheme ?? 'light'].text }]}
        value={categoryName}
        onChangeText={setCategoryName}
        placeholder="Enter category name"
        placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
        maxLength={100}
      />

      <Text style={[styles.formLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, borderColor: Colors[colorScheme ?? 'light'].border, color: Colors[colorScheme ?? 'light'].text }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Optional description"
        placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
        multiline
        numberOfLines={3}
        maxLength={500}
      />

      <Text style={[styles.formLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Icon</Text>
      <View style={styles.iconGrid}>
        {CATEGORY_ICONS.slice(0, 12).map((icon: string) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconOption,
              { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground },
              selectedIcon === icon && { borderColor: Colors[colorScheme ?? 'light'].tint, backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' },
            ]}
            onPress={() => setSelectedIcon(icon)}
          >
            <Text style={styles.iconOptionText}>{icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.formLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Color</Text>
      <View style={styles.colorGrid}>
        {Object.values(CATEGORY_COLORS).slice(0, 12).map((color: string) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color as string },
              selectedColor === color && styles.colorOptionSelected,
            ]}
            onPress={() => setSelectedColor(color as string)}
          />
        ))}
      </View>
    </View>
  );

  if (loading && !categoryTree.length) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Categories</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={[styles.refreshButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }]} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} onPress={handleAddCategory}>
            <Text style={[styles.addButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>+ New Category</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {categoryTree.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text }]}>No categories yet</Text>
          <Text style={[styles.emptySubtext, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Create your first category to organize documents</Text>
        </View>
      ) : (
        <FlatList
          data={categoryTree}
          renderItem={({ item }) => renderCategoryItem({ item })}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      )}

      {/* Add Category Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {selectedParentId ? 'Add Subcategory' : 'Add Category'}
            </Text>
            {renderCategoryForm()}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: Colors.primary }]}
                onPress={handleSaveNewCategory}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Edit Category</Text>
            {renderCategoryForm()}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: Colors.primary }]}
                onPress={handleSaveEditCategory}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderBottomWidth: 1,
    borderBottomColor: '#ef5350',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  categoryItemContainer: {
    marginBottom: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 12,
    marginBottom: 2,
  },
  categoryStats: {
    fontSize: 11,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#000',
    borderWidth: 3,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

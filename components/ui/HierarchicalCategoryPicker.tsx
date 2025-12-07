/**
 * Hierarchical Category Picker
 * Displays categories in a tree structure with expand/collapse functionality
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Category } from '../../src/types/category';

interface CategoryWithCount extends Category {
  document_count?: number;
}

interface CategoryNode extends CategoryWithCount {
  children: CategoryNode[];
  level: number;
  isExpanded: boolean;
}

interface HierarchicalCategoryPickerProps {
  visible: boolean;
  categories: CategoryWithCount[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null, categoryName: string) => void;
  onClose: () => void;
  showUncategorized?: boolean;
  title?: string;
}

export function HierarchicalCategoryPicker({
  visible,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onClose,
  showUncategorized = true,
  title = 'Select Category',
}: HierarchicalCategoryPickerProps) {
  const insets = useSafeAreaInsets();
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Build category tree whenever categories change
    const tree = buildCategoryTree(categories);
    setCategoryTree(tree);
    
    // Auto-expand path to selected category
    if (selectedCategoryId) {
      const pathIds = findPathToCategory(categories, selectedCategoryId);
      setExpandedIds(new Set(pathIds));
    }
  }, [categories, selectedCategoryId]);

  const buildCategoryTree = (cats: CategoryWithCount[]): CategoryNode[] => {
    const map = new Map<number, CategoryNode>();
    const roots: CategoryNode[] = [];

    // First pass: Create all nodes
    cats.forEach(cat => {
      map.set(cat.id, {
        ...cat,
        children: [],
        level: 0,
        isExpanded: false,
      });
    });

    // Second pass: Build tree structure
    cats.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        const parent = map.get(cat.parent_id)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        roots.push(node);
      }
    });

    // Sort by sort_order then name at each level
    const sortNodes = (nodes: CategoryNode[]) => {
      nodes.sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(roots);
    return roots;
  };

  const findPathToCategory = (cats: CategoryWithCount[], targetId: number): number[] => {
    const path: number[] = [];
    const categoryMap = new Map(cats.map(c => [c.id, c]));
    
    let currentId: number | null = targetId;
    while (currentId) {
      const cat = categoryMap.get(currentId);
      if (!cat) break;
      if (cat.parent_id) {
        path.push(cat.parent_id);
      }
      currentId = cat.parent_id;
    }
    
    return path;
  };

  const toggleExpand = (categoryId: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSelectCategory = (categoryId: number | null, categoryName: string) => {
    onSelectCategory(categoryId, categoryName);
  };

  const renderCategoryNode = (node: CategoryNode): React.ReactNode => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = node.id === selectedCategoryId;

    return (
      <View key={node.id}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            { paddingLeft: 15 + (node.level * 20) },
            isSelected && styles.selectedCategory,
          ]}
          onPress={() => handleSelectCategory(node.id, node.name)}
          activeOpacity={0.7}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => toggleExpand(node.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.expandIcon}>
                {isExpanded ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.expandPlaceholder} />
          )}

          {/* Color Indicator */}
          <View style={[styles.colorIndicator, { backgroundColor: node.color }]} />

          {/* Icon (if present) */}
          {node.icon && <Text style={styles.categoryIcon}>{node.icon}</Text>}

          {/* Category Name */}
          <Text
            style={[
              styles.categoryName,
              isSelected && styles.selectedCategoryName,
            ]}
            numberOfLines={1}
          >
            {node.name}
          </Text>

          {/* Document Count */}
          {node.document_count !== undefined && node.document_count > 0 && (
            <Text style={styles.documentCount}>({node.document_count})</Text>
          )}

          {/* Folder Indicator */}
          {hasChildren && (
            <Text style={styles.folderIcon}>📁</Text>
          )}
        </TouchableOpacity>

        {/* Render Children if Expanded */}
        {isExpanded && hasChildren && (
          <View>
            {node.children.map(child => renderCategoryNode(child))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={true}>
            {/* Uncategorized Option */}
            {showUncategorized && (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  { paddingLeft: 15 },
                  selectedCategoryId === null && styles.selectedCategory,
                ]}
                onPress={() => handleSelectCategory(null, 'Uncategorized')}
              >
                <View style={styles.expandPlaceholder} />
                <View style={[styles.colorIndicator, { backgroundColor: '#999' }]} />
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategoryId === null && styles.selectedCategoryName,
                  ]}
                >
                  Uncategorized
                </Text>
              </TouchableOpacity>
            )}

            {/* Category Tree */}
            {categoryTree.map(node => renderCategoryNode(node))}

            {/* Empty State */}
            {categoryTree.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No categories available</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create categories to organize your documents
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  categoryList: {
    paddingTop: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#e3f2fd',
  },
  expandButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  expandPlaceholder: {
    width: 24,
    marginRight: 4,
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedCategoryName: {
    fontWeight: '600',
    color: '#2196F3',
  },
  documentCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  folderIcon: {
    fontSize: 16,
    marginLeft: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
});

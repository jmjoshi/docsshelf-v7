/**
 * File Explorer Screen
 * Windows Explorer-like interface for browsing categories and documents
 * Features: Tree view, expand/collapse, search, and document preview
 */

import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { getCurrentUserId } from '../../services/database/userService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  loadCategories,
  selectCategoryTree,
  selectCategoryLoading,
} from '../../store/slices/categorySlice';
import {
  loadDocuments,
  selectAllDocuments,
  selectDocumentLoading,
} from '../../store/slices/documentSlice';
import ExplorerTree from '../../components/explorer/ExplorerTree';
import { ExplorerNode, ExplorerState } from '../../types/explorer';
import type { CategoryTreeNode } from '../../types/category';
import type { Document } from '../../types/document';

export default function FileExplorerScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const categoryTree = useAppSelector(selectCategoryTree);
  const documents = useAppSelector(selectAllDocuments);
  const categoryLoading = useAppSelector(selectCategoryLoading);
  const documentLoading = useAppSelector(selectDocumentLoading);
  
  const [explorerState, setExplorerState] = useState<ExplorerState>({
    expandedNodes: new Set<string>(),
    selectedNodeId: null,
    searchQuery: '',
    viewMode: 'tree',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        await Promise.all([
          dispatch(loadCategories(userId)).unwrap(),
          dispatch(loadDocuments(undefined)).unwrap(),
        ]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load file explorer data');
    } finally {
      setInitialLoad(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  // Convert category tree and documents to explorer nodes
  const buildExplorerNodes = useCallback((): ExplorerNode[] => {
    const nodes: ExplorerNode[] = [];
    
    // Build tree from categories
    const buildCategoryNode = (
      category: CategoryTreeNode,
      depth: number = 0
    ): ExplorerNode => {
      const categoryDocs = documents.filter(
        (doc) => doc.category_id === category.id
      );
      
      const node: ExplorerNode = {
        id: `cat_${category.id}`,
        type: 'category',
        name: category.name,
        icon: category.icon || '📁',
        color: category.color || '#2196F3',
        depth,
        isExpanded: explorerState.expandedNodes.has(`cat_${category.id}`),
        hasChildren: (category.children && category.children.length > 0) || categoryDocs.length > 0,
        categoryId: category.id,
        documentCount: category.documentCount || 0,
        children: [],
      };
      
      // Add child categories
      if (category.children && category.children.length > 0) {
        node.children = category.children.map((child: CategoryTreeNode) =>
          buildCategoryNode(child, depth + 1)
        );
      }
      
      // Add documents
      const docNodes: ExplorerNode[] = categoryDocs.map((doc) => ({
        id: `doc_${doc.id}`,
        type: 'document',
        name: doc.original_filename,
        icon: '📄',
        depth: depth + 1,
        isExpanded: false,
        hasChildren: false,
        documentId: doc.id,
        fileSize: doc.file_size,
        mimeType: doc.mime_type,
        createdAt: doc.created_at,
        isFavorite: doc.is_favorite === 1,
        parentId: `cat_${category.id}`,
      }));
      
      node.children = [...(node.children || []), ...docNodes];
      
      return node;
    };
    
    // Build from root categories
    categoryTree.forEach((category) => {
      nodes.push(buildCategoryNode(category));
    });
    
    // Add uncategorized documents
    const uncategorizedDocs = documents.filter((doc) => !doc.category_id);
    if (uncategorizedDocs.length > 0) {
      const uncategorizedNode: ExplorerNode = {
        id: 'uncategorized',
        type: 'category',
        name: 'Uncategorized',
        icon: '📂',
        color: '#999',
        depth: 0,
        isExpanded: explorerState.expandedNodes.has('uncategorized'),
        hasChildren: true,
        documentCount: uncategorizedDocs.length,
        children: uncategorizedDocs.map((doc) => ({
          id: `doc_${doc.id}`,
          type: 'document',
          name: doc.original_filename,
          icon: '📄',
          depth: 1,
          isExpanded: false,
          hasChildren: false,
          documentId: doc.id,
          fileSize: doc.file_size,
          mimeType: doc.mime_type,
          createdAt: doc.created_at,
          isFavorite: doc.is_favorite === 1,
          parentId: 'uncategorized',
        })),
      };
      nodes.push(uncategorizedNode);
    }
    
    return nodes;
  }, [categoryTree, documents, explorerState.expandedNodes]);
  
  // Filter nodes based on search query
  const filterNodes = useCallback((nodes: ExplorerNode[], query: string): ExplorerNode[] => {
    if (!query.trim()) return nodes;
    
    const lowerQuery = query.toLowerCase();
    const filtered: ExplorerNode[] = [];
    
    const matchNode = (node: ExplorerNode): boolean => {
      return node.name.toLowerCase().includes(lowerQuery);
    };
    
    const filterNodeRecursive = (node: ExplorerNode): ExplorerNode | null => {
      const matches = matchNode(node);
      let filteredChildren: ExplorerNode[] = [];
      
      if (node.children) {
        filteredChildren = node.children
          .map(filterNodeRecursive)
          .filter((n): n is ExplorerNode => n !== null);
      }
      
      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          hasChildren: filteredChildren.length > 0,
        };
      }
      
      return null;
    };
    
    nodes.forEach(node => {
      const filtered = filterNodeRecursive(node);
      if (filtered) {
        filtered.push(filtered);
      }
    });
    
    return filtered;
  }, []);
  
  const explorerNodes = buildExplorerNodes();
  const filteredNodes = filterNodes(explorerNodes, explorerState.searchQuery);
  
  const handleNodePress = (node: ExplorerNode) => {
    if (node.type === 'document' && node.documentId) {
      // Navigate to document viewer
      router.push(`/document/${node.documentId}` as any);
    } else if (node.type === 'category') {
      // Toggle expand/collapse
      if (explorerState.expandedNodes.has(node.id)) {
        handleNodeCollapse(node.id);
      } else {
        handleNodeExpand(node.id);
      }
    }
    
    setExplorerState((prev) => ({
      ...prev,
      selectedNodeId: node.id,
    }));
  };
  
  const handleNodeExpand = (nodeId: string) => {
    setExplorerState((prev) => ({
      ...prev,
      expandedNodes: new Set([...prev.expandedNodes, nodeId]),
    }));
  };
  
  const handleNodeCollapse = (nodeId: string) => {
    setExplorerState((prev) => {
      const newExpanded = new Set(prev.expandedNodes);
      newExpanded.delete(nodeId);
      return {
        ...prev,
        expandedNodes: newExpanded,
      };
    });
  };
  
  const handleExpandAll = () => {
    const allNodeIds = new Set<string>();
    const collectNodeIds = (nodes: ExplorerNode[]) => {
      nodes.forEach((node) => {
        if (node.hasChildren) {
          allNodeIds.add(node.id);
        }
        if (node.children) {
          collectNodeIds(node.children);
        }
      });
    };
    collectNodeIds(explorerNodes);
    
    setExplorerState((prev) => ({
      ...prev,
      expandedNodes: allNodeIds,
    }));
  };
  
  const handleCollapseAll = () => {
    setExplorerState((prev) => ({
      ...prev,
      expandedNodes: new Set<string>(),
    }));
  };
  
  const clearSearch = () => {
    setExplorerState((prev) => ({
      ...prev,
      searchQuery: '',
    }));
  };
  
  if (initialLoad && (categoryLoading || documentLoading)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading file explorer...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>File Explorer</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleExpandAll} style={styles.headerButton}>
            <Ionicons name="expand-outline" size={22} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCollapseAll} style={styles.headerButton}>
            <Ionicons name="contract-outline" size={22} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
            <Ionicons name="refresh-outline" size={22} color={colors.tint} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.tabIconDefault} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search files and folders..."
          placeholderTextColor={colors.tabIconDefault}
          value={explorerState.searchQuery}
          onChangeText={(text) =>
            setExplorerState((prev) => ({ ...prev, searchQuery: text }))
          }
        />
        {explorerState.searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.statsText, { color: colors.tabIconDefault }]}>
          {categoryTree.length} {categoryTree.length === 1 ? 'category' : 'categories'} • {documents.length} {documents.length === 1 ? 'document' : 'documents'}
        </Text>
      </View>
      
      {/* Explorer Tree */}
      <ExplorerTree
        nodes={filteredNodes}
        expandedNodes={explorerState.expandedNodes}
        selectedNodeId={explorerState.selectedNodeId}
        onNodePress={handleNodePress}
        onNodeExpand={handleNodeExpand}
        onNodeCollapse={handleNodeCollapse}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  statsText: {
    fontSize: 13,
  },
});

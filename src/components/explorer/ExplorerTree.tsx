/**
 * Explorer Tree Component
 * Renders a hierarchical tree view of categories and documents
 * Uses FlatList for efficient rendering with virtual scrolling
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ExplorerNode, ExplorerTreeProps } from '../../types/explorer';
import ExplorerNodeComponent from './ExplorerNode';

export default function ExplorerTree({
  nodes,
  expandedNodes,
  selectedNodeId,
  onNodePress,
  onNodeExpand,
  onNodeCollapse,
}: ExplorerTreeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  // Flatten tree for FlatList rendering
  const flattenNodes = useCallback((
    nodes: ExplorerNode[],
    expanded: Set<string>,
    depth: number = 0
  ): ExplorerNode[] => {
    const flattened: ExplorerNode[] = [];
    
    for (const node of nodes) {
      flattened.push({ ...node, depth });
      
      if (node.children && node.children.length > 0 && expanded.has(node.id)) {
        flattened.push(...flattenNodes(node.children, expanded, depth + 1));
      }
    }
    
    return flattened;
  }, []);
  
  const flatNodes = useMemo(
    () => flattenNodes(nodes, expandedNodes),
    [nodes, expandedNodes, flattenNodes]
  );
  
  const renderNode = useCallback(({ item }: { item: ExplorerNode }) => (
    <ExplorerNodeComponent
      node={item}
      isExpanded={expandedNodes.has(item.id)}
      isSelected={selectedNodeId === item.id}
      onPress={() => onNodePress(item)}
      onExpand={() => onNodeExpand(item.id)}
      onCollapse={() => onNodeCollapse(item.id)}
    />
  ), [expandedNodes, selectedNodeId, onNodePress, onNodeExpand, onNodeCollapse]);
  
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
        No files or folders found
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
        Create a category or upload a document to get started
      </Text>
    </View>
  );
  
  if (flatNodes.length === 0) {
    return renderEmpty();
  }
  
  return (
    <FlatList
      data={flatNodes}
      renderItem={renderNode}
      keyExtractor={(item) => item.id}
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={true}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      windowSize={21}
      removeClippedSubviews={true}
      getItemLayout={(data, index) => ({
        length: 60,
        offset: 60 * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

/**
 * ExplorerTree Component Tests
 * Tests for the tree view container component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ExplorerTree from '../../src/components/explorer/ExplorerTree';
import { ExplorerNode } from '../../src/types/explorer';

// Mock dependencies
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@/constants/theme', () => ({
  Colors: {
    light: {
      text: '#000',
      background: '#FFF',
      tint: '#2196F3',
      tabIconDefault: '#666',
      border: '#E0E0E0',
      card: '#FFF',
    },
  },
}));

jest.mock('../../src/components/explorer/ExplorerNode', () => 'ExplorerNode');

describe('ExplorerTree Component', () => {
  const mockOnNodePress = jest.fn();
  const mockOnNodeExpand = jest.fn();
  const mockOnNodeCollapse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createTestNodes = (): ExplorerNode[] => [
    {
      id: 'cat_1',
      type: 'category',
      name: 'Category 1',
      icon: '📁',
      color: '#2196F3',
      depth: 0,
      isExpanded: false,
      hasChildren: true,
      categoryId: 1,
      documentCount: 2,
      children: [
        {
          id: 'doc_1',
          type: 'document',
          name: 'Document 1',
          icon: '📄',
          depth: 1,
          isExpanded: false,
          hasChildren: false,
          documentId: 1,
          fileSize: 1024,
          mimeType: 'application/pdf',
          createdAt: '2025-12-06',
          isFavorite: false,
          parentId: 'cat_1',
        },
        {
          id: 'doc_2',
          type: 'document',
          name: 'Document 2',
          icon: '📄',
          depth: 1,
          isExpanded: false,
          hasChildren: false,
          documentId: 2,
          fileSize: 2048,
          mimeType: 'image/jpeg',
          createdAt: '2025-12-06',
          isFavorite: true,
          parentId: 'cat_1',
        },
      ],
    },
    {
      id: 'cat_2',
      type: 'category',
      name: 'Category 2',
      icon: '📁',
      color: '#FF5722',
      depth: 0,
      isExpanded: false,
      hasChildren: false,
      categoryId: 2,
      documentCount: 0,
    },
  ];

  describe('Tree Rendering', () => {
    it('should render tree with nodes', () => {
      const nodes = createTestNodes();
      const { UNSAFE_getByType } = render(
        <ExplorerTree
          nodes={nodes}
          expandedNodes={new Set()}
          selectedNodeId={null}
          onNodePress={mockOnNodePress}
          onNodeExpand={mockOnNodeExpand}
          onNodeCollapse={mockOnNodeCollapse}
        />
      );

      expect(UNSAFE_getByType(require('react-native').FlatList)).toBeTruthy();
    });

    it('should render empty state when no nodes are provided', () => {
      const { getByText } = render(
        <ExplorerTree
          nodes={[]}
          expandedNodes={new Set()}
          selectedNodeId={null}
          onNodePress={mockOnNodePress}
          onNodeExpand={mockOnNodeExpand}
          onNodeCollapse={mockOnNodeCollapse}
        />
      );

      expect(getByText('No files or folders found')).toBeTruthy();
      expect(getByText('Create a category or upload a document to get started')).toBeTruthy();
    });
  });

  describe('Node Flattening', () => {
    it('should render only top-level nodes when none are expanded', () => {
      const nodes = createTestNodes();
      const { UNSAFE_getByType } = render(
        <ExplorerTree
          nodes={nodes}
          expandedNodes={new Set()}
          selectedNodeId={null}
          onNodePress={mockOnNodePress}
          onNodeExpand={mockOnNodeExpand}
          onNodeCollapse={mockOnNodeCollapse}
        />
      );

      const flatList = UNSAFE_getByType(require('react-native').FlatList);
      expect(flatList.props.data.length).toBe(2); // Only 2 top-level categories
    });

    it('should render children when parent is expanded', () => {
      const nodes = createTestNodes();
      const expandedNodes = new Set(['cat_1']);
      
      const { UNSAFE_getByType } = render(
        <ExplorerTree
          nodes={nodes}
          expandedNodes={expandedNodes}
          selectedNodeId={null}
          onNodePress={mockOnNodePress}
          onNodeExpand={mockOnNodeExpand}
          onNodeCollapse={mockOnNodeCollapse}
        />
      );

      const flatList = UNSAFE_getByType(require('react-native').FlatList);
      // 2 categories + 2 documents from expanded category = 4
      expect(flatList.props.data.length).toBe(4);
    });

    it('should handle multiple expanded nodes', () => {
      const nodes = createTestNodes();
      const expandedNodes = new Set(['cat_1', 'cat_2']);
      
      const { UNSAFE_getByType } = render(
        <ExplorerTree
          nodes={nodes}
          expandedNodes={expandedNodes}
          selectedNodeId={null}
          onNodePress={mockOnNodePress}
          onNodeExpand={mockOnNodeExpand}
          onNodeCollapse={mockOnNodeCollapse}
        />
      );

      const flatList = UNSAFE_getByType(require('react-native').FlatList);
      expect(flatList.props.data.length).toBe(4); // cat_1 has 2 children, cat_2 has 0
    });
  });

  describe('Performance Optimizations', () => {
    it('should have virtual scrolling props configured', () => {
      const nodes = createTestNodes();
      const { UNSAFE_getByType } = render(
        <ExplorerTree
          nodes={nodes}
          expandedNodes={new Set()}
          selectedNodeId={null}
          onNodePress={mockOnNodePress}
          onNodeExpand={mockOnNodeExpand}
          onNodeCollapse={mockOnNodeCollapse}
        />
      );

      const flatList = UNSAFE_getByType(require('react-native').FlatList);
      expect(flatList.props.initialNumToRender).toBe(20);
      expect(flatList.props.maxToRenderPerBatch).toBe(10);
      expect(flatList.props.windowSize).toBe(21);
      expect(flatList.props.removeClippedSubviews).toBe(true);
    });

    it('should have getItemLayout for performance', () => {
      const nodes = createTestNodes();
      const { UNSAFE_getByType } = render(
        <ExplorerTree
          nodes={nodes}
          expandedNodes={new Set()}
          selectedNodeId={null}
          onNodePress={mockOnNodePress}
          onNodeExpand={mockOnNodeExpand}
          onNodeCollapse={mockOnNodeCollapse}
        />
      );

      const flatList = UNSAFE_getByType(require('react-native').FlatList);
      expect(flatList.props.getItemLayout).toBeDefined();
      
      const layout = flatList.props.getItemLayout(null, 5);
      expect(layout).toEqual({
        length: 60,
        offset: 300, // 60 * 5
        index: 5,
      });
    });
  });

  describe('Node Callbacks', () => {
    it('should pass correct callbacks to nodes', () => {
      const nodes = createTestNodes();
      const { UNSAFE_getByType } = render(
        <ExplorerTree
          nodes={nodes}
          expandedNodes={new Set()}
          selectedNodeId={null}
          onNodePress={mockOnNodePress}
          onNodeExpand={mockOnNodeExpand}
          onNodeCollapse={mockOnNodeCollapse}
        />
      );

      const flatList = UNSAFE_getByType(require('react-native').FlatList);
      expect(flatList.props.renderItem).toBeDefined();
    });
  });
});

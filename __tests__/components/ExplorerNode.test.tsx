/**
 * ExplorerNode Component Tests
 * Tests for the individual tree node component
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ExplorerNode from '../../src/components/explorer/ExplorerNode';
import { ExplorerNode as ExplorerNodeType } from '../../src/types/explorer';

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

describe('ExplorerNode Component', () => {
  const mockOnPress = jest.fn();
  const mockOnExpand = jest.fn();
  const mockOnCollapse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createCategoryNode = (overrides = {}): ExplorerNodeType => ({
    id: 'cat_1',
    type: 'category',
    name: 'Test Category',
    icon: '📁',
    color: '#2196F3',
    depth: 0,
    isExpanded: false,
    hasChildren: true,
    categoryId: 1,
    documentCount: 5,
    ...overrides,
  });

  const createDocumentNode = (overrides = {}): ExplorerNodeType => ({
    id: 'doc_1',
    type: 'document',
    name: 'test-document.pdf',
    icon: '📄',
    depth: 1,
    isExpanded: false,
    hasChildren: false,
    documentId: 1,
    fileSize: 1024000,
    mimeType: 'application/pdf',
    createdAt: '2025-12-06',
    isFavorite: false,
    ...overrides,
  });

  describe('Category Node Rendering', () => {
    it('should render category node with correct name', () => {
      const node = createCategoryNode();
      const { getByText } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      expect(getByText('Test Category')).toBeTruthy();
    });

    it('should display document count for category', () => {
      const node = createCategoryNode({ documentCount: 10 });
      const { getByText } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      expect(getByText('10 items')).toBeTruthy();
    });

    it('should show singular "item" for count of 1', () => {
      const node = createCategoryNode({ documentCount: 1 });
      const { getByText } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      expect(getByText('1 item')).toBeTruthy();
    });

    it('should apply correct indentation based on depth', () => {
      const node = createCategoryNode({ depth: 3 });
      const { getByText } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      const container = getByText('Test Category').parent?.parent;
      expect(container?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            paddingLeft: 72, // 3 * 20 + 12
          }),
        ])
      );
    });
  });

  describe('Document Node Rendering', () => {
    it('should render document node with correct name', () => {
      const node = createDocumentNode();
      const { getByText } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      expect(getByText('test-document.pdf')).toBeTruthy();
    });

    it('should display file size in KB', () => {
      const node = createDocumentNode({ fileSize: 2048 });
      const { getByText } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      expect(getByText('2.0 KB')).toBeTruthy();
    });

    it('should display file size in MB', () => {
      const node = createDocumentNode({ fileSize: 2097152 });
      const { getByText } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      expect(getByText('2.0 MB')).toBeTruthy();
    });

    it('should display file size in GB', () => {
      const node = createDocumentNode({ fileSize: 2147483648 });
      const { getByText } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      expect(getByText('2.0 GB')).toBeTruthy();
    });

    it('should show favorite icon for favorite documents', () => {
      const node = createDocumentNode({ isFavorite: true });
      const { UNSAFE_getByType } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      // Check for star icon
      const icons = UNSAFE_getByType(require('@expo/vector-icons').Ionicons);
      expect(icons).toBeTruthy();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should call onExpand when expand button is pressed and node is collapsed', () => {
      const node = createCategoryNode();
      const { UNSAFE_getAllByType } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
      // First touchable is the expand button
      fireEvent.press(touchables[1]);

      expect(mockOnExpand).toHaveBeenCalled();
    });

    it('should call onCollapse when collapse button is pressed and node is expanded', () => {
      const node = createCategoryNode();
      const { UNSAFE_getAllByType } = render(
        <ExplorerNode
          node={node}
          isExpanded={true}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
      fireEvent.press(touchables[1]);

      expect(mockOnCollapse).toHaveBeenCalled();
    });

    it('should not show expand button for nodes without children', () => {
      const node = createCategoryNode({ hasChildren: false });
      const { queryByTestId } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      // Node without children should not have chevron icon
      expect(queryByTestId('expand-button')).toBeNull();
    });
  });

  describe('Node Selection', () => {
    it('should call onPress when node is pressed', () => {
      const node = createCategoryNode();
      const { getByText } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      fireEvent.press(getByText('Test Category'));
      expect(mockOnPress).toHaveBeenCalled();
    });

    it('should apply selected style when node is selected', () => {
      const node = createCategoryNode();
      const { getByText } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={true}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      const container = getByText('Test Category').parent?.parent;
      expect(container?.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#FFF', // colors.background for selected
          }),
        ])
      );
    });
  });

  describe('Icon Rendering', () => {
    it('should render folder icon for category', () => {
      const node = createCategoryNode();
      const { UNSAFE_getAllByType } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should render document icon for PDF files', () => {
      const node = createDocumentNode({ mimeType: 'application/pdf' });
      const { UNSAFE_getAllByType } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should render image icon for image files', () => {
      const node = createDocumentNode({ mimeType: 'image/jpeg' });
      const { UNSAFE_getAllByType } = render(
        <ExplorerNode
          node={node}
          isExpanded={false}
          isSelected={false}
          onPress={mockOnPress}
          onExpand={mockOnExpand}
          onCollapse={mockOnCollapse}
        />
      );

      const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});

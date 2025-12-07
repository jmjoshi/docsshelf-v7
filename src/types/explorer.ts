/**
 * File Explorer Type Definitions
 * Types for the Windows Explorer-like file browser interface
 */

export interface ExplorerNode {
  id: string;
  type: 'category' | 'document';
  name: string;
  icon: string;
  color?: string;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  children?: ExplorerNode[];
  parentId?: string | null;
  
  // For categories
  categoryId?: number;
  documentCount?: number;
  
  // For documents
  documentId?: number;
  fileSize?: number;
  mimeType?: string;
  createdAt?: string;
  isFavorite?: boolean;
}

export interface ExplorerState {
  expandedNodes: Set<string>;
  selectedNodeId: string | null;
  searchQuery: string;
  viewMode: 'tree' | 'list';
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
}

export interface ExplorerTreeProps {
  nodes: ExplorerNode[];
  expandedNodes: Set<string>;
  selectedNodeId: string | null;
  onNodePress: (node: ExplorerNode) => void;
  onNodeExpand: (nodeId: string) => void;
  onNodeCollapse: (nodeId: string) => void;
}

export interface ExplorerNodeProps {
  node: ExplorerNode;
  isExpanded: boolean;
  isSelected: boolean;
  onPress: () => void;
  onExpand: () => void;
  onCollapse: () => void;
}

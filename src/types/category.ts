/**
 * TypeScript type definitions for Category domain
 */

export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  parent_id: number | null;
  user_id: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: number | null;
  sort_order?: number;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string | null;
  icon?: string;
  color?: string;
  parent_id?: number | null;
  sort_order?: number;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  documentCount: number;
  depth: number;
}

export interface CategoryStats {
  id: number;
  name: string;
  documentCount: number;
  totalSize: number;
  lastUpdated: string | null;
}

/**
 * Available category icons (Material Icons)
 */
export const CATEGORY_ICONS = [
  'folder',
  'folder-open',
  'work',
  'home',
  'school',
  'account-balance',
  'receipt',
  'description',
  'assignment',
  'article',
  'book',
  'bookmark',
  'card-travel',
  'business',
  'car-rental',
  'credit-card',
  'event',
  'health-and-safety',
  'local-hospital',
  'medical-services',
  'savings',
  'account-box',
  'badge',
  'contacts',
  'mail',
  'phone',
  'star',
  'favorite',
  'label',
  'category',
  'shopping-cart',
  'restaurant',
  'fitness-center',
  'sports',
  'flight',
  'hotel',
  'beach-access',
  'camera',
  'music-note',
  'movie',
  'palette',
  'build',
  'settings',
  'vpn-key',
  'security',
  'verified-user',
  'gavel',
  'policy',
  'receipt-long',
] as const;

export type CategoryIcon = (typeof CATEGORY_ICONS)[number];

/**
 * Material Design color palette for categories
 */
export const CATEGORY_COLORS = [
  '#007AFF', // Blue (default)
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#00C7BE', // Teal
  '#5AC8FA', // Light Blue
  '#AF52DE', // Purple
  '#FF2D55', // Pink
  '#A2845E', // Brown
  '#8E8E93', // Gray
  '#000000', // Black
  '#E91E63', // Material Pink
  '#9C27B0', // Material Purple
  '#673AB7', // Material Deep Purple
  '#3F51B5', // Material Indigo
  '#2196F3', // Material Blue
  '#03A9F4', // Material Light Blue
  '#00BCD4', // Material Cyan
  '#009688', // Material Teal
  '#4CAF50', // Material Green
  '#8BC34A', // Material Light Green
  '#CDDC39', // Material Lime
  '#FFEB3B', // Material Yellow
  '#FFC107', // Material Amber
  '#FF9800', // Material Orange
  '#FF5722', // Material Deep Orange
  '#795548', // Material Brown
  '#607D8B', // Material Blue Gray
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

/**
 * Category validation rules
 */
export const CATEGORY_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_DEPTH: 10, // Maximum nesting level
} as const;

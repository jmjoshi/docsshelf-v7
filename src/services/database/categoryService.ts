/**
 * Category Service
 * Handles CRUD operations for categories and folders
 * Production-grade with security, validation, and audit logging
 */

import { db } from './dbInit';
import type {
  Category,
  CategoryCreateInput,
  CategoryStats,
  CategoryTreeNode,
  CategoryUpdateInput,
} from '../../types/category';
import { getCurrentUserId } from './userService';
import { logAudit } from './auditService';

/**
 * Get all categories for current user
 */
export async function getCategories(userId?: number): Promise<Category[]> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const categories = await db.getAllAsync<Category>(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY parent_id, sort_order, name',
      [currentUserId]
    );

    return categories;
  } catch (error) {
    console.error('Failed to get categories:', error);
    throw new Error('Failed to retrieve categories');
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: number, userId?: number): Promise<Category | null> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const category = await db.getFirstAsync<Category>(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [categoryId, currentUserId]
    );

    return category || null;
  } catch (error) {
    console.error('Failed to get category:', error);
    throw new Error('Failed to retrieve category');
  }
}

/**
 * Get category tree structure
 */
export async function getCategoryTree(userId?: number): Promise<CategoryTreeNode[]> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Get all categories
    const categories = await getCategories(currentUserId);
    
    // Get document counts for each category
    const documentCounts = await db.getAllAsync<{ category_id: number; count: number }>(
      'SELECT category_id, COUNT(*) as count FROM documents WHERE user_id = ? AND category_id IS NOT NULL GROUP BY category_id',
      [currentUserId]
    );
    
    const countMap = new Map(documentCounts.map(dc => [dc.category_id, dc.count]));
    
    // Build tree structure
    const categoryMap = new Map<number, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];
    
    // First pass: Create tree nodes
    categories.forEach(category => {
      const node: CategoryTreeNode = {
        ...category,
        children: [],
        documentCount: countMap.get(category.id) || 0,
        depth: 0,
      };
      categoryMap.set(category.id, node);
    });
    
    // Second pass: Build hierarchy and calculate depths
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(node);
          node.depth = parent.depth + 1;
        } else {
          // Parent not found, treat as root
          rootCategories.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });
    
    // Sort children recursively
    const sortChildren = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => sortChildren(node.children));
    };
    
    sortChildren(rootCategories);
    
    return rootCategories;
  } catch (error) {
    console.error('Failed to get category tree:', error);
    throw new Error('Failed to retrieve category tree');
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  input: CategoryCreateInput,
  userId?: number
): Promise<Category> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Category name is required');
    }

    if (input.name.length > 100) {
      throw new Error('Category name is too long (max 100 characters)');
    }

    // Check if parent exists (if provided)
    if (input.parent_id) {
      const parent = await getCategoryById(input.parent_id, currentUserId);
      if (!parent) {
        throw new Error('Parent category not found');
      }
      
      // Check depth limit
      const depth = await calculateCategoryDepth(input.parent_id, currentUserId);
      if (depth >= 10) {
        throw new Error('Maximum category nesting depth reached (10 levels)');
      }
    }

    // Insert category
    const result = await db.runAsync(
      `INSERT INTO categories (name, description, icon, color, parent_id, user_id, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        input.name.trim(),
        input.description || null,
        input.icon || 'folder',
        input.color || '#007AFF',
        input.parent_id || null,
        currentUserId,
        input.sort_order || 0,
      ]
    );

    const categoryId = result.lastInsertRowId;

    // Log audit
    await logAudit(currentUserId, 'CREATE', 'category', categoryId, {
      name: input.name,
      parent_id: input.parent_id,
    });

    // Retrieve and return the created category
    const category = await getCategoryById(categoryId, currentUserId);
    
    if (!category) {
      throw new Error('Failed to retrieve created category');
    }

    return category;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error instanceof Error ? error : new Error('Failed to create category');
  }
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryId: number,
  input: CategoryUpdateInput,
  userId?: number
): Promise<Category> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Verify category exists and belongs to user
    const existing = await getCategoryById(categoryId, currentUserId);
    if (!existing) {
      throw new Error('Category not found');
    }

    // Validate name if provided
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        throw new Error('Category name cannot be empty');
      }
      if (input.name.length > 100) {
        throw new Error('Category name is too long (max 100 characters)');
      }
    }

    // Prevent circular references
    if (input.parent_id !== undefined && input.parent_id !== null) {
      if (input.parent_id === categoryId) {
        throw new Error('Category cannot be its own parent');
      }
      
      // Check if new parent exists
      const newParent = await getCategoryById(input.parent_id, currentUserId);
      if (!newParent) {
        throw new Error('Parent category not found');
      }
      
      // Check if new parent is a descendant of this category
      const isDescendant = await isDescendantOf(input.parent_id, categoryId, currentUserId);
      if (isDescendant) {
        throw new Error('Cannot move category to its own descendant');
      }
      
      // Check depth limit
      const depth = await calculateCategoryDepth(input.parent_id, currentUserId);
      if (depth >= 10) {
        throw new Error('Maximum category nesting depth reached (10 levels)');
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name.trim());
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.icon !== undefined) {
      updates.push('icon = ?');
      values.push(input.icon);
    }
    if (input.color !== undefined) {
      updates.push('color = ?');
      values.push(input.color);
    }
    if (input.parent_id !== undefined) {
      updates.push('parent_id = ?');
      values.push(input.parent_id);
    }
    if (input.sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(input.sort_order);
    }

    if (updates.length === 0) {
      // No changes
      return existing;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(categoryId, currentUserId);

    await db.runAsync(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    // Log audit
    await logAudit(currentUserId, 'UPDATE', 'category', categoryId, input);

    // Retrieve and return updated category
    const updated = await getCategoryById(categoryId, currentUserId);
    
    if (!updated) {
      throw new Error('Failed to retrieve updated category');
    }

    return updated;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error instanceof Error ? error : new Error('Failed to update category');
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(
  categoryId: number,
  moveDocumentsTo?: number | null,
  userId?: number
): Promise<void> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Verify category exists and belongs to user
    const category = await getCategoryById(categoryId, currentUserId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has documents
    const docCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM documents WHERE category_id = ? AND user_id = ?',
      [categoryId, currentUserId]
    );

    if (docCount && docCount.count > 0) {
      if (moveDocumentsTo !== undefined) {
        // Move documents to another category or uncategorized
        await db.runAsync(
          'UPDATE documents SET category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE category_id = ? AND user_id = ?',
          [moveDocumentsTo, categoryId, currentUserId]
        );
      } else {
        throw new Error(`Category contains ${docCount.count} document(s). Please specify where to move them or delete them first.`);
      }
    }

    // Move child categories to parent or root
    const newParentId = category.parent_id || null;
    await db.runAsync(
      'UPDATE categories SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE parent_id = ? AND user_id = ?',
      [newParentId, categoryId, currentUserId]
    );

    // Delete category
    await db.runAsync(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [categoryId, currentUserId]
    );

    // Log audit
    await logAudit(currentUserId, 'DELETE', 'category', categoryId, {
      name: category.name,
      document_count: docCount?.count || 0,
      moved_to: moveDocumentsTo,
    });
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error instanceof Error ? error : new Error('Failed to delete category');
  }
}

/**
 * Get category statistics
 */
export async function getCategoryStats(userId?: number): Promise<CategoryStats[]> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const stats = await db.getAllAsync<CategoryStats>(
      `SELECT 
        c.id,
        c.name,
        COUNT(d.id) as documentCount,
        COALESCE(SUM(d.file_size), 0) as totalSize,
        MAX(d.updated_at) as lastUpdated
       FROM categories c
       LEFT JOIN documents d ON d.category_id = c.id AND d.user_id = c.user_id
       WHERE c.user_id = ?
       GROUP BY c.id, c.name
       ORDER BY c.name`,
      [currentUserId]
    );

    return stats;
  } catch (error) {
    console.error('Failed to get category stats:', error);
    throw new Error('Failed to retrieve category statistics');
  }
}

/**
 * Search categories by name
 */
export async function searchCategories(query: string, userId?: number): Promise<Category[]> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const categories = await db.getAllAsync<Category>(
      `SELECT * FROM categories 
       WHERE user_id = ? AND name LIKE ? 
       ORDER BY name`,
      [currentUserId, `%${query}%`]
    );

    return categories;
  } catch (error) {
    console.error('Failed to search categories:', error);
    throw new Error('Failed to search categories');
  }
}

/**
 * Reorder categories
 */
export async function reorderCategories(
  categoryIds: number[],
  userId?: number
): Promise<void> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Update sort_order for each category
    for (let i = 0; i < categoryIds.length; i++) {
      await db.runAsync(
        'UPDATE categories SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [i, categoryIds[i], currentUserId]
      );
    }

    await logAudit(currentUserId, 'REORDER', 'category', null, {
      category_ids: categoryIds,
    });
  } catch (error) {
    console.error('Failed to reorder categories:', error);
    throw new Error('Failed to reorder categories');
  }
}

/**
 * Helper: Calculate category depth
 */
async function calculateCategoryDepth(categoryId: number, userId: number): Promise<number> {
  let depth = 0;
  let currentId: number | null = categoryId;

  while (currentId !== null && depth < 20) { // Safety limit
    const category = await getCategoryById(currentId, userId);
    if (!category) break;
    currentId = category.parent_id;
    depth++;
  }

  return depth;
}

/**
 * Helper: Check if target is a descendant of source
 */
async function isDescendantOf(
  targetId: number,
  sourceId: number,
  userId: number
): Promise<boolean> {
  let currentId: number | null = targetId;

  while (currentId !== null) {
    if (currentId === sourceId) {
      return true;
    }
    const category = await getCategoryById(currentId, userId);
    if (!category) break;
    currentId = category.parent_id;
  }

  return false;
}

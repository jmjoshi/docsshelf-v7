/**
 * Tag Service
 * Handles CRUD operations for tags and document-tag associations
 */

import type { Tag, TagCreateInput } from '../../types/document';
import { logAudit } from './auditService';
import { db } from './dbInit';
import { getCurrentUserId } from './userService';

/**
 * Create a new tag
 */
export async function createTag(input: TagCreateInput): Promise<Tag> {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const { name, color = '#666666' } = input;

    // Validate tag name
    if (!name || name.trim().length === 0) {
      throw new Error('Tag name is required');
    }

    if (name.length > 50) {
      throw new Error('Tag name must be 50 characters or less');
    }

    // Check for duplicate tag name (case-insensitive)
    const existing = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tags WHERE user_id = ? AND LOWER(name) = LOWER(?)',
      [currentUserId, name.trim()]
    );

    if (existing && existing.count > 0) {
      throw new Error('A tag with this name already exists');
    }

    // Insert tag
    const result = await db.runAsync(
      'INSERT INTO tags (user_id, name, color, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [currentUserId, name.trim(), color]
    );

    const tagId = result.lastInsertRowId;

    // Log audit
    await logAudit(currentUserId, 'CREATE', 'tag', tagId, {
      name: name.trim(),
      color,
    });

    // Retrieve and return created tag
    const tag = await getTagById(tagId, currentUserId);
    if (!tag) {
      throw new Error('Failed to retrieve created tag');
    }

    return tag;
  } catch (error) {
    console.error('Failed to create tag:', error);
    throw error instanceof Error ? error : new Error('Failed to create tag');
  }
}

/**
 * Get tag by ID
 */
export async function getTagById(tagId: number, userId?: number): Promise<Tag | null> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const tag = await db.getFirstAsync<Tag>(
      'SELECT * FROM tags WHERE id = ? AND user_id = ?',
      [tagId, currentUserId]
    );

    return tag || null;
  } catch (error) {
    console.error('Failed to get tag:', error);
    return null;
  }
}

/**
 * Get all tags for current user
 */
export async function getTags(userId?: number): Promise<Tag[]> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const tags = await db.getAllAsync<Tag>(
      'SELECT * FROM tags WHERE user_id = ? ORDER BY name COLLATE NOCASE ASC',
      [currentUserId]
    );

    return tags;
  } catch (error) {
    console.error('Failed to get tags:', error);
    return [];
  }
}

/**
 * Get tags with usage count
 */
export async function getTagsWithCount(userId?: number): Promise<(Tag & { document_count: number })[]> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const tags = await db.getAllAsync<Tag & { document_count: number }>(
      `SELECT 
        t.*,
        COUNT(DISTINCT dt.document_id) as document_count
      FROM tags t
      LEFT JOIN document_tags dt ON t.id = dt.tag_id
      WHERE t.user_id = ?
      GROUP BY t.id
      ORDER BY t.name COLLATE NOCASE ASC`,
      [currentUserId]
    );

    return tags;
  } catch (error) {
    console.error('Failed to get tags with count:', error);
    return [];
  }
}

/**
 * Update tag
 */
export async function updateTag(
  tagId: number,
  updates: { name?: string; color?: string },
  userId?: number
): Promise<Tag> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Verify tag exists and belongs to user
    const existingTag = await getTagById(tagId, currentUserId);
    if (!existingTag) {
      throw new Error('Tag not found');
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        throw new Error('Tag name cannot be empty');
      }

      if (updates.name.length > 50) {
        throw new Error('Tag name must be 50 characters or less');
      }

      // Check for duplicate name (excluding current tag)
      const duplicate = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM tags WHERE user_id = ? AND LOWER(name) = LOWER(?) AND id != ?',
        [currentUserId, updates.name.trim(), tagId]
      );

      if (duplicate && duplicate.count > 0) {
        throw new Error('A tag with this name already exists');
      }

      updateFields.push('name = ?');
      updateValues.push(updates.name.trim());
    }

    if (updates.color !== undefined) {
      updateFields.push('color = ?');
      updateValues.push(updates.color);
    }

    if (updateFields.length === 0) {
      return existingTag; // No updates
    }

    // Execute update
    updateValues.push(tagId, currentUserId);
    await db.runAsync(
      `UPDATE tags SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    // Log audit
    await logAudit(currentUserId, 'UPDATE', 'tag', tagId, updates);

    // Retrieve and return updated tag
    const updatedTag = await getTagById(tagId, currentUserId);
    if (!updatedTag) {
      throw new Error('Failed to retrieve updated tag');
    }

    return updatedTag;
  } catch (error) {
    console.error('Failed to update tag:', error);
    throw error instanceof Error ? error : new Error('Failed to update tag');
  }
}

/**
 * Delete tag
 */
export async function deleteTag(tagId: number, userId?: number): Promise<void> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Verify tag exists and belongs to user
    const existingTag = await getTagById(tagId, currentUserId);
    if (!existingTag) {
      throw new Error('Tag not found');
    }

    // Delete tag (document_tags entries will be cascade deleted)
    await db.runAsync('DELETE FROM tags WHERE id = ? AND user_id = ?', [tagId, currentUserId]);

    // Log audit
    await logAudit(currentUserId, 'DELETE', 'tag', tagId, {
      name: existingTag.name,
    });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    throw error instanceof Error ? error : new Error('Failed to delete tag');
  }
}

/**
 * Add tag to document
 */
export async function addTagToDocument(
  documentId: number,
  tagId: number,
  userId?: number
): Promise<void> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Verify document exists and belongs to user
    const document = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM documents WHERE id = ? AND user_id = ?',
      [documentId, currentUserId]
    );

    if (!document) {
      throw new Error('Document not found');
    }

    // Verify tag exists and belongs to user
    const tag = await getTagById(tagId, currentUserId);
    if (!tag) {
      throw new Error('Tag not found');
    }

    // Check if association already exists
    const existing = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM document_tags WHERE document_id = ? AND tag_id = ?',
      [documentId, tagId]
    );

    if (existing && existing.count > 0) {
      return; // Already associated, silently succeed
    }

    // Create association
    await db.runAsync(
      'INSERT INTO document_tags (document_id, tag_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [documentId, tagId]
    );

    // Log audit
    await logAudit(currentUserId, 'CREATE', 'document_tag', documentId, {
      document_id: documentId,
      tag_id: tagId,
      tag_name: tag.name,
    });
  } catch (error) {
    console.error('Failed to add tag to document:', error);
    throw error instanceof Error ? error : new Error('Failed to add tag to document');
  }
}

/**
 * Remove tag from document
 */
export async function removeTagFromDocument(
  documentId: number,
  tagId: number,
  userId?: number
): Promise<void> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Verify document exists and belongs to user
    const document = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM documents WHERE id = ? AND user_id = ?',
      [documentId, currentUserId]
    );

    if (!document) {
      throw new Error('Document not found');
    }

    // Delete association
    await db.runAsync('DELETE FROM document_tags WHERE document_id = ? AND tag_id = ?', [
      documentId,
      tagId,
    ]);

    // Log audit
    await logAudit(currentUserId, 'DELETE', 'document_tag', documentId, {
      document_id: documentId,
      tag_id: tagId,
    });
  } catch (error) {
    console.error('Failed to remove tag from document:', error);
    throw error instanceof Error ? error : new Error('Failed to remove tag from document');
  }
}

/**
 * Get all tags for a document
 */
export async function getDocumentTags(documentId: number, userId?: number): Promise<Tag[]> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const tags = await db.getAllAsync<Tag>(
      `SELECT t.* 
      FROM tags t
      INNER JOIN document_tags dt ON t.id = dt.tag_id
      WHERE dt.document_id = ? AND t.user_id = ?
      ORDER BY t.name COLLATE NOCASE ASC`,
      [documentId, currentUserId]
    );

    return tags;
  } catch (error) {
    console.error('Failed to get document tags:', error);
    return [];
  }
}

/**
 * Set tags for a document (replaces all existing tags)
 */
export async function setDocumentTags(
  documentId: number,
  tagIds: number[],
  userId?: number
): Promise<void> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Verify document exists and belongs to user
    const document = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM documents WHERE id = ? AND user_id = ?',
      [documentId, currentUserId]
    );

    if (!document) {
      throw new Error('Document not found');
    }

    // Remove all existing tags
    await db.runAsync('DELETE FROM document_tags WHERE document_id = ?', [documentId]);

    // Add new tags
    for (const tagId of tagIds) {
      await addTagToDocument(documentId, tagId, currentUserId);
    }
  } catch (error) {
    console.error('Failed to set document tags:', error);
    throw error instanceof Error ? error : new Error('Failed to set document tags');
  }
}

/**
 * Get documents by tag
 */
export async function getDocumentsByTag(
  tagId: number,
  userId?: number
): Promise<{ id: number; filename: string; created_at: string }[]> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const documents = await db.getAllAsync<{ id: number; filename: string; created_at: string }>(
      `SELECT d.id, d.filename, d.created_at
      FROM documents d
      INNER JOIN document_tags dt ON d.id = dt.document_id
      WHERE dt.tag_id = ? AND d.user_id = ?
      ORDER BY d.created_at DESC`,
      [tagId, currentUserId]
    );

    return documents;
  } catch (error) {
    console.error('Failed to get documents by tag:', error);
    return [];
  }
}

/**
 * Search tags by name
 */
export async function searchTags(query: string, userId?: number): Promise<Tag[]> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    if (!query || query.trim().length === 0) {
      return getTags(currentUserId);
    }

    const tags = await db.getAllAsync<Tag>(
      `SELECT * FROM tags 
      WHERE user_id = ? AND name LIKE ?
      ORDER BY name COLLATE NOCASE ASC`,
      [currentUserId, `%${query}%`]
    );

    return tags;
  } catch (error) {
    console.error('Failed to search tags:', error);
    return [];
  }
}

/**
 * Get tag statistics
 */
export async function getTagStats(
  userId?: number
): Promise<{ totalTags: number; totalTaggedDocuments: number; avgTagsPerDocument: number }> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const stats = await db.getFirstAsync<{
      totalTags: number;
      totalTaggedDocuments: number;
      avgTagsPerDocument: number;
    }>(
      `SELECT 
        COUNT(DISTINCT t.id) as totalTags,
        COUNT(DISTINCT dt.document_id) as totalTaggedDocuments,
        CAST(COUNT(dt.document_id) AS REAL) / NULLIF(COUNT(DISTINCT dt.document_id), 0) as avgTagsPerDocument
      FROM tags t
      LEFT JOIN document_tags dt ON t.id = dt.tag_id
      WHERE t.user_id = ?`,
      [currentUserId]
    );

    return (
      stats || {
        totalTags: 0,
        totalTaggedDocuments: 0,
        avgTagsPerDocument: 0,
      }
    );
  } catch (error) {
    console.error('Failed to get tag stats:', error);
    return {
      totalTags: 0,
      totalTaggedDocuments: 0,
      avgTagsPerDocument: 0,
    };
  }
}

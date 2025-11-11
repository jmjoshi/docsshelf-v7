/**
 * Document Service
 * Handles document upload, storage, retrieval, and management
 * Implements end-to-end encryption and local storage
 * Production-grade with security, validation, and audit logging
 */

import { Directory, File, Paths } from 'expo-file-system';
import type {
  Document,
  DocumentFilter,
  DocumentPickerResult,
  DocumentStats,
  DocumentUpdateInput,
  DocumentUploadOptions,
  DocumentWithCategory,
} from '../../types/document';
import { DOCUMENT_VALIDATION, SUPPORTED_MIME_TYPES } from '../../types/document';
import {
  calculateChecksum,
  decryptDocument,
  encryptDocument,
  formatFileSize,
  secureWipe,
} from '../../utils/crypto/encryption';
import { logAudit } from './auditService';
import { db } from './dbInit';
import { getCurrentUserId } from './userService';

/**
 * Get documents directory
 */
function getDocumentsDirectory(): Directory {
  return new Directory(Paths.document, 'documents');
}

/**
 * Get thumbnails directory
 */
function getThumbnailsDirectory(): Directory {
  return new Directory(Paths.document, 'thumbnails');
}

/**
 * Ensure directories exist
 */
async function ensureDirectoriesExist(): Promise<void> {
  const docsDir = getDocumentsDirectory();
  const thumbsDir = getThumbnailsDirectory();
  
  if (!docsDir.exists) {
    await docsDir.create();
  }
  
  if (!thumbsDir.exists) {
    await thumbsDir.create();
  }
}

/**
 * Generate unique filename for stored document
 */
function generateStoredFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop() || 'bin';
  return `doc_${timestamp}_${random}.${extension}.encrypted`;
}

/**
 * Validate file before upload
 */
function validateFile(file: DocumentPickerResult): {
  valid: boolean;
  error?: string;
} {
  // Check file size
  if (file.size > DOCUMENT_VALIDATION.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${formatFileSize(DOCUMENT_VALIDATION.MAX_FILE_SIZE)}`,
    };
  }
  
  // Check filename length
  if (file.name.length > DOCUMENT_VALIDATION.MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      error: `Filename too long (max ${DOCUMENT_VALIDATION.MAX_FILENAME_LENGTH} characters)`,
    };
  }
  
  // Check MIME type
  if (file.mimeType && !(file.mimeType in SUPPORTED_MIME_TYPES)) {
    return {
      valid: false,
      error: 'Unsupported file type',
    };
  }
  
  return { valid: true };
}

/**
 * Upload a document
 */
export async function uploadDocument(
  file: DocumentPickerResult,
  options: DocumentUploadOptions = {}
): Promise<Document> {
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const startTime = Date.now();
  
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Report progress: pending
    options.onProgress?.({
      uploadId,
      filename: file.name,
      totalBytes: file.size,
      uploadedBytes: 0,
      percentage: 0,
      status: 'pending',
      startTime,
    });
    
    // Ensure directories exist
    await ensureDirectoriesExist();
    
    // Read file content
    const fileContent = await FileSystem.readAsStringAsync(file.uri, {
      encoding: 'base64',
    });
    const fileBytes = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
    
    // Report progress: encrypting
    options.onProgress?.({
      uploadId,
      filename: file.name,
      totalBytes: file.size,
      uploadedBytes: Math.floor(file.size * 0.2),
      percentage: 20,
      status: 'encrypting',
      startTime,
    });
    
    // Encrypt document
    const encrypted = await encryptDocument(fileBytes);
    
    // Calculate checksum of original file
    const checksum = await calculateChecksum(fileBytes);
    
    // Securely wipe original data from memory
    secureWipe(fileBytes);
    
    // Generate stored filename
    const storedFilename = generateStoredFilename(file.name);
    const filePath = `${getDocumentsDirectory()}${storedFilename}`;
    
    // Report progress: uploading (saving to disk)
    options.onProgress?.({
      uploadId,
      filename: file.name,
      totalBytes: file.size,
      uploadedBytes: Math.floor(file.size * 0.5),
      percentage: 50,
      status: 'uploading',
      startTime,
    });
    
    // Save encrypted file to disk
    const encryptedBase64 = btoa(String.fromCharCode(...encrypted.encryptedData));
    await FileSystem.writeAsStringAsync(filePath, encryptedBase64, {
      encoding: 'base64',
    });
    
    // Securely wipe encrypted data from memory
    secureWipe(encrypted.encryptedData);
    
    // Report progress: processing
    options.onProgress?.({
      uploadId,
      filename: file.name,
      totalBytes: file.size,
      uploadedBytes: Math.floor(file.size * 0.8),
      percentage: 80,
      status: 'processing',
      startTime,
    });
    
    // Insert document record into database
    const result = await db.runAsync(
      `INSERT INTO documents (
        user_id, category_id, filename, original_filename, file_path, file_size, mime_type,
        encryption_key, encryption_iv, checksum, page_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        currentUserId,
        options.categoryId || null,
        file.name,
        file.name,
        filePath,
        file.size,
        file.mimeType || 'application/octet-stream',
        encrypted.key,
        encrypted.iv,
        checksum,
        1, // Default page count
      ]
    );
    
    const documentId = result.lastInsertRowId;
    
    // Log audit
    await logAudit(currentUserId, 'CREATE', 'document', documentId, {
      filename: file.name,
      size: file.size,
      mime_type: file.mimeType,
      category_id: options.categoryId,
    });
    
    // Report progress: complete
    options.onProgress?.({
      uploadId,
      filename: file.name,
      totalBytes: file.size,
      uploadedBytes: file.size,
      percentage: 100,
      status: 'complete',
      startTime,
    });
    
    // Retrieve and return the created document
    const document = await getDocumentById(documentId, currentUserId);
    if (!document) {
      throw new Error('Failed to retrieve uploaded document');
    }
    
    return document;
  } catch (error) {
    // Report progress: error
    options.onProgress?.({
      uploadId,
      filename: file.name,
      totalBytes: file.size,
      uploadedBytes: 0,
      percentage: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Upload failed',
      startTime,
    });
    
    console.error('Document upload failed:', error);
    throw error instanceof Error ? error : new Error('Failed to upload document');
  }
}

/**
 * Get document by ID
 */
export async function getDocumentById(
  documentId: number,
  userId?: number
): Promise<Document | null> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    const document = await db.getFirstAsync<Document>(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [documentId, currentUserId]
    );
    
    return document || null;
  } catch (error) {
    console.error('Failed to get document:', error);
    throw new Error('Failed to retrieve document');
  }
}

/**
 * Get documents with optional filters
 */
export async function getDocuments(
  filter: DocumentFilter = {},
  userId?: number
): Promise<DocumentWithCategory[]> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    // Build query dynamically based on filters
    let query = `
      SELECT d.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM documents d
      LEFT JOIN categories c ON d.category_id = c.id
      WHERE d.user_id = ?
    `;
    const params: any[] = [currentUserId];
    
    if (filter.category_id !== undefined) {
      query += ' AND d.category_id = ?';
      params.push(filter.category_id);
    }
    
    if (filter.is_favorite !== undefined) {
      query += ' AND d.is_favorite = ?';
      params.push(filter.is_favorite ? 1 : 0);
    }
    
    if (filter.mime_type) {
      query += ' AND d.mime_type = ?';
      params.push(filter.mime_type);
    }
    
    if (filter.date_from) {
      query += ' AND d.created_at >= ?';
      params.push(filter.date_from);
    }
    
    if (filter.date_to) {
      query += ' AND d.created_at <= ?';
      params.push(filter.date_to);
    }
    
    if (filter.search_query) {
      query += ' AND (d.filename LIKE ? OR d.ocr_text LIKE ?)';
      params.push(`%${filter.search_query}%`, `%${filter.search_query}%`);
    }
    
    // Add sorting
    const sortBy = filter.sort_by || 'created_at';
    const sortOrder = filter.sort_order || 'DESC';
    query += ` ORDER BY d.${sortBy} ${sortOrder}`;
    
    // Add pagination
    if (filter.limit) {
      query += ' LIMIT ?';
      params.push(filter.limit);
      
      if (filter.offset) {
        query += ' OFFSET ?';
        params.push(filter.offset);
      }
    }
    
    const documents = await db.getAllAsync<DocumentWithCategory>(query, params);
    return documents;
  } catch (error) {
    console.error('Failed to get documents:', error);
    throw new Error('Failed to retrieve documents');
  }
}

/**
 * Read document content (decrypt and return)
 */
export async function readDocument(documentId: number, userId?: number): Promise<Uint8Array> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    // Get document metadata
    const document = await getDocumentById(documentId, currentUserId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Read encrypted file
    const encryptedBase64 = await FileSystem.readAsStringAsync(document.file_path, {
      encoding: 'base64',
    });
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    // Decrypt
    const decrypted = await decryptDocument({
      encryptedData: encryptedBytes,
      key: document.encryption_key,
      iv: document.encryption_iv,
    });
    
    // Update last accessed timestamp
    await db.runAsync(
      'UPDATE documents SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [documentId, currentUserId]
    );
    
    return decrypted;
  } catch (error) {
    console.error('Failed to read document:', error);
    throw new Error('Failed to read document');
  }
}

/**
 * Update document metadata
 */
export async function updateDocument(
  documentId: number,
  updates: DocumentUpdateInput,
  userId?: number
): Promise<Document> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    // Verify document exists
    const existing = await getDocumentById(documentId, currentUserId);
    if (!existing) {
      throw new Error('Document not found');
    }
    
    // Build update query dynamically
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.category_id !== undefined) {
      updateFields.push('category_id = ?');
      values.push(updates.category_id);
    }
    
    if (updates.filename !== undefined) {
      updateFields.push('filename = ?');
      values.push(updates.filename);
    }
    
    if (updates.is_favorite !== undefined) {
      updateFields.push('is_favorite = ?');
      values.push(updates.is_favorite ? 1 : 0);
    }
    
    if (updates.ocr_text !== undefined) {
      updateFields.push('ocr_text = ?');
      values.push(updates.ocr_text);
    }
    
    if (updates.ocr_confidence !== undefined) {
      updateFields.push('ocr_confidence = ?');
      values.push(updates.ocr_confidence);
    }
    
    if (updateFields.length === 0) {
      return existing;
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(documentId, currentUserId);
    
    await db.runAsync(
      `UPDATE documents SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    // Log audit
    await logAudit(currentUserId, 'UPDATE', 'document', documentId, updates);
    
    // Retrieve and return updated document
    const updated = await getDocumentById(documentId, currentUserId);
    if (!updated) {
      throw new Error('Failed to retrieve updated document');
    }
    
    return updated;
  } catch (error) {
    console.error('Failed to update document:', error);
    throw error instanceof Error ? error : new Error('Failed to update document');
  }
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: number, userId?: number): Promise<void> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    // Get document metadata
    const document = await getDocumentById(documentId, currentUserId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Delete physical file
    const fileInfo = await FileSystem.getInfoAsync(document.file_path);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(document.file_path);
    }
    
    // Delete thumbnail if exists
    if (document.thumbnail_path) {
      const thumbInfo = await FileSystem.getInfoAsync(document.thumbnail_path);
      if (thumbInfo.exists) {
        await FileSystem.deleteAsync(document.thumbnail_path);
      }
    }
    
    // Delete database record
    await db.runAsync('DELETE FROM documents WHERE id = ? AND user_id = ?', [
      documentId,
      currentUserId,
    ]);
    
    // Delete document-tag associations
    await db.runAsync('DELETE FROM document_tags WHERE document_id = ?', [documentId]);
    
    // Log audit
    await logAudit(currentUserId, 'DELETE', 'document', documentId, {
      filename: document.filename,
      size: document.file_size,
    });
  } catch (error) {
    console.error('Failed to delete document:', error);
    throw new Error('Failed to delete document');
  }
}

/**
 * Get document statistics
 */
export async function getDocumentStats(userId?: number): Promise<DocumentStats> {
  try {
    const currentUserId = userId || (await getCurrentUserId());
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }
    
    // Total documents and size
    const totals = await db.getFirstAsync<{ total: number; size: number }>(
      'SELECT COUNT(*) as total, COALESCE(SUM(file_size), 0) as size FROM documents WHERE user_id = ?',
      [currentUserId]
    );
    
    // Documents by type
    const byType = await db.getAllAsync<{ mime_type: string; count: number }>(
      'SELECT mime_type, COUNT(*) as count FROM documents WHERE user_id = ? GROUP BY mime_type',
      [currentUserId]
    );
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysStr = sevenDaysAgo.toISOString();
    
    const recentAdded = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM documents WHERE user_id = ? AND created_at >= ?',
      [currentUserId, sevenDaysStr]
    );
    
    const recentAccessed = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM documents WHERE user_id = ? AND last_accessed_at >= ?',
      [currentUserId, sevenDaysStr]
    );
    
    return {
      totalDocuments: totals?.total || 0,
      totalSize: totals?.size || 0,
      totalSizeFormatted: formatFileSize(totals?.size || 0),
      documentsByType: Object.fromEntries(byType.map(bt => [bt.mime_type, bt.count])),
      recentlyAdded: recentAdded?.count || 0,
      recentlyAccessed: recentAccessed?.count || 0,
    };
  } catch (error) {
    console.error('Failed to get document stats:', error);
    throw new Error('Failed to retrieve document statistics');
  }
}

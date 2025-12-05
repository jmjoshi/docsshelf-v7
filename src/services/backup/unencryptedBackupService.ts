/**
 * Unencrypted Backup Service (FR-MAIN-013A)
 * Creates plain file backups WITHOUT encryption
 * 
 * ⚠️ SECURITY WARNING ⚠️
 * This service creates UNENCRYPTED backups that can be accessed by anyone
 * with physical access to the backup files. Use ONLY for personal, secure storage.
 * 
 * User must explicitly consent to security risks before backup creation.
 */

import { Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import {
    UnencryptedBackupManifest,
    UnencryptedBackupOptions,
    UnencryptedBackupProgress,
    UnencryptedBackupResult,
    UnencryptedDocumentMetadata,
} from '../../types/backup';
import { Category } from '../../types/category';
import { Document } from '../../types/document';

import { decryptDocument, type DecryptionInput } from '../../utils/crypto/encryption';
import { logAudit } from '../database/auditService';
import { getCategoryById } from '../database/categoryService';
import { getDatabase } from '../database/dbInit';
import { getDocumentById } from '../database/documentService';

// Constants
const APP_VERSION = '1.0.0'; // TODO: Get from app.json
const BACKUP_VERSION = '1.0';
const SECURITY_WARNING = '⚠️ WARNING: This backup is NOT ENCRYPTED. Anyone with access to these files can view your documents. Only use this backup for personal, secure storage that you control.';

/**
 * Create unencrypted backup (FR-MAIN-013A)
 * 
 * Process:
 * 1. Verify user consent
 * 2. Fetch selected documents
 * 3. Decrypt each document to plain format
 * 4. Create backup folder with timestamp
 * 5. Save documents as plain files (no .enc extension)
 * 6. Create manifest.json with metadata
 * 7. Optionally export categories.json
 * 8. Share folder via Files app
 * 9. Log to backup history
 */
export async function createUnencryptedBackup(
  options: UnencryptedBackupOptions,
  progressCallback?: (progress: UnencryptedBackupProgress) => void
): Promise<UnencryptedBackupResult> {
  try {
    // Validate user consent
    if (!options.userConsent) {
      throw new Error('User consent required for unencrypted backup');
    }

    if (options.documentIds.length === 0) {
      throw new Error('No documents selected for backup');
    }

    console.log(`[UnencryptedBackup] Starting backup for ${options.documentIds.length} documents`);

    // Step 1: Fetch documents
    const documents = await fetchDocumentsForBackup(options.documentIds, options.userId);
    
    if (documents.length === 0) {
      throw new Error('No documents found matching selection');
    }

    // Step 2: Calculate total size
    const totalBytes = documents.reduce((sum, doc) => sum + doc.file_size, 0);

    // Step 3: Create backup folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFolderName = `DocsShelf_Backup_${timestamp}`;
    const backupFolderPath = `${Paths.document.uri}${backupFolderName}/`;
    const documentsFolderPath = `${backupFolderPath}documents/`;

    await FileSystem.makeDirectoryAsync(backupFolderPath, { intermediates: true });
    await FileSystem.makeDirectoryAsync(documentsFolderPath, { intermediates: true });

    console.log(`[UnencryptedBackup] Created backup folder: ${backupFolderPath}`);

    // Step 4: Export documents (decrypt and save as plain files)
    let bytesCompleted = 0;
    const documentMetadata: UnencryptedDocumentMetadata[] = [];

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      
      // Report progress
      if (progressCallback) {
        progressCallback({
          currentFile: doc.original_filename,
          filesCompleted: i,
          totalFiles: documents.length,
          bytesCompleted,
          totalBytes,
          percentComplete: Math.round((i / documents.length) * 100),
        });
      }

      try {
        // Decrypt and save document as plain file
        await decryptAndSaveDocument(doc, documentsFolderPath);

        // Add to metadata
        const categoryName = doc.category_id 
          ? (await getCategoryById(doc.category_id, options.userId))?.name 
          : undefined;

        documentMetadata.push({
          id: doc.id!,
          filename: doc.original_filename,
          original_filename: doc.original_filename,
          size: doc.file_size,
          mime_type: doc.mime_type,
          category_name: categoryName,
          is_favorite: doc.is_favorite,
          created_at: new Date(doc.created_at).toISOString(),
          updated_at: new Date(doc.updated_at).toISOString(),
        });

        bytesCompleted += doc.file_size;

      } catch (error) {
        console.error(`[UnencryptedBackup] Failed to export document ${doc.id}:`, error);
        throw new Error(`Failed to export document: ${doc.original_filename}`);
      }
    }

    // Step 5: Create manifest.json
    const manifest: UnencryptedBackupManifest = {
      backup_version: BACKUP_VERSION,
      app_version: APP_VERSION,
      created_at: new Date().toISOString(),
      device_platform: Platform.OS as 'ios' | 'android',
      encryption_type: 'unencrypted',
      warning: SECURITY_WARNING,
      document_count: documents.length,
      total_size_bytes: totalBytes,
      documents: documentMetadata,
    };

    // Step 6: Optionally export categories
    if (options.includeCategories) {
      const categories = await fetchCategoriesForDocuments(documents, options.userId);
      manifest.categories = categories.map(cat => ({
        id: cat.id!,
        name: cat.name,
        parent_name: cat.parent_id 
          ? categories.find(c => c.id === cat.parent_id)?.name 
          : undefined,
        icon: cat.icon,
        color: cat.color,
        created_at: new Date(cat.created_at!).toISOString(),
      }));

      // Save categories.json
      await FileSystem.writeAsStringAsync(
        `${backupFolderPath}categories.json`,
        JSON.stringify(manifest.categories, null, 2)
      );
    }

    // Save manifest.json
    await FileSystem.writeAsStringAsync(
      `${backupFolderPath}manifest.json`,
      JSON.stringify(manifest, null, 2)
    );

    // Final progress update
    if (progressCallback) {
      progressCallback({
        currentFile: 'Complete',
        filesCompleted: documents.length,
        totalFiles: documents.length,
        bytesCompleted: totalBytes,
        totalBytes,
        percentComplete: 100,
      });
    }

    // Step 7: Save backup history
    await saveBackupHistory({
      backup_type: 'export',
      encryption_type: 'unencrypted',
      backup_location: 'files_app',
      backup_filename: backupFolderName,
      backup_size: totalBytes,
      document_count: documents.length,
      category_count: manifest.categories?.length || 0,
      backup_hash: '', // No hash for unencrypted backups
      status: 'completed',
      created_at: Date.now(),
      user_id: options.userId,
      user_consent: true,
      document_ids: JSON.stringify(options.documentIds),
    });

    // Step 8: Log audit event
    await logAudit(
      options.userId,
      'BACKUP_UNENCRYPTED_EXPORT',
      'backup',
      null,
      {
        document_count: documents.length,
        backup_size: totalBytes,
        user_consent: true,
      }
    );

    console.log(`[UnencryptedBackup] Backup created successfully: ${backupFolderPath}`);

    return {
      success: true,
      backupFolderUri: backupFolderPath,
      fileCount: documents.length,
      totalSizeBytes: totalBytes,
      timestamp: new Date().toISOString(),
      documentIds: options.documentIds,
    };

  } catch (error: any) {
    console.error('[UnencryptedBackup] Backup creation failed:', error);
    
    // Log failed backup
    await logAudit(
      options.userId,
      'BACKUP_UNENCRYPTED_EXPORT_FAILED',
      'backup',
      null,
      { error: error.message }
    );

    return {
      success: false,
      backupFolderUri: '',
      fileCount: 0,
      totalSizeBytes: 0,
      timestamp: new Date().toISOString(),
      documentIds: options.documentIds,
      error: error.message || 'Unknown error during backup creation',
    };
  }
}

/**
 * Share unencrypted backup folder
 * Opens native share sheet to save to Files app or USB storage
 */
export async function shareUnencryptedBackup(
  backupFolderUri: string
): Promise<void> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    // On iOS: Opens share sheet, user can save to Files app then transfer to USB
    // On Android: Opens share sheet, user can save directly to USB storage if mounted
    await Sharing.shareAsync(backupFolderUri, {
      mimeType: 'application/zip', // Will be treated as folder on modern OS
      dialogTitle: 'Save Unencrypted Backup',
      UTI: 'public.folder', // iOS Uniform Type Identifier for folders
    });

    console.log('[UnencryptedBackup] Backup shared successfully');
  } catch (error: any) {
    console.error('[UnencryptedBackup] Failed to share backup:', error);
    throw new Error(`Failed to share backup: ${error.message}`);
  }
}

/**
 * Fetch documents for backup
 */
async function fetchDocumentsForBackup(
  documentIds: number[],
  userId: number
): Promise<Document[]> {
  const documents: Document[] = [];

  for (const docId of documentIds) {
    const doc = await getDocumentById(docId, userId);
    if (doc) {
      documents.push(doc);
    }
  }

  return documents;
}

/**
 * Decrypt document and save as plain file (NO ENCRYPTION)
 * 
 * Process:
 * 1. Read encrypted file from storage
 * 2. Decrypt using document's encryption key
 * 3. Save as plain file with original filename (no .enc extension)
 */
async function decryptAndSaveDocument(
  doc: Document,
  outputFolderPath: string
): Promise<void> {
  try {
    // Read encrypted file as base64 (works for both text and binary files)
    const encryptedFilePath = doc.file_path;
    const encryptedDataBase64 = await FileSystem.readAsStringAsync(encryptedFilePath, {
      encoding: 'base64' as any
    });

    // Convert base64 encrypted data to Uint8Array
    const encryptedBytes = new Uint8Array(
      atob(encryptedDataBase64).split('').map(c => c.charCodeAt(0))
    );

    // Decrypt using document's stored encryption keys
    const decryptionInput: DecryptionInput = {
      encryptedData: encryptedBytes,
      key: doc.encryption_key,
      iv: doc.encryption_iv,
      hmac: doc.encryption_hmac || '',
      hmacKey: doc.encryption_hmac_key || ''
    };
    
    const decryptedBytes = await decryptDocument(decryptionInput);

    // Convert Uint8Array to binary string (in chunks to avoid stack overflow)
    // Process in 8KB chunks to prevent "Maximum call stack size exceeded"
    const chunkSize = 8192;
    let binaryString = '';
    
    for (let i = 0; i < decryptedBytes.length; i += chunkSize) {
      const chunk = decryptedBytes.slice(i, i + chunkSize);
      const chunkArray = Array.from(chunk);
      binaryString += String.fromCharCode(...chunkArray);
    }
    
    // Now convert the complete binary string to base64
    const base64Content = btoa(binaryString);

    // Save as plain file with original filename
    const plainFilePath = `${outputFolderPath}${doc.original_filename}`;
    // Write as base64 - expo-file-system will decode it properly
    await FileSystem.writeAsStringAsync(plainFilePath, base64Content, {
      encoding: 'base64' as any
    });

    // Verify file was written
    const fileInfo = await FileSystem.getInfoAsync(plainFilePath);
    if (!fileInfo.exists) {
      throw new Error(`Failed to write plain file: ${doc.original_filename}`);
    }

    console.log(`[UnencryptedBackup] Exported plain file: ${doc.original_filename} (${fileInfo.size} bytes)`);

  } catch (error: any) {
    console.error(`[UnencryptedBackup] Failed to decrypt/save document ${doc.id}:`, error);
    throw error;
  }
}

/**
 * Fetch categories for documents
 */
async function fetchCategoriesForDocuments(
  documents: Document[],
  userId: number
): Promise<Category[]> {
  const categoryIds = new Set<number>();
  
  for (const doc of documents) {
    if (doc.category_id) {
      categoryIds.add(doc.category_id);
    }
  }

  const categories: Category[] = [];
  
  for (const categoryId of categoryIds) {
    const category = await getCategoryById(categoryId, userId);
    if (category) {
      categories.push(category);
    }
  }

  return categories;
}

/**
 * Save backup history to database
 */
async function saveBackupHistory(record: any): Promise<void> {
  const db = getDatabase();
  
  await db.runAsync(
    `INSERT INTO backup_history (
      backup_type, encryption_type, backup_location, backup_filename,
      backup_size, document_count, category_count, backup_hash,
      status, error_message, created_at, user_id, user_consent, document_ids
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.backup_type,
      record.encryption_type,
      record.backup_location,
      record.backup_filename,
      record.backup_size,
      record.document_count,
      record.category_count,
      record.backup_hash,
      record.status,
      record.error_message || null,
      record.created_at,
      record.user_id || null,
      record.user_consent ? 1 : 0,
      record.document_ids || null,
    ]
  );
}

/**
 * Get backup statistics for user
 */
export async function getUnencryptedBackupStats(userId: number): Promise<{
  total_backups: number;
  total_size: number;
  last_backup: string | null;
}> {
  const db = getDatabase();
  
  const result = await db.getFirstAsync<any>(
    `SELECT 
      COUNT(*) as total_backups,
      SUM(backup_size) as total_size,
      MAX(created_at) as last_backup
    FROM backup_history
    WHERE user_id = ? AND backup_type = 'export' AND encryption_type = 'unencrypted'`,
    [userId]
  );

  return {
    total_backups: result?.total_backups || 0,
    total_size: result?.total_size || 0,
    last_backup: result?.last_backup ? new Date(result.last_backup).toISOString() : null,
  };
}

/**
 * Backup Export Service
 * Handles creating backup packages for export to external storage
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import { getDatabase } from '../database/dbInit';
import { getDocuments, readDocument } from '../database/documentService';
import { getCategories } from '../database/categoryService';
import { calculateChecksum } from '../../utils/crypto/encryption';
import {
  BackupManifest,
  BackupExportOptions,
  BackupExportResult,
  BackupProgress,
  BackupDocumentMetadata,
  BackupCategoryMetadata,
  BackupChecksums,
  BACKUP_FILE_EXTENSION,
  BACKUP_VERSION,
  MAX_BACKUP_SIZE_WARNING,
} from '../../types/backup';
import { Platform } from 'react-native';

/**
 * Create a backup package of all documents and categories
 */
export async function createBackup(
  options: BackupExportOptions = {},
  onProgress?: (progress: BackupProgress) => void
): Promise<BackupExportResult> {
  const startTime = Date.now();
  
  try {
    // Default options
    const {
      includeCategories = true,
      includeDocuments = true,
      categoryIds,
      compression = true,
      notes,
    } = options;

    // Create temporary backup directory
    const backupDir = `${FileSystem.cacheDirectory}backup_${Date.now()}/`;
    await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });

    onProgress?.({
      stage: 'collecting',
      current: 0,
      total: 100,
      message: 'Collecting documents...',
      percentage: 0,
    });

    // Collect categories
    let categories: BackupCategoryMetadata[] = [];
    if (includeCategories) {
      const allCategories = await getCategories();
      categories = allCategories
        .filter((cat: any) => !categoryIds || categoryIds.includes(cat.id))
        .map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          parent_id: cat.parent_id,
          icon: cat.icon || 'folder',
          color: cat.color || '#6366f1',
          sort_order: cat.sort_order || 0,
          created_at: cat.created_at,
        }));
    }

    // Collect documents (store in memory, not filesystem)
    let documents: BackupDocumentMetadata[] = [];
    
    if (includeDocuments) {
      
      const allDocuments = await getDocuments();
      const filteredDocs = allDocuments.filter(
        (doc: any) => !categoryIds || (doc.category_id && categoryIds.includes(doc.category_id))
      );

      for (let i = 0; i < filteredDocs.length; i++) {
        const doc = filteredDocs[i];
        
        onProgress?.({
          stage: 'collecting',
          current: i + 1,
          total: filteredDocs.length,
          message: `Collecting documents... (${i + 1}/${filteredDocs.length})`,
          percentage: Math.round((i + 1) / filteredDocs.length * 30),
        });

        // Read document content (already encrypted - Uint8Array)
        const content = await readDocument(doc.id);
        
        // Don't save to temp directory - we'll add directly to ZIP from memory
        const backupFilename = `doc_${doc.id}.enc`;
        
        // Convert Uint8Array to base64 for storage in memory
        const base64Content = Buffer.from(content).toString('base64');

        documents.push({
          id: doc.id,
          filename: backupFilename,
          original_filename: doc.filename,
          size: doc.file_size,
          mime_type: doc.mime_type,
          category_id: doc.category_id,
          is_favorite: doc.is_favorite,
          created_at: parseInt(doc.created_at),
          updated_at: parseInt(doc.updated_at),
          _base64Content: base64Content, // Store content in memory for ZIP creation
        } as any);
      }
    }

    onProgress?.({
      stage: 'packaging',
      current: 0,
      total: 100,
      message: 'Creating backup manifest...',
      percentage: 35,
    });

    // Create manifest
    const manifest: BackupManifest = {
      backup_version: BACKUP_VERSION,
      app_version: '1.0.0', // TODO: Get from app.json
      created_at: new Date().toISOString(),
      device_platform: Platform.OS as 'ios' | 'android',
      document_count: documents.length,
      category_count: categories.length,
      total_size_bytes: documents.reduce((sum, doc) => sum + doc.size, 0),
      encryption: {
        algorithm: 'AES-256-CTR',
        hmac: 'HMAC-SHA256',
      },
      documents,
      categories,
      notes,
    };

    // Write manifest
    const manifestPath = `${backupDir}manifest.json`;
    await FileSystem.writeAsStringAsync(
      manifestPath,
      JSON.stringify(manifest, null, 2)
    );

    // Write database (categories)
    const databasePath = `${backupDir}database.json`;
    await FileSystem.writeAsStringAsync(
      databasePath,
      JSON.stringify({ categories }, null, 2)
    );

    onProgress?.({
      stage: 'encrypting',
      current: 0,
      total: 100,
      message: 'Generating checksums...',
      percentage: 50,
    });

    // Generate checksums
    const checksums = await generateChecksums(backupDir, documents);
    const checksumPath = `${backupDir}checksum.sha256`;
    await FileSystem.writeAsStringAsync(checksumPath, formatChecksums(checksums));

    onProgress?.({
      stage: 'compressing',
      current: 0,
      total: 100,
      message: 'Compressing backup...',
      percentage: 70,
    });

    // Compress backup if requested
    let finalBackupPath: string;
    if (compression) {
      const zipFilename = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}${BACKUP_FILE_EXTENSION}`;
      const zipPath = `${FileSystem.cacheDirectory}${zipFilename}`;
      
      // Create ZIP using JSZip
      const zip = new JSZip();
      
      // Add manifest
      const manifestContent = await FileSystem.readAsStringAsync(manifestPath);
      zip.file('manifest.json', manifestContent);
      
      // Add database
      const databaseContent = await FileSystem.readAsStringAsync(databasePath);
      zip.file('database.json', databaseContent);
      
      // Add checksums
      const checksumContent = await FileSystem.readAsStringAsync(checksumPath);
      zip.file('checksum.sha256', checksumContent);
      
      // Add all documents from memory (no file I/O needed)
      for (const doc of documents as any[]) {
        if (doc._base64Content) {
          zip.file(`documents/${doc.filename}`, doc._base64Content, { base64: true });
          // Clean up memory
          delete doc._base64Content;
        }
      }
      
      // Generate ZIP file
      const zipBase64 = await zip.generateAsync({ 
        type: 'base64',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      // Write ZIP to file system
      await FileSystem.writeAsStringAsync(zipPath, zipBase64, { encoding: 'base64' });
      
      finalBackupPath = zipPath;
    } else {
      // Just rename directory (no compression)
      const backupFilename = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`;
      finalBackupPath = `${FileSystem.cacheDirectory}${backupFilename}${BACKUP_FILE_EXTENSION}`;
      // Note: Without compression, we'd need to bundle files differently
      // For now, always use compression
      throw new Error('Uncompressed backups not yet supported');
    }

    // Get final backup size
    const fileInfo = await FileSystem.getInfoAsync(finalBackupPath);
    const backupSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

    // Warn if backup is very large
    if (backupSize > MAX_BACKUP_SIZE_WARNING) {
      console.warn(`Backup size (${(backupSize / 1024 / 1024).toFixed(2)} MB) exceeds recommended maximum`);
    }

    onProgress?.({
      stage: 'complete',
      current: 100,
      total: 100,
      message: 'Backup complete!',
      percentage: 100,
    });

    // Clean up temporary directory
    await FileSystem.deleteAsync(backupDir, { idempotent: true });

    const duration = Date.now() - startTime;

    // Save backup history to database
    await saveBackupHistory({
      backup_type: 'export',
      backup_location: 'other', // Will be updated when user chooses location
      backup_filename: finalBackupPath.split('/').pop() || 'backup',
      backup_size: backupSize,
      document_count: documents.length,
      category_count: categories.length,
      backup_hash: checksums['manifest.json'],
      status: 'completed',
      created_at: Math.floor(Date.now() / 1000),
      notes,
    });

    return {
      success: true,
      backupPath: finalBackupPath,
      backupSize,
      documentsIncluded: documents.length,
      categoriesIncluded: categories.length,
      checksum: checksums['manifest.json'],
      duration,
    };

  } catch (error) {
    console.error('Backup creation failed:', error);
    return {
      success: false,
      backupPath: '',
      backupSize: 0,
      documentsIncluded: 0,
      categoriesIncluded: 0,
      checksum: '',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Share backup file (exports to Files app or other apps)
 */
export async function shareBackup(backupPath: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(backupPath, {
      mimeType: 'application/zip',
      dialogTitle: 'Save Backup',
      UTI: 'public.zip-archive',
    });

    return true;
  } catch (error) {
    console.error('Failed to share backup:', error);
    return false;
  }
}

/**
 * Generate SHA256 checksums for all files in backup
 */
async function generateChecksums(
  backupDir: string,
  documents: BackupDocumentMetadata[]
): Promise<BackupChecksums> {
  const checksums: BackupChecksums = {
    'manifest.json': '',
    'database.json': '',
    documents: {},
  };

  // Checksum manifest
  const manifestContent = await FileSystem.readAsStringAsync(
    `${backupDir}manifest.json`
  );
  const manifestBytes = new TextEncoder().encode(manifestContent);
  checksums['manifest.json'] = await calculateChecksum(manifestBytes);

  // Checksum database
  const databaseContent = await FileSystem.readAsStringAsync(
    `${backupDir}database.json`
  );
  const databaseBytes = new TextEncoder().encode(databaseContent);
  checksums['database.json'] = await calculateChecksum(databaseBytes);

  // Checksum each document from memory
  for (const doc of documents as any[]) {
    if (doc._base64Content) {
      // Decode base64 to get original bytes for checksum
      const docBytes = Buffer.from(doc._base64Content, 'base64');
      checksums.documents[doc.filename] = await calculateChecksum(docBytes);
    }
  }

  return checksums;
}

/**
 * Format checksums as text file content
 */
function formatChecksums(checksums: BackupChecksums): string {
  const lines: string[] = [
    'SHA256 checksums for backup verification:',
    '',
    `manifest.json: ${checksums['manifest.json']}`,
    `database.json: ${checksums['database.json']}`,
    '',
    'Documents:',
  ];

  Object.entries(checksums.documents).forEach(([filename, hash]) => {
    lines.push(`${filename}: ${hash}`);
  });

  return lines.join('\n');
}

/**
 * Save backup history to database
 */
async function saveBackupHistory(history: Omit<any, 'id'>): Promise<void> {
  const db = await getDatabase();
  
  await db.runAsync(
    `INSERT INTO backup_history 
     (backup_type, backup_location, backup_filename, backup_size, 
      document_count, category_count, backup_hash, status, 
      created_at, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      history.backup_type,
      history.backup_location,
      history.backup_filename,
      history.backup_size,
      history.document_count,
      history.category_count,
      history.backup_hash,
      history.status,
      history.created_at,
      history.notes || null,
    ]
  );
}

/**
 * Get all backup history records
 */
export async function getBackupHistory(): Promise<any[]> {
  const db = await getDatabase();
  
  const result = await db.getAllAsync<any>(
    'SELECT * FROM backup_history ORDER BY created_at DESC'
  );
  
  return result;
}

/**
 * Delete backup history record
 */
export async function deleteBackupHistory(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM backup_history WHERE id = ?', [id]);
}

/**
 * Clear all backup history
 */
export async function clearBackupHistory(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM backup_history');
}

/**
 * Get backup statistics
 */
export async function getBackupStats(): Promise<any> {
  const db = await getDatabase();
  
  const stats = await db.getFirstAsync<any>(`
    SELECT 
      COUNT(*) as total_backups,
      SUM(CASE WHEN backup_type = 'export' THEN 1 ELSE 0 END) as total_exports,
      SUM(CASE WHEN backup_type = 'import' THEN 1 ELSE 0 END) as total_imports,
      MAX(created_at) as last_backup_date,
      SUM(backup_size) as total_backup_size
    FROM backup_history
  `);
  
  return stats || {
    total_backups: 0,
    total_exports: 0,
    total_imports: 0,
    last_backup_date: null,
    total_backup_size: 0,
  };
}

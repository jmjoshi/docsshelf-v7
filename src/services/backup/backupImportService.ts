/**
 * Backup Import Service
 * Handles importing and restoring backups from .docsshelf files
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import {
    BACKUP_FILE_EXTENSION,
    BackupImportOptions,
    BackupImportResult,
    BackupManifest,
    BackupProgress,
    BackupValidationResult,
    DuplicateCheckResult,
} from '../../types/backup';
import { calculateChecksum } from '../../utils/crypto/encryption';
import { createCategory, getCategories } from '../database/categoryService';
import { getDatabase } from '../database/dbInit';
import { uploadDocument } from '../database/documentService';

/**
 * Pick a backup file from device storage
 */
export async function pickBackupFile(): Promise<string | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/zip',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const file = result.assets[0];
    
    // Check if it's a .docsshelf file
    if (!file.name.endsWith(BACKUP_FILE_EXTENSION)) {
      throw new Error(`Invalid backup file. Expected ${BACKUP_FILE_EXTENSION} file.`);
    }

    return file.uri;
  } catch (error) {
    console.error('Failed to pick backup file:', error);
    throw error;
  }
}

/**
 * Validate a backup file before importing
 */
export async function validateBackup(backupPath: string): Promise<BackupValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Extract backup to temp directory
    const extractDir = `${FileSystem.cacheDirectory}backup_extract_${Date.now()}/`;
    await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });
    
    // Read and extract ZIP using JSZip
    const zipBase64 = await FileSystem.readAsStringAsync(backupPath, { encoding: 'base64' });
    const zip = await JSZip.loadAsync(zipBase64, { base64: true });

    // Read manifest
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      errors.push('Backup manifest not found');
      await FileSystem.deleteAsync(extractDir, { idempotent: true });
      return {
        valid: false,
        errors,
        canImport: false,
      };
    }

    const manifestContent = await manifestFile.async('string');
    const manifest: BackupManifest = JSON.parse(manifestContent);
    
    // Save manifest to temp dir for later checksum verification
    await FileSystem.writeAsStringAsync(`${extractDir}manifest.json`, manifestContent);

    // Validate manifest structure
    if (!manifest.backup_version || !manifest.app_version) {
      errors.push('Invalid manifest structure');
    }

    if (!manifest.documents || !Array.isArray(manifest.documents)) {
      errors.push('Manifest missing documents array');
    }

    if (!manifest.categories || !Array.isArray(manifest.categories)) {
      errors.push('Manifest missing categories array');
    }

    // Check backup version compatibility
    if (manifest.backup_version !== '1.0') {
      warnings.push(`Backup version ${manifest.backup_version} may not be fully compatible`);
    }

    // Verify checksums if present
    const checksumFile = zip.file('checksum.sha256');
    
    let checksumValid = false;
    if (checksumFile) {
      try {
        const checksumContent = await checksumFile.async('string');
        // Save checksum file for verification
        await FileSystem.writeAsStringAsync(`${extractDir}checksum.sha256`, checksumContent);
        // Also save database.json for checksum verification
        const databaseFile = zip.file('database.json');
        if (databaseFile) {
          const databaseContent = await databaseFile.async('string');
          await FileSystem.writeAsStringAsync(`${extractDir}database.json`, databaseContent);
        }
        // Extract documents to temp dir for checksum verification
        await FileSystem.makeDirectoryAsync(`${extractDir}documents/`, { intermediates: true });
        for (const doc of manifest.documents) {
          const docFile = zip.file(`documents/${doc.filename}`);
          if (docFile) {
            const docContent = await docFile.async('base64');
            await FileSystem.writeAsStringAsync(`${extractDir}documents/${doc.filename}`, docContent, { encoding: 'base64' });
          }
        }
        checksumValid = await verifyBackupChecksums(extractDir, checksumContent, manifest);
        
        if (!checksumValid) {
          errors.push('Checksum verification failed - backup may be corrupted');
        }
      } catch (err) {
        warnings.push('Could not verify checksums');
        console.warn('Checksum verification error:', err);
      }
    } else {
      warnings.push('No checksums found - cannot verify integrity');
    }

    // Verify document files exist in ZIP
    for (const doc of manifest.documents) {
      const docFile = zip.file(`documents/${doc.filename}`);
      if (!docFile) {
        errors.push(`Document file missing: ${doc.filename}`);
      }
    }

    // Clean up temp directory
    await FileSystem.deleteAsync(extractDir, { idempotent: true });

    const valid = errors.length === 0;
    
    return {
      valid,
      manifest: valid ? manifest : undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      checksumValid,
      canImport: valid && checksumValid,
    };
  } catch (error) {
    console.error('Backup validation failed:', error);
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Validation failed'],
      canImport: false,
    };
  }
}

/**
 * Import a backup file
 */
export async function importBackup(
  backupPath: string,
  options: BackupImportOptions = {},
  onProgress?: (progress: BackupProgress) => void
): Promise<BackupImportResult> {
  const startTime = Date.now();
  
  const {
    skipDuplicates = true,
    mergeCategories = true,
    replaceExisting = false,
    dryRun = false,
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];
  let documentsImported = 0;
  let documentsSkipped = 0;
  let categoriesImported = 0;
  let categoriesMerged = 0;

  let extractDir = '';

  try {
    onProgress?.({
      stage: 'collecting',
      current: 0,
      total: 100,
      message: 'Extracting backup...',
      percentage: 0,
    });

    // Extract backup using JSZip
    extractDir = `${FileSystem.cacheDirectory}backup_import_${Date.now()}/`;
    await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });
    
    const zipBase64 = await FileSystem.readAsStringAsync(backupPath, { encoding: 'base64' });
    const zip = await JSZip.loadAsync(zipBase64, { base64: true });

    // Read manifest from ZIP
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('Backup manifest not found');
    }
    const manifestContent = await manifestFile.async('string');
    const manifest: BackupManifest = JSON.parse(manifestContent);

    onProgress?.({
      stage: 'collecting',
      current: 10,
      total: 100,
      message: 'Validating backup...',
      percentage: 10,
    });

    // Validate before import
    const validation = await validateBackup(backupPath);
    if (!validation.valid || !validation.canImport) {
      throw new Error(`Invalid backup: ${validation.errors?.join(', ')}`);
    }

    if (dryRun) {
      // Just return what would be imported
      return {
        success: true,
        documentsImported: manifest.document_count,
        documentsSkipped: 0,
        categoriesImported: manifest.category_count,
        categoriesMerged: 0,
        duration: Date.now() - startTime,
      };
    }

    // Import categories first
    onProgress?.({
      stage: 'packaging',
      current: 0,
      total: manifest.categories.length,
      message: 'Importing categories...',
      percentage: 20,
    });

    const categoryIdMap = new Map<number, number>(); // old ID -> new ID
    const existingCategories = await getCategories();

    for (let i = 0; i < manifest.categories.length; i++) {
      const cat = manifest.categories[i];
      
      onProgress?.({
        stage: 'packaging',
        current: i + 1,
        total: manifest.categories.length,
        message: `Importing category: ${cat.name}`,
        percentage: 20 + Math.round((i / manifest.categories.length) * 20),
      });

      // Check if category already exists
      const existing = existingCategories.find(
        ec => ec.name.toLowerCase() === cat.name.toLowerCase() && 
              ec.parent_id === (cat.parent_id ? categoryIdMap.get(cat.parent_id) : null)
      );

      if (existing && mergeCategories) {
        // Use existing category
        categoryIdMap.set(cat.id, existing.id);
        categoriesMerged++;
        warnings.push(`Merged with existing category: ${cat.name}`);
      } else {
        // Create new category
        try {
          const newCategory = await createCategory({
            name: existing ? `${cat.name} (Imported)` : cat.name,
            description: '',
            parent_id: cat.parent_id ? categoryIdMap.get(cat.parent_id) || null : null,
            icon: cat.icon,
            color: cat.color,
            sort_order: cat.sort_order,
          }, 1); // TODO: Get actual user ID

          categoryIdMap.set(cat.id, newCategory.id);
          categoriesImported++;
        } catch (error) {
          errors.push(`Failed to import category ${cat.name}: ${error}`);
        }
      }
    }

    // Import documents
    onProgress?.({
      stage: 'encrypting',
      current: 0,
      total: manifest.documents.length,
      message: 'Importing documents...',
      percentage: 40,
    });

    for (let i = 0; i < manifest.documents.length; i++) {
      const doc = manifest.documents[i];
      
      onProgress?.({
        stage: 'encrypting',
        current: i + 1,
        total: manifest.documents.length,
        message: `Importing: ${doc.original_filename}`,
        percentage: 40 + Math.round((i / manifest.documents.length) * 50),
      });

      // Check for duplicates
      const duplicate = await checkDuplicate(doc.original_filename, doc.size);
      
      if (duplicate.isDuplicate && skipDuplicates && !replaceExisting) {
        documentsSkipped++;
        warnings.push(`Skipped duplicate: ${doc.original_filename}`);
        continue;
      }

      // Read document file from ZIP
      const docFile = zip.file(`documents/${doc.filename}`);
      if (!docFile) {
        errors.push(`Document file not found: ${doc.filename}`);
        continue;
      }
      const docContent = await docFile.async('base64');
      const docBytes = Uint8Array.from(Buffer.from(docContent, 'base64'));
      
      // Save to temp location for uploadDocument
      const docPath = `${extractDir}documents/${doc.filename}`;
      await FileSystem.makeDirectoryAsync(`${extractDir}documents/`, { intermediates: true });
      await FileSystem.writeAsStringAsync(docPath, docContent, { encoding: 'base64' });

      // Import document
      try {
        await uploadDocument(
          {
            uri: docPath,
            name: doc.original_filename,
            size: docBytes.length,
            mimeType: doc.mime_type
          },
          {
            categoryId: doc.category_id ? categoryIdMap.get(doc.category_id) || null : null
          }
        );

        documentsImported++;
      } catch (error) {
        errors.push(`Failed to import ${doc.original_filename}: ${error}`);
      }
    }

    onProgress?.({
      stage: 'complete',
      current: 100,
      total: 100,
      message: 'Import complete!',
      percentage: 100,
    });

    // Clean up temp directory
    await FileSystem.deleteAsync(extractDir, { idempotent: true });

    const duration = Date.now() - startTime;

    // Save import history
    await saveImportHistory({
      backup_type: 'import',
      backup_location: 'other',
      backup_filename: backupPath.split('/').pop() || 'backup',
      backup_size: manifest.total_size_bytes,
      document_count: documentsImported,
      category_count: categoriesImported,
      backup_hash: '', // TODO: Calculate from manifest
      status: 'completed',
      created_at: Math.floor(Date.now() / 1000),
      restored_at: Math.floor(Date.now() / 1000),
    });

    return {
      success: true,
      documentsImported,
      documentsSkipped,
      categoriesImported,
      categoriesMerged,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      duration,
    };

  } catch (error) {
    console.error('Backup import failed:', error);
    
    // Clean up on error
    if (extractDir) {
      await FileSystem.deleteAsync(extractDir, { idempotent: true });
    }

    return {
      success: false,
      documentsImported,
      documentsSkipped,
      categoriesImported,
      categoriesMerged,
      errors: [error instanceof Error ? error.message : 'Import failed'],
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Verify backup checksums
 */
async function verifyBackupChecksums(
  extractDir: string,
  checksumContent: string,
  manifest: BackupManifest
): Promise<boolean> {
  try {
    // Parse checksum file
    const lines = checksumContent.split('\n');
    const checksums: Record<string, string> = {};
    
    for (const line of lines) {
      const match = line.match(/^(.+?):\s*([a-f0-9]+)$/);
      if (match) {
        checksums[match[1]] = match[2];
      }
    }

    // Verify manifest checksum
    const manifestContent = await FileSystem.readAsStringAsync(`${extractDir}manifest.json`);
    const manifestBytes = new TextEncoder().encode(manifestContent);
    const manifestChecksum = await calculateChecksum(manifestBytes);
    
    if (checksums['manifest.json'] !== manifestChecksum) {
      console.error('Manifest checksum mismatch');
      return false;
    }

    // Verify database checksum
    const databaseContent = await FileSystem.readAsStringAsync(`${extractDir}database.json`);
    const databaseBytes = new TextEncoder().encode(databaseContent);
    const databaseChecksum = await calculateChecksum(databaseBytes);
    
    if (checksums['database.json'] !== databaseChecksum) {
      console.error('Database checksum mismatch');
      return false;
    }

    // Verify document checksums (sample check - not all documents)
    const docsToCheck = Math.min(5, manifest.documents.length);
    for (let i = 0; i < docsToCheck; i++) {
      const doc = manifest.documents[i];
      const docPath = `${extractDir}documents/${doc.filename}`;
      const docContent = await FileSystem.readAsStringAsync(docPath);
      const docBytes = new TextEncoder().encode(docContent);
      const docChecksum = await calculateChecksum(docBytes);
      
      if (checksums[doc.filename] !== docChecksum) {
        console.error(`Document checksum mismatch: ${doc.filename}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Checksum verification failed:', error);
    return false;
  }
}

/**
 * Check if document is duplicate
 */
async function checkDuplicate(filename: string, size: number): Promise<DuplicateCheckResult> {
  const db = await getDatabase();
  
  const existing = await db.getFirstAsync<any>(
    'SELECT * FROM documents WHERE original_filename = ? AND file_size = ? LIMIT 1',
    [filename, size]
  );

  if (existing) {
    return {
      isDuplicate: true,
      existingDocument: existing,
      conflictReason: 'same_filename',
    };
  }

  return {
    isDuplicate: false,
  };
}

/**
 * Save import history to database
 */
async function saveImportHistory(history: any): Promise<void> {
  const db = await getDatabase();
  
  await db.runAsync(
    `INSERT INTO backup_history 
     (backup_type, backup_location, backup_filename, backup_size, 
      document_count, category_count, backup_hash, status, 
      created_at, restored_at)
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
      history.restored_at,
    ]
  );
}

/**
 * Get information about a backup file without importing
 */
export async function getBackupInfo(backupPath: string): Promise<BackupManifest | null> {
  try {
    const validation = await validateBackup(backupPath);
    return validation.manifest || null;
  } catch (error) {
    console.error('Failed to get backup info:', error);
    return null;
  }
}

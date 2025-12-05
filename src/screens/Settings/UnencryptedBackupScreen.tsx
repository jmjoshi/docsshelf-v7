/**
 * Unencrypted Backup Screen (FR-MAIN-013A)
 * Allows users to create plain file backups (NO ENCRYPTION)
 * 
 * Features:
 * - Document selection (individual documents)
 * - Security warning modal (mandatory consent)
 * - Progress tracking during backup
 * - Native share dialog for Files app / USB
 * - Backup history
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SecurityWarningModal from '../../components/backup/SecurityWarningModal';
import {
    createUnencryptedBackup,
    getUnencryptedBackupStats,
    shareUnencryptedBackup,
} from '../../services/backup/unencryptedBackupService';
import { getDocuments } from '../../services/database/documentService';
import { getCurrentUserId } from '../../services/database/userService';
import type {
    UnencryptedBackupOptions,
    UnencryptedBackupProgress,
} from '../../types/backup';
import type { Document } from '../../types/document';

export default function UnencryptedBackupScreen() {
  const router = useRouter();

  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<number>>(new Set());
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState<UnencryptedBackupProgress | null>(null);
  const [backupStats, setBackupStats] = useState({ total_backups: 0, last_backup: null as string | null });
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  // Load user's documents
  useEffect(() => {
    loadDocuments();
    loadBackupStats();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      const userId = await getCurrentUserId();
      if (!userId) return;
      
      const allDocs = await getDocuments({}, userId);
      setDocuments(allDocs);
    } catch (error: any) {
      console.error('[UnencryptedBackup] Failed to load documents:', error);
      Alert.alert('Error', 'Failed to load documents. Please try again.');
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const loadBackupStats = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;
      
      const stats = await getUnencryptedBackupStats(userId);
      setBackupStats(stats);
    } catch (error: any) {
      console.error('[UnencryptedBackup] Failed to load stats:', error);
    }
  };

  // Toggle document selection
  const toggleDocumentSelection = (docId: number) => {
    const newSelected = new Set(selectedDocIds);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocIds(newSelected);
  };

  // Select/Deselect all documents
  const selectAllDocuments = () => {
    if (selectedDocIds.size === documents.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(documents.map(d => d.id!)));
    }
  };

  // Show security warning modal
  const handleCreateBackup = () => {
    if (selectedDocIds.size === 0) {
      Alert.alert('No Documents Selected', 'Please select at least one document to backup.');
      return;
    }

    setShowWarningModal(true);
  };

  // User accepted security warning - proceed with backup
  const handleSecurityWarningAccepted = async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    setShowWarningModal(false);
    setIsCreatingBackup(true);
    setBackupProgress(null);

    try {
      const options: UnencryptedBackupOptions = {
        userId,
        documentIds: Array.from(selectedDocIds),
        includeCategories: true,
        userConsent: true,
      };

      // Create backup with progress tracking
      const result = await createUnencryptedBackup(
        options,
        (progress) => {
          setBackupProgress(progress);
        }
      );

      console.log('[UnencryptedBackup] Backup created:', result);

      // Show success and share
      setIsCreatingBackup(false);
      setBackupProgress(null);

      Alert.alert(
        'Backup Created',
        `Successfully created backup of ${result.fileCount} document${result.fileCount !== 1 ? 's' : ''}.`,
        [
          {
            text: 'Share Now',
            onPress: () => shareBackup(result.backupFolderUri),
          },
          {
            text: 'Later',
            style: 'cancel',
          },
        ]
      );

      // Reload stats and clear selection
      await loadBackupStats();
      setSelectedDocIds(new Set());

    } catch (error: any) {
      console.error('[UnencryptedBackup] Backup failed:', error);
      setIsCreatingBackup(false);
      setBackupProgress(null);

      Alert.alert(
        'Backup Failed',
        error.message || 'An unexpected error occurred while creating the backup.',
        [{ text: 'OK' }]
      );
    }
  };

  // Share backup via Files app
  const shareBackup = async (backupFolderPath: string) => {
    try {
      await shareUnencryptedBackup(backupFolderPath);
    } catch (error: any) {
      console.error('[UnencryptedBackup] Share failed:', error);
      Alert.alert('Share Failed', 'Unable to share backup. You can find the backup files in the app\'s documents folder.');
    }
  };

  // Calculate total size of selected documents
  const calculateTotalSize = (): number => {
    return documents
      .filter(doc => selectedDocIds.has(doc.id!))
      .reduce((total, doc) => total + (doc.file_size || 0), 0);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Plain File Backup</Text>
          <Text style={styles.headerSubtitle}>No Encryption</Text>
        </View>
      </View>

      {/* Security Banner */}
      <View style={styles.securityBanner}>
        <Ionicons name="warning" size={24} color="#FF6B6B" />
        <Text style={styles.securityBannerText}>
          Backups will NOT be encrypted. Use only for personal, secure storage.
        </Text>
      </View>

      {/* Backup Stats */}
      {backupStats.total_backups > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Total Backups: {backupStats.total_backups}
          </Text>
          {backupStats.last_backup && (
            <Text style={styles.statsText}>
              Last: {new Date(backupStats.last_backup).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Document Selection */}
      <View style={styles.selectionHeader}>
        <Text style={styles.selectionTitle}>
          Select Documents ({selectedDocIds.size} of {documents.length})
        </Text>
        <TouchableOpacity onPress={selectAllDocuments}>
          <Text style={styles.selectAllText}>
            {selectedDocIds.size === documents.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Document List */}
      {isLoadingDocuments ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      ) : documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No documents available</Text>
        </View>
      ) : (
        <ScrollView style={styles.documentList} showsVerticalScrollIndicator={true}>
          {documents.map((doc) => {
            const isSelected = selectedDocIds.has(doc.id!);
            return (
              <TouchableOpacity
                key={doc.id}
                style={[styles.documentItem, isSelected && styles.documentItemSelected]}
                onPress={() => toggleDocumentSelection(doc.id!)}
                activeOpacity={0.7}
              >
                <View style={styles.documentCheckbox}>
                  {isSelected ? (
                    <Ionicons name="checkbox" size={24} color="#4ECDC4" />
                  ) : (
                    <Ionicons name="square-outline" size={24} color="#999" />
                  )}
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {doc.original_filename}
                  </Text>
                  <Text style={styles.documentSize}>
                    {formatBytes(doc.file_size || 0)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Progress Indicator */}
      {isCreatingBackup && backupProgress && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Creating backup... {backupProgress.percentComplete.toFixed(0)}%
          </Text>
          <Text style={styles.progressFile}>
            {backupProgress.currentFile}
          </Text>
          <Text style={styles.progressStats}>
            {backupProgress.filesCompleted} / {backupProgress.totalFiles} files
          </Text>
        </View>
      )}

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {selectedDocIds.size > 0 && (
          <Text style={styles.totalSizeText}>
            Total size: {formatBytes(calculateTotalSize())}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.createButton,
            (selectedDocIds.size === 0 || isCreatingBackup) && styles.createButtonDisabled
          ]}
          onPress={handleCreateBackup}
          disabled={selectedDocIds.size === 0 || isCreatingBackup}
          activeOpacity={0.7}
        >
          {isCreatingBackup ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>
                Create Backup ({selectedDocIds.size})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Security Warning Modal */}
      <SecurityWarningModal
        visible={showWarningModal}
        onAccept={handleSecurityWarningAccepted}
        onCancel={() => setShowWarningModal(false)}
        documentCount={selectedDocIds.size}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  securityBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#D63031',
    fontWeight: '600',
    marginLeft: 12,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#555',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  selectAllText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  documentList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  documentItemSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#F0FFFE',
  },
  documentCheckbox: {
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4,
  },
  documentSize: {
    fontSize: 13,
    color: '#999',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  progressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  progressFile: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  progressStats: {
    fontSize: 13,
    color: '#999',
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalSizeText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  createButtonDisabled: {
    backgroundColor: '#CCC',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

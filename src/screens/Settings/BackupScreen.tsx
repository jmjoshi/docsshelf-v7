import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackupHistoryItem from '../../components/backup/BackupHistoryItem';
import BackupProgressModal from '../../components/backup/BackupProgressModal';
import {
    createBackup,
    getBackupHistory,
    getBackupStats,
    shareBackup,
} from '../../services/backup/backupExportService';
import {
    getBackupInfo,
    importBackup,
    pickBackupFile,
} from '../../services/backup/backupImportService';
import { initializeDatabase, isDatabaseInitialized } from '../../services/database/dbInit';
import type { BackupHistory, BackupProgress, BackupStats } from '../../types/backup';

export default function BackupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [history, setHistory] = useState<BackupHistory[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingHistory(true);
      
      // Ensure database is initialized before querying backup tables
      if (!isDatabaseInitialized()) {
        await initializeDatabase();
      }
      
      const [historyData, statsData] = await Promise.all([
        getBackupHistory(),
        getBackupStats(),
      ]);
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load backup data:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      setShowProgress(true);
      setProgress({
        stage: 'collecting',
        current: 0,
        total: 100,
        message: 'Starting backup...',
        percentage: 0,
      });

      // Ensure database is initialized before creating backup
      if (!isDatabaseInitialized()) {
        await initializeDatabase();
      }

      const result = await createBackup(
        {
          includeCategories: true,
          includeDocuments: true,
        },
        (progressData) => {
          setProgress(progressData);
        }
      );

      setShowProgress(false);
      setProgress(null);

      if (result.success) {
        // Share the backup file
        Alert.alert(
          'Backup Created',
          `Backup created successfully!\n\nSize: ${formatBytes(result.backupSize)}\nDocuments: ${result.documentsIncluded}\nCategories: ${result.categoriesIncluded}`,
          [
            {
              text: 'Share',
              onPress: async () => {
                try {
                  await shareBackup(result.backupPath!);
                  loadData(); // Reload history
                } catch (error) {
                  Alert.alert('Error', 'Failed to share backup file');
                }
              },
            },
            {
              text: 'Done',
              onPress: () => loadData(),
            },
          ]
        );
      } else {
        Alert.alert('Backup Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create backup');
      setShowProgress(false);
      setProgress(null);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async () => {
    try {
      // Pick backup file
      const fileUri = await pickBackupFile();
      if (!fileUri) {
        return; // User cancelled
      }

      // Get backup info
      setIsImporting(true);
      const manifest = await getBackupInfo(fileUri);
      
      if (!manifest) {
        Alert.alert(
          'Invalid Backup',
          'This file is not a valid backup'
        );
        setIsImporting(false);
        return;
      }

      // Show confirmation dialog
      Alert.alert(
        'Import Backup',
        `This backup contains:\n\n` +
        `• ${manifest.document_count || 0} documents\n` +
        `• ${manifest.category_count || 0} categories\n` +
        `• Created: ${formatDate(manifest.created_at || '')}\n` +
        `• Size: ${formatBytes(manifest.total_size_bytes || 0)}\n\n` +
        `Import this backup?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setIsImporting(false) },
          {
            text: 'Import',
            onPress: () => performImport(fileUri),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to read backup file');
      setIsImporting(false);
    }
  };

  const performImport = async (fileUri: string) => {
    try {
      setShowProgress(true);
      setProgress({
        stage: 'collecting',
        current: 0,
        total: 100,
        message: 'Starting import...',
        percentage: 0,
      });

      // Ensure database is initialized before importing backup
      if (!isDatabaseInitialized()) {
        await initializeDatabase();
      }

      const result = await importBackup(
        fileUri,
        {
          skipDuplicates: true,
          mergeCategories: true,
          replaceExisting: false,
        },
        (progressData: BackupProgress) => {
          setProgress(progressData);
        }
      );

      setShowProgress(false);
      setProgress(null);

      if (result.success) {
        Alert.alert(
          'Import Complete',
          `Successfully imported:\n\n` +
          `• ${result.documentsImported} documents\n` +
          `• ${result.categoriesImported} categories\n` +
          (result.documentsSkipped > 0 ? `\nSkipped ${result.documentsSkipped} duplicates` : '') +
          (result.warnings && result.warnings.length > 0 ? `\n\nWarnings: ${result.warnings.length}` : ''),
          [{ text: 'OK', onPress: () => loadData() }]
        );
      } else {
        Alert.alert(
          'Import Failed',
          (result.errors && result.errors[0]) || 'Unknown error occurred' +
          (result.errors && result.errors.length > 0 ? `\n\nErrors:\n${result.errors.join('\n')}` : '')
        );
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to import backup');
      setShowProgress(false);
      setProgress(null);
    } finally {
      setIsImporting(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: string | number): string => {
    const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Backup & Restore
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Stats Section */}
        {stats && (
          <View style={[styles.statsCard, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.primary }]}>
                  {stats.totalBackups}
                </Text>
                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Total Backups
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.primary }]}>
                  {formatBytes(stats.totalBackupSize)}
                </Text>
                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Total Size
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.primary }]}>
                  {stats.lastBackupDate ? formatDate(stats.lastBackupDate) : 'Never'}
                </Text>
                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Last Backup
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={handleExportBackup}
            disabled={isExporting || isImporting}>
            {isExporting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <IconSymbol name="arrow.down.doc.fill" size={24} color="#ffffff" />
                <Text style={styles.actionButtonText}>Export Backup</Text>
                <Text style={styles.actionButtonSubtext}>
                  Create backup of all documents
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.secondary }]}
            onPress={handleImportBackup}
            disabled={isExporting || isImporting}>
            {isImporting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <IconSymbol name="arrow.up.doc.fill" size={24} color="#ffffff" />
                <Text style={styles.actionButtonText}>Import Backup</Text>
                <Text style={styles.actionButtonSubtext}>
                  Restore from backup file
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* History Section */}
        <View style={[styles.historyCard, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Backup History
          </Text>
          
          {isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="archivebox" size={48} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No backup history yet
              </Text>
              <Text style={[styles.emptySubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Create your first backup to get started
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.map((item) => (
                <BackupHistoryItem key={item.id} item={item} colorScheme={colorScheme ?? 'light'} />
              ))}
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1c1c1e' : '#f8f9fa' }]}>
          <IconSymbol name="info.circle" size={20} color={Colors.primary} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              About Backups
            </Text>
            <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              • Backups include all documents and categories{'\n'}
              • Documents remain encrypted in backup files{'\n'}
              • Share backups to Files app, iCloud, USB drives{'\n'}
              • Import backups to restore on any device{'\n'}
              • Duplicate documents are automatically detected
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Progress Modal */}
      {showProgress && progress && (
        <BackupProgressModal
          visible={showProgress}
          progress={progress}
          onCancel={() => {
            // TODO: Implement cancellation
            Alert.alert('Cannot Cancel', 'Backup operation cannot be cancelled once started');
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
    marginTop: 8,
  },
  actionButtonSubtext: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  historyCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  historyList: {
    gap: 8,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

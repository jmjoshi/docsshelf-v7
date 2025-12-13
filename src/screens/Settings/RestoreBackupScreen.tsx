import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BottomNavBar } from '@/src/components/navigation/BottomNavBar';
import {
    getBackupInfo,
    importBackup,
    pickBackupFile,
    validateBackup,
} from '@/src/services/backup/backupImportService';
import { BackupManifest, BackupProgress } from '@/src/types/backup';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

export default function RestoreBackupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [backupInfo, setBackupInfo] = useState<BackupManifest | null>(null);
  const [backupPath, setBackupPath] = useState<string | null>(null);
  const [progress, setProgress] = useState<BackupProgress | null>(null);

  const handleSelectBackup = async () => {
    try {
      setValidating(true);
      const path = await pickBackupFile();
      
      if (!path) {
        return; // User cancelled
      }

      setBackupPath(path);

      // Validate backup
      const validation = await validateBackup(path);
      
      if (!validation.valid || !validation.canImport) {
        Alert.alert(
          'Invalid Backup',
          `This backup file cannot be restored:\n\n${validation.errors?.join('\n')}`,
          [{ text: 'OK' }]
        );
        setBackupPath(null);
        return;
      }

      // Get backup info
      const info = await getBackupInfo(path);
      if (info) {
        setBackupInfo(info);
        
        // Show backup details
        Alert.alert(
          'Backup Details',
          `Documents: ${info.document_count}\nCategories: ${info.category_count}\nCreated: ${new Date(info.created_at).toLocaleDateString()}\n\nWould you like to restore this backup?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => {
              setBackupPath(null);
              setBackupInfo(null);
            }},
            { text: 'Restore', onPress: handleRestoreBackup },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to select backup:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to select backup file');
    } finally {
      setValidating(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!backupPath) {
      return;
    }

    try {
      setLoading(true);
      setProgress({
        stage: 'collecting',
        current: 0,
        total: 100,
        message: 'Starting restore...',
        percentage: 0,
      });

      const result = await importBackup(
        backupPath,
        {
          skipDuplicates: true,
          mergeCategories: true,
          replaceExisting: false,
        },
        (p) => {
          setProgress(p);
        }
      );

      if (result.success) {
        Alert.alert(
          'Restore Complete',
          `Successfully restored:\n\n` +
          `Documents: ${result.documentsImported} imported, ${result.documentsSkipped} skipped\n` +
          `Categories: ${result.categoriesImported} imported, ${result.categoriesMerged} merged\n\n` +
          `${result.warnings?.length ? 'Warnings:\n' + result.warnings.join('\n') : ''}`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Restore Failed',
          `Failed to restore backup:\n\n${result.errors?.join('\n')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to restore backup');
    } finally {
      setLoading(false);
      setProgress(null);
      setBackupPath(null);
      setBackupInfo(null);
    }
  };

  const handleRestoreOptions = () => {
    if (!backupPath) {
      return;
    }

    Alert.alert(
      'Restore Options',
      'Choose how to handle existing data:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Merge (Keep both)',
          onPress: () => handleRestoreWithOptions(true, true, false),
        },
        {
          text: 'Replace (Delete existing)',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Replace',
              'This will DELETE all existing documents and replace them with the backup. This cannot be undone!\n\nAre you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Replace All', 
                  style: 'destructive',
                  onPress: () => handleRestoreWithOptions(false, false, true),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleRestoreWithOptions = async (
    skipDuplicates: boolean,
    mergeCategories: boolean,
    replaceExisting: boolean
  ) => {
    if (!backupPath) {
      return;
    }

    try {
      setLoading(true);
      setProgress({
        stage: 'collecting',
        current: 0,
        total: 100,
        message: 'Starting restore...',
        percentage: 0,
      });

      const result = await importBackup(
        backupPath,
        {
          skipDuplicates,
          mergeCategories,
          replaceExisting,
        },
        (p) => {
          setProgress(p);
        }
      );

      if (result.success) {
        Alert.alert(
          'Restore Complete',
          `Successfully restored:\n\n` +
          `Documents: ${result.documentsImported} imported, ${result.documentsSkipped} skipped\n` +
          `Categories: ${result.categoriesImported} imported, ${result.categoriesMerged} merged\n\n` +
          `Time: ${(result.duration / 1000).toFixed(1)}s\n\n` +
          `${result.warnings?.length ? 'Warnings:\n' + result.warnings.join('\n') : ''}`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Restore Failed',
          `Failed to restore backup:\n\n${result.errors?.join('\n')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to restore backup');
    } finally {
      setLoading(false);
      setProgress(null);
      setBackupPath(null);
      setBackupInfo(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? Colors.dark.text : Colors.light.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Restore Backup
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
          <IconSymbol name="arrow.clockwise.circle.fill" size={48} color={Colors.primary} />
          <Text style={[styles.infoTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Restore from Backup
          </Text>
          <Text style={[styles.infoText, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
            Select a .docsshelf backup file to restore your documents and categories.
          </Text>
        </View>

        {/* Instructions */}
        <View style={[styles.section, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            How to Restore
          </Text>
          
          <View style={styles.instructionItem}>
            <View style={[styles.stepNumber, { backgroundColor: Colors.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={[styles.instructionText, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
              Tap "Select Backup File" below
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={[styles.stepNumber, { backgroundColor: Colors.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={[styles.instructionText, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
              Choose your backup file from Files app
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={[styles.stepNumber, { backgroundColor: Colors.primary }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={[styles.instructionText, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
              Review backup details and confirm
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={[styles.stepNumber, { backgroundColor: Colors.primary }]}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={[styles.instructionText, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
              Wait for restoration to complete
            </Text>
          </View>
        </View>

        {/* Backup Info (if selected) */}
        {backupInfo && (
          <View style={[styles.section, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Backup Information
            </Text>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
                Documents:
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {backupInfo.document_count}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
                Categories:
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {backupInfo.category_count}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
                Created:
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {new Date(backupInfo.created_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
                Platform:
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {backupInfo.device_platform}
              </Text>
            </View>
          </View>
        )}

        {/* Progress */}
        {loading && progress && (
          <View style={[styles.progressCard, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.progressStage, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {progress.message}
            </Text>
            <Text style={[styles.progressText, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
              {progress.current} / {progress.total}
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress.percentage}%` }]} />
            </View>
            <Text style={[styles.progressPercent, { color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }]}>
              {progress.percentage}%
            </Text>
          </View>
        )}

        {/* Warning */}
        <View style={[styles.warningCard, { backgroundColor: isDark ? '#2d1f1f' : '#fff5f5' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#ff6b6b" />
          <Text style={[styles.warningTitle, { color: '#ff6b6b' }]}>
            Important
          </Text>
          <Text style={[styles.warningText, { color: isDark ? '#ffb3b3' : '#c92a2a' }]}>
            Restoring will merge with or replace your existing data. Make sure you have a current backup before proceeding.
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, (loading || validating) && styles.buttonDisabled]}
          onPress={handleSelectBackup}
          disabled={loading || validating}
        >
          {validating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <IconSymbol name="folder.fill" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Select Backup File</Text>
            </>
          )}
        </TouchableOpacity>

        {backupInfo && !loading && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleRestoreOptions}
          >
            <IconSymbol name="gearshape.fill" size={20} color={Colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: Colors.primary }]}>
              Advanced Options
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <BottomNavBar />
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 250, // Extra space for bottom navigation and text wrapping on small screens
  },
  infoCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    fontFamily: Fonts.rounded,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.rounded,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: Fonts.rounded,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
  },
  progressCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  progressStage: {
    fontSize: 16,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  progressText: {
    fontSize: 14,
    fontFamily: Fonts.rounded,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    fontFamily: Fonts.rounded,
    fontWeight: '500',
    marginTop: 4,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 13,
    fontFamily: Fonts.rounded,
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
  },
});

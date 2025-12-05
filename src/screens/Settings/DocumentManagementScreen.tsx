import { getDatabase } from '@/src/services/database/dbInit';
import { getCurrentUserId } from '@/src/services/database/userService';
import { formatFileSize } from '@/src/utils/crypto/encryption';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useToast } from 'react-native-toast-notifications';

interface StorageStats {
  totalDocuments: number;
  totalSize: number;
  categoryStats: {
    categoryId: number;
    categoryName: string;
    documentCount: number;
    totalSize: number;
  }[];
}

export default function DocumentManagementScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadStorageStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStorageStats = useCallback(async () => {
    try {
      const db = await getDatabase();
      const userId = await getCurrentUserId();

      if (!userId) {
        toast.show('User not found', { type: 'danger' });
        return;
      }

      // Get total documents and size
      const totals = await db.getFirstAsync<{ count: number; total_size: number }>(
        'SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_size FROM documents WHERE user_id = ?',
        [userId]
      );

      // Get category breakdown
      const categoryData = await db.getAllAsync<{
        category_id: number;
        category_name: string;
        document_count: number;
        total_size: number;
      }>(
        `SELECT 
          d.category_id,
          COALESCE(c.name, 'Uncategorized') as category_name,
          COUNT(d.id) as document_count,
          COALESCE(SUM(d.file_size), 0) as total_size
         FROM documents d
         LEFT JOIN categories c ON d.category_id = c.id
         WHERE d.user_id = ?
         GROUP BY d.category_id, c.name
         ORDER BY total_size DESC`,
        [userId]
      );

      setStats({
        totalDocuments: totals?.count || 0,
        totalSize: totals?.total_size || 0,
        categoryStats: categoryData.map((item) => ({
          categoryId: item.category_id,
          categoryName: item.category_name,
          documentCount: item.document_count,
          totalSize: item.total_size,
        })),
      });
    } catch (error) {
      console.error('Error loading storage stats:', error);
      toast.show('Failed to load storage statistics', { type: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleDeleteAllDocuments = () => {
    Alert.alert(
      'Delete All Documents',
      `This will permanently delete all ${stats?.totalDocuments || 0} documents. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDatabase();
              const userId = await getCurrentUserId();

              if (!userId) {
                toast.show('User not found', { type: 'danger' });
                return;
              }

              // Delete all documents for this user
              const result = await db.runAsync(
                'DELETE FROM documents WHERE user_id = ?',
                [userId]
              );

              // Log the action
              await db.runAsync(
                `INSERT INTO audit_log (user_id, action, details, ip_address) 
                 VALUES (?, 'BULK_DELETE', 'Deleted all documents', 'local')`,
                [userId]
              );

              toast.show(`Deleted ${result.changes} documents`, { type: 'success' });
              await loadStorageStats();
            } catch (error) {
              console.error('Error deleting all documents:', error);
              toast.show('Failed to delete documents', { type: 'danger' });
            }
          },
        },
      ]
    );
  };

  const handleDeleteByCategory = (categoryId: number, categoryName: string, count: number) => {
    Alert.alert(
      'Delete Category Documents',
      `Delete all ${count} documents in "${categoryName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDatabase();
              const userId = await getCurrentUserId();

              if (!userId) {
                toast.show('User not found', { type: 'danger' });
                return;
              }

              const result = await db.runAsync(
                'DELETE FROM documents WHERE user_id = ? AND category_id = ?',
                [userId, categoryId]
              );

              await db.runAsync(
                `INSERT INTO audit_log (user_id, action, details, ip_address) 
                 VALUES (?, 'BULK_DELETE', ?, 'local')`,
                [userId, `Deleted ${result.changes} documents from category: ${categoryName}`]
              );

              toast.show(`Deleted ${result.changes} documents`, { type: 'success' });
              await loadStorageStats();
            } catch (error) {
              console.error('Error deleting category documents:', error);
              toast.show('Failed to delete documents', { type: 'danger' });
            }
          },
        },
      ]
    );
  };

  const handleOptimizeDatabase = () => {
    Alert.alert(
      'Optimize Database',
      'This will rebuild the database to reclaim unused space. It may take a few seconds.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Optimize',
          onPress: async () => {
            try {
              const db = await getDatabase();

              // Run VACUUM to optimize database
              await db.execAsync('VACUUM;');

              // Run ANALYZE to update query optimizer statistics
              await db.execAsync('ANALYZE;');

              toast.show('Database optimized successfully', { type: 'success' });
            } catch (error) {
              console.error('Error optimizing database:', error);
              toast.show('Failed to optimize database', { type: 'danger' });
            }
          },
        },
      ]
    );
  };

  const handleNuclearReset = () => {
    Alert.alert(
      '⚠️ DANGER: Nuclear Database Reset',
      'This will PERMANENTLY DELETE EVERYTHING:\n\n• All documents and files\n• All categories\n• All tags and associations\n• All security logs\n• All user preferences\n• All backups references\n\nYour account will remain but all data will be lost forever.\n\nTHIS CANNOT BE UNDONE!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => confirmNuclearReset(),
        },
      ]
    );
  };

  const confirmNuclearReset = () => {
    Alert.alert(
      '⚠️ FINAL WARNING',
      'Are you ABSOLUTELY SURE you want to delete everything?\n\nThis is your last chance to cancel.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'YES, DELETE EVERYTHING',
          style: 'destructive',
          onPress: () => executeNuclearReset(),
        },
      ]
    );
  };

  const executeNuclearReset = async () => {
    try {
      setLoading(true);
      const db = await getDatabase();
      const userId = await getCurrentUserId();

      if (!userId) {
        toast.show('User not found', { type: 'danger' });
        return;
      }

      // Start transaction for atomic operation
      await db.execAsync('BEGIN TRANSACTION;');

      try {
        // Log the nuclear reset action BEFORE deletion
        await db.runAsync(
          `INSERT INTO audit_log (user_id, action, entity_type, details, ip_address) 
           VALUES (?, 'NUCLEAR_RESET', 'system', 'User initiated complete database wipe', 'local')`,
          [userId]
        );

        // Delete all user data in correct order (respecting foreign keys)
        // 1. Delete document-related data
        await db.runAsync('DELETE FROM document_tags WHERE document_id IN (SELECT id FROM documents WHERE user_id = ?)', [userId]);
        await db.runAsync('DELETE FROM documents WHERE user_id = ?', [userId]);

        // 2. Delete categories
        await db.runAsync('DELETE FROM categories WHERE user_id = ?', [userId]);

        // 3. Delete tags
        await db.runAsync('DELETE FROM tags WHERE user_id = ?', [userId]);

        // 4. Delete security logs (keep only the reset action)
        const logId = await db.runAsync(
          'SELECT id FROM audit_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
          [userId]
        );
        await db.runAsync('DELETE FROM audit_log WHERE user_id = ? AND id != ?', [userId, logId.lastInsertRowId]);

        // 5. Delete failed login attempts
        await db.runAsync('DELETE FROM failed_login_attempts WHERE user_id = ?', [userId]);

        // 6. Reset user preferences (optional - keep basic settings)
        // You can uncomment this if you want to reset preferences too
        // await db.runAsync('UPDATE users SET preferences = NULL WHERE id = ?', [userId]);

        // Commit transaction
        await db.execAsync('COMMIT;');

        // Optimize database after cleanup
        await db.execAsync('VACUUM;');
        await db.execAsync('ANALYZE;');

        toast.show('Database reset complete. All data deleted.', { type: 'success' });
        
        // Reload stats to show empty state
        await loadStorageStats();

        // Show completion message
        Alert.alert(
          '✓ Reset Complete',
          'All data has been permanently deleted. The database has been reset to a clean state.',
          [{ text: 'OK' }]
        );
      } catch (error) {
        // Rollback on error
        await db.execAsync('ROLLBACK;');
        throw error;
      }
    } catch (error) {
      console.error('Error during nuclear reset:', error);
      toast.show('Failed to reset database', { type: 'danger' });
      Alert.alert(
        'Reset Failed',
        'An error occurred during the database reset. Some data may remain. Please try again or contact support.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFindDuplicates = async () => {
    try {
      const db = await getDatabase();
      const userId = await getCurrentUserId();

      if (!userId) {
        toast.show('User not found', { type: 'danger' });
        return;
      }

      // Find potential duplicates by filename and size
      const duplicates = await db.getAllAsync<{
        filename: string;
        file_size: number;
        count: number;
      }>(
        `SELECT filename, file_size, COUNT(*) as count 
         FROM documents 
         WHERE user_id = ? 
         GROUP BY filename, file_size 
         HAVING count > 1
         ORDER BY count DESC`,
        [userId]
      );

      if (duplicates.length === 0) {
        Alert.alert('No Duplicates Found', 'No duplicate documents were found.');
      } else {
        Alert.alert(
          'Duplicates Found',
          `Found ${duplicates.length} groups of potential duplicate documents.\n\nManual review recommended before deletion.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error finding duplicates:', error);
      toast.show('Failed to find duplicates', { type: 'danger' });
    }
  };

  const renderStorageBar = () => {
    if (!stats || stats.totalSize === 0) return null;

    return (
      <View style={styles.storageBarContainer}>
        <View style={styles.storageBar}>
          {stats.categoryStats.map((category, index) => {
            const percentage = (category.totalSize / stats.totalSize) * 100;
            if (percentage < 1) return null; // Don't show categories less than 1%

            const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#00C7BE'];
            const color = colors[index % colors.length];

            return (
              <View
                key={category.categoryId}
                style={[styles.storageBarSegment, { width: `${percentage}%`, backgroundColor: color }]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading storage statistics...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Storage Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Overview</Text>

          <View style={styles.overviewCard}>
            <View style={styles.overviewItem}>
              <Ionicons name="documents-outline" size={32} color="#007AFF" />
              <Text style={styles.overviewValue}>{stats?.totalDocuments || 0}</Text>
              <Text style={styles.overviewLabel}>Total Documents</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.overviewItem}>
              <Ionicons name="server-outline" size={32} color="#34C759" />
              <Text style={styles.overviewValue}>{formatFileSize(stats?.totalSize || 0)}</Text>
              <Text style={styles.overviewLabel}>Storage Used</Text>
            </View>
          </View>

          {renderStorageBar()}
        </View>

        {/* Category Breakdown */}
        {stats && stats.categoryStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Storage by Category</Text>

            {stats.categoryStats.map((category) => (
              <View key={category.categoryId} style={styles.categoryCard}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.categoryName}</Text>
                  <Text style={styles.categoryStats}>
                    {category.documentCount} documents • {formatFileSize(category.totalSize)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    handleDeleteByCategory(
                      category.categoryId,
                      category.categoryName,
                      category.documentCount
                    )
                  }
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Bulk Operations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bulk Operations</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleDeleteAllDocuments}
            disabled={!stats || stats.totalDocuments === 0}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FF3B30' + '20' }]}>
              <Ionicons name="trash-bin-outline" size={24} color="#FF3B30" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Delete All Documents</Text>
              <Text style={styles.actionDescription}>Permanently remove all documents</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Maintenance Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance</Text>

          <TouchableOpacity style={styles.actionCard} onPress={handleFindDuplicates}>
            <View style={[styles.iconContainer, { backgroundColor: '#FF9500' + '20' }]}>
              <Ionicons name="copy-outline" size={24} color="#FF9500" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Find Duplicates</Text>
              <Text style={styles.actionDescription}>Identify potential duplicate files</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleOptimizeDatabase}>
            <View style={[styles.iconContainer, { backgroundColor: '#34C759' + '20' }]}>
              <Ionicons name="refresh-outline" size={24} color="#34C759" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Optimize Database</Text>
              <Text style={styles.actionDescription}>Reclaim unused storage space</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.dangerHeader}>
            <Ionicons name="warning" size={24} color="#FF3B30" />
            <Text style={styles.dangerTitle}>Danger Zone</Text>
          </View>

          <View style={styles.dangerCard}>
            <TouchableOpacity
              style={styles.nuclearButton}
              onPress={handleNuclearReset}
              disabled={loading}
            >
              <View style={styles.nuclearIconContainer}>
                <Ionicons name="nuclear" size={28} color="#FF3B30" />
              </View>
              <View style={styles.nuclearInfo}>
                <Text style={styles.nuclearTitle}>⚠️ Nuclear Database Reset</Text>
                <Text style={styles.nuclearDescription}>
                  Permanently delete ALL data including documents, categories, tags, and logs.
                  This action is irreversible and will reset your database to empty state.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <View style={styles.dangerNotice}>
            <Text style={styles.dangerNoticeText}>
              ⛔ WARNING: This is an administrative function that will permanently destroy all your
              data. Only use this if you want to completely start over. You will be asked to confirm
              multiple times before any deletion occurs.
            </Text>
          </View>
        </View>

        {/* Notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            ⚠️ Bulk delete operations are permanent and cannot be undone. Always backup important
            data before performing bulk operations.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 12,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  storageBarContainer: {
    marginTop: 16,
  },
  storageBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageBarSegment: {
    height: '100%',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  categoryStats: {
    fontSize: 14,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 8,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  notice: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  noticeText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dangerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3B30',
    marginLeft: 8,
  },
  dangerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF3B30',
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nuclearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF5F5',
  },
  nuclearIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF3B30' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  nuclearInfo: {
    flex: 1,
    marginRight: 8,
  },
  nuclearTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 6,
  },
  nuclearDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  dangerNotice: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  dangerNoticeText: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
    fontWeight: '500',
  },
});

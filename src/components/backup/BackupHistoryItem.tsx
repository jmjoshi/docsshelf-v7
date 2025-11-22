import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BackupHistory } from '../../types/backup';

interface BackupHistoryItemProps {
  item: BackupHistory;
  colorScheme: 'light' | 'dark';
}

export default function BackupHistoryItem({ item, colorScheme }: BackupHistoryItemProps) {
  const isDark = colorScheme === 'dark';

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getIconName = (): any => {
    if (item.backup_type === 'export') {
      return 'arrow.down.doc.fill';
    } else {
      return 'arrow.up.doc.fill';
    }
  };

  const getStatusColor = (): string => {
    if (item.status === 'failed') return '#ff3b30';
    if (item.status === 'completed') return Colors.primary;
    return Colors[colorScheme].textSecondary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: isDark ? '#2c2c2e' : '#f8f9fa',
          borderColor: isDark ? '#3a3a3c' : '#e0e0e0',
        }
      ]}>
      <View style={[styles.iconContainer, { backgroundColor: getStatusColor() + '20' }]}>
        <IconSymbol 
          name={getIconName()} 
          size={24} 
          color={getStatusColor()} 
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.filename, { color: Colors[colorScheme].text }]} numberOfLines={1}>
            {item.backup_filename}
          </Text>
          {item.status === 'failed' && (
            <View style={[styles.statusBadge, { backgroundColor: '#ff3b30' }]}>
              <Text style={styles.statusText}>Failed</Text>
            </View>
          )}
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <IconSymbol name="doc.fill" size={14} color={Colors[colorScheme].textSecondary} />
            <Text style={[styles.detailText, { color: Colors[colorScheme].textSecondary }]}>
              {item.document_count || 0} documents
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <IconSymbol name="folder.fill" size={14} color={Colors[colorScheme].textSecondary} />
            <Text style={[styles.detailText, { color: Colors[colorScheme].textSecondary }]}>
              {item.category_count || 0} categories
            </Text>
          </View>

          {item.backup_size && (
            <View style={styles.detailRow}>
              <IconSymbol name="archivebox.fill" size={14} color={Colors[colorScheme].textSecondary} />
              <Text style={[styles.detailText, { color: Colors[colorScheme].textSecondary }]}>
                {formatBytes(item.backup_size)}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.timestamp, { color: Colors[colorScheme].textSecondary }]}>
          {formatDate(item.created_at)}
        </Text>

        {item.error_message && (
          <Text style={[styles.errorText, { color: '#ff3b30' }]} numberOfLines={2}>
            {item.error_message}
          </Text>
        )}

        {item.notes && (
          <Text style={[styles.notes, { color: Colors[colorScheme].textSecondary }]} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filename: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
  },
  timestamp: {
    fontSize: 13,
  },
  errorText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  notes: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});

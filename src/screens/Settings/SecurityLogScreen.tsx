import { BottomNavBar } from '@/src/components/navigation/BottomNavBar';
import { getDatabase } from '@/src/services/database/dbInit';
import { getCurrentUserId } from '@/src/services/database/userService';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from 'react-native-toast-notifications';

interface AuditLogEntry {
  id: number;
  action: string;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

type FilterTab = 'all' | 'login' | 'security';

const LOGIN_ACTIONS = ['LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'REGISTER'];
const SECURITY_ACTIONS = [
  'PASSWORD_CHANGE',
  'MFA_ENABLED',
  'MFA_DISABLED',
  'MFA_VERIFIED',
  'BIOMETRIC_ENABLED',
  'BIOMETRIC_DISABLED',
];

export default function SecurityLogScreen() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const toast = useToast();

  const loadLogs = useCallback(async () => {
    try {
      const db = await getDatabase();
      const userId = await getCurrentUserId();

      if (!userId) {
        toast.show('User not found', { type: 'danger' });
        return;
      }

      const result = await db.getAllAsync<AuditLogEntry>(
        `SELECT id, action, details, ip_address, created_at 
         FROM audit_log 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 100`,
        [userId]
      );

      setLogs(result);
      applyFilter(result, activeFilter);
    } catch (error) {
      console.error('Error loading security logs:', error);
      toast.show('Failed to load security logs', { type: 'danger' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, toast]);

  const applyFilter = (data: AuditLogEntry[], filter: FilterTab) => {
    if (filter === 'all') {
      setFilteredLogs(data);
    } else if (filter === 'login') {
      setFilteredLogs(data.filter((log) => LOGIN_ACTIONS.includes(log.action)));
    } else if (filter === 'security') {
      setFilteredLogs(data.filter((log) => SECURITY_ACTIONS.includes(log.action)));
    }
  };

  const handleFilterChange = (filter: FilterTab) => {
    setActiveFilter(filter);
    applyFilter(logs, filter);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadLogs();
  }, [loadLogs]);

  const handleExport = async () => {
    try {
      if (filteredLogs.length === 0) {
        toast.show('No logs to export', { type: 'warning' });
        return;
      }

      // Format logs as CSV
      const header = 'Timestamp,Action,Details,IP Address\n';
      const rows = filteredLogs
        .map((log) => {
          const timestamp = formatTimestamp(log.created_at);
          const action = log.action;
          const details = log.details || '-';
          const ip = log.ip_address || '-';
          return `"${timestamp}","${action}","${details}","${ip}"`;
        })
        .join('\n');

      const csv = header + rows;

      await Share.share({
        message: csv,
        title: 'Security Log Export',
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.show('Failed to export logs', { type: 'danger' });
    }
  };

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timestamp;
    }
  };

  const getActionIcon = (action: string): string => {
    if (LOGIN_ACTIONS.includes(action)) {
      if (action === 'FAILED_LOGIN') return 'warning-outline';
      if (action === 'LOGOUT') return 'log-out-outline';
      return 'log-in-outline';
    }
    if (SECURITY_ACTIONS.includes(action)) {
      if (action === 'PASSWORD_CHANGE') return 'key-outline';
      if (action.includes('MFA')) return 'shield-checkmark-outline';
      if (action.includes('BIOMETRIC')) return 'finger-print-outline';
    }
    return 'information-circle-outline';
  };

  const getActionColor = (action: string): string => {
    if (action === 'FAILED_LOGIN') return '#FF3B30';
    if (action === 'LOGOUT') return '#FF9500';
    if (LOGIN_ACTIONS.includes(action)) return '#34C759';
    if (SECURITY_ACTIONS.includes(action)) return '#007AFF';
    return '#8E8E93';
  };

  const formatActionText = (action: string): string => {
    return action
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const renderLogItem = ({ item }: { item: AuditLogEntry }) => {
    const iconName = getActionIcon(item.action);
    const iconColor = getActionColor(item.action);
    const actionText = formatActionText(item.action);

    return (
      <View style={styles.logItem}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </View>
        <View style={styles.logContent}>
          <Text style={styles.actionText}>{actionText}</Text>
          {item.details ? <Text style={styles.detailsText}>{item.details}</Text> : null}
          <View style={styles.metaRow}>
            <Text style={styles.timestampText}>{formatTimestamp(item.created_at)}</Text>
            {item.ip_address && item.ip_address !== 'local' ? (
              <>
                <Text style={styles.metaDivider}>•</Text>
                <Text style={styles.ipText}>{item.ip_address}</Text>
              </>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No Security Logs</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'all'
          ? 'Your security activity will appear here'
          : `No ${activeFilter} activity found`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'left', 'right', 'bottom']}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading security logs...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
          onPress={() => handleFilterChange('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
          <View style={[styles.filterBadge, activeFilter === 'all' && styles.filterBadgeActive]}>
            <Text
              style={[
                styles.filterBadgeText,
                activeFilter === 'all' && styles.filterBadgeTextActive,
              ]}
            >
              {logs.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'login' && styles.filterTabActive]}
          onPress={() => handleFilterChange('login')}
        >
          <Text style={[styles.filterText, activeFilter === 'login' && styles.filterTextActive]}>
            Login
          </Text>
          <View style={[styles.filterBadge, activeFilter === 'login' && styles.filterBadgeActive]}>
            <Text
              style={[
                styles.filterBadgeText,
                activeFilter === 'login' && styles.filterBadgeTextActive,
              ]}
            >
              {logs.filter((log) => LOGIN_ACTIONS.includes(log.action)).length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'security' && styles.filterTabActive]}
          onPress={() => handleFilterChange('security')}
        >
          <Text
            style={[styles.filterText, activeFilter === 'security' && styles.filterTextActive]}
          >
            Security
          </Text>
          <View
            style={[styles.filterBadge, activeFilter === 'security' && styles.filterBadgeActive]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                activeFilter === 'security' && styles.filterBadgeTextActive,
              ]}
            >
              {logs.filter((log) => SECURITY_ACTIONS.includes(log.action)).length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Ionicons name="share-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Logs List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
      <BottomNavBar />
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginRight: 6,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  exportButton: {
    marginLeft: 'auto',
    padding: 8,
    justifyContent: 'center',
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 250, // Extra space for bottom navigation and text wrapping on small screens
  },
  logItem: {
    flexDirection: 'row',
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
  logContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  metaDivider: {
    fontSize: 13,
    color: '#C7C7CC',
    marginHorizontal: 8,
  },
  ipText: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

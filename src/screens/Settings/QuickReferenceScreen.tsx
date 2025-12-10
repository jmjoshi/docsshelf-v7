/**
 * Quick Reference Guide Screen
 * Fast navigation and common actions reference
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

interface NavigationShortcut {
  screen: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

export default function QuickReferenceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const quickActions: QuickAction[] = [
    {
      icon: 'camera',
      title: 'Scan Document',
      description: 'Tap + button → Camera icon or use Scan tab',
      color: '#007AFF',
    },
    {
      icon: 'cloud-upload',
      title: 'Upload File',
      description: 'Tap + button → Choose from device',
      color: '#34C759',
    },
    {
      icon: 'search',
      title: 'Quick Search',
      description: 'Home tab → Search bar at top',
      color: '#FF9500',
    },
    {
      icon: 'star',
      title: 'Mark Favorite',
      description: 'Open document → Tap star icon',
      color: '#FF3B30',
    },
    {
      icon: 'pricetags',
      title: 'Add Tags',
      description: 'Open document → Info → Add tags',
      color: '#5856D6',
    },
    {
      icon: 'share-social',
      title: 'Share Document',
      description: 'Open document → Share button',
      color: '#FF2D55',
    },
  ];

  const navigationShortcuts: NavigationShortcut[] = [
    {
      screen: 'Home',
      icon: 'home',
      description: 'View all documents, recent activity, quick search',
    },
    {
      screen: 'Categories',
      icon: 'file-tray-full',
      description: 'Browse by categories, create new categories',
    },
    {
      screen: 'Documents',
      icon: 'documents',
      description: 'Complete document list with filters and sorting',
    },
    {
      screen: 'Scan',
      icon: 'camera',
      description: 'Quick camera access to scan new documents',
    },
    {
      screen: 'Explorer',
      icon: 'folder-open',
      description: 'Tree view of all categories and documents',
    },
    {
      screen: 'Settings',
      icon: 'settings',
      description: 'App settings, security, about, help',
    },
  ];

  const commonTasks = [
    {
      task: 'Find a specific document',
      steps: 'Home → Search bar → Type document name',
    },
    {
      task: 'View all receipts',
      steps: 'Categories → Tap "Receipt" category',
    },
    {
      task: 'Organize documents',
      steps: 'Documents → Long press → Move to category',
    },
    {
      task: 'Backup documents',
      steps: 'Settings → Backup & Sync → Export',
    },
    {
      task: 'Enable security',
      steps: 'Settings → Security → Enable biometric lock',
    },
    {
      task: 'Change password',
      steps: 'Settings → Change Password',
    },
  ];

  const tips = [
    'Use favorites (★) to quickly access important documents',
    'Long press documents for bulk actions (delete, move, share)',
    'Swipe left/right on documents for quick actions',
    'Use Explorer tab for hierarchical view of all documents',
    'Enable auto-backup to prevent data loss',
    'Add tags to documents for better organization',
    'Use search with filters to find documents instantly',
    'Regular categories help keep documents organized',
  ];

  const renderQuickAction = (action: QuickAction) => (
    <View
      key={action.title}
      style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon} size={24} color="white" />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
        <Text style={[styles.actionDescription, { color: colors.tabIconDefault }]}>
          {action.description}
        </Text>
      </View>
    </View>
  );

  const renderNavigationShortcut = (shortcut: NavigationShortcut) => (
    <View
      key={shortcut.screen}
      style={[styles.shortcutRow, { borderBottomColor: colors.border }]}
    >
      <View style={[styles.shortcutIcon, { backgroundColor: colors.card }]}>
        <Ionicons name={shortcut.icon} size={20} color={colors.tint} />
      </View>
      <View style={styles.shortcutContent}>
        <Text style={[styles.shortcutScreen, { color: colors.text }]}>{shortcut.screen}</Text>
        <Text style={[styles.shortcutDescription, { color: colors.tabIconDefault }]}>
          {shortcut.description}
        </Text>
      </View>
    </View>
  );

  const renderTask = (item: { task: string; steps: string }, index: number) => (
    <View
      key={index}
      style={[styles.taskRow, { borderBottomColor: colors.border }]}
    >
      <Text style={[styles.taskNumber, { color: colors.tint }]}>{index + 1}</Text>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, { color: colors.text }]}>{item.task}</Text>
        <Text style={[styles.taskSteps, { color: colors.tabIconDefault }]}>{item.steps}</Text>
      </View>
    </View>
  );

  const renderTip = (tip: string, index: number) => (
    <View
      key={index}
      style={[styles.tipRow, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Ionicons name="bulb" size={20} color="#FF9500" style={styles.tipIcon} />
      <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Quick Reference</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Quick Actions</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.tabIconDefault }]}>
            Common tasks at your fingertips
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🧭 Navigation Guide</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.tabIconDefault }]}>
            Bottom tab bar shortcuts
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {navigationShortcuts.map(renderNavigationShortcut)}
          </View>
        </View>

        {/* Common Tasks */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>✅ Common Tasks</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.tabIconDefault }]}>
            Step-by-step guides
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {commonTasks.map(renderTask)}
          </View>
        </View>

        {/* Pro Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💡 Pro Tips</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.tabIconDefault }]}>
            Get the most out of DocsShelf
          </Text>
          {tips.map(renderTip)}
        </View>

        {/* Keyboard Shortcuts Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="information-circle" size={24} color={colors.tint} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Need More Help?</Text>
            <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>
              Check out the full User Manual in Settings → User Manual for detailed instructions and
              troubleshooting guides.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  shortcutRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shortcutContent: {
    flex: 1,
  },
  shortcutScreen: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  shortcutDescription: {
    fontSize: 13,
  },
  taskRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  taskNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskSteps: {
    fontSize: 13,
  },
  tipRow: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 32,
  },
});

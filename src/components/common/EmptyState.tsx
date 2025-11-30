/**
 * Empty State Component
 * Displays helpful empty states with illustrations and CTAs
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type EmptyStateType = 
  | 'no-documents' 
  | 'no-categories' 
  | 'no-search-results' 
  | 'no-favorites'
  | 'no-recent'
  | 'no-tags';

interface EmptyStateProps {
  type: EmptyStateType;
  searchQuery?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const emptyStateConfig = {
  'no-documents': {
    icon: 'doc.text' as const,
    title: 'No Documents Yet',
    message: 'Start by uploading your first document or scanning one with your camera.',
    actionLabel: 'Upload Document',
    color: '#3b82f6',
  },
  'no-categories': {
    icon: 'folder' as const,
    title: 'No Categories Yet',
    message: 'Create categories to organize your documents. Categories work like folders.',
    actionLabel: 'Create Category',
    color: '#8b5cf6',
  },
  'no-search-results': {
    icon: 'magnifyingglass' as const,
    title: 'No Results Found',
    message: 'Try different keywords or check your filters. Search looks for matches in filenames, tags, and notes.',
    actionLabel: 'Clear Filters',
    color: '#ef4444',
  },
  'no-favorites': {
    icon: 'star' as const,
    title: 'No Favorites Yet',
    message: 'Mark documents as favorites for quick access. Tap the star icon on any document.',
    actionLabel: 'Browse Documents',
    color: '#f59e0b',
  },
  'no-recent': {
    icon: 'clock' as const,
    title: 'No Recent Documents',
    message: 'Documents you view will appear here for quick access.',
    actionLabel: 'Browse Documents',
    color: '#06b6d4',
  },
  'no-tags': {
    icon: 'tag' as const,
    title: 'No Tags Yet',
    message: 'Add tags to documents for easy organization and search across categories.',
    actionLabel: 'Browse Documents',
    color: '#10b981',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  onAction,
  actionLabel,
}) => {
  const colorScheme = useColorScheme();
  const config = emptyStateConfig[type];

  const displayMessage = type === 'no-search-results' && searchQuery
    ? `No results found for "${searchQuery}". ${config.message}`
    : config.message;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
        <IconSymbol name={config.icon} size={64} color={config.color} />
      </View>

      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        {config.title}
      </Text>

      <Text style={[styles.message, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        {displayMessage}
      </Text>

      {onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: config.color }]}
          onPress={onAction}
          activeOpacity={0.8}>
          <Text style={styles.actionButtonText}>
            {actionLabel || config.actionLabel}
          </Text>
        </TouchableOpacity>
      )}

      {/* Search tips for no results */}
      {type === 'no-search-results' && (
        <View style={styles.tipsContainer}>
          <Text style={[styles.tipsTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Search Tips:
          </Text>
          <Text style={[styles.tipText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            • Try simpler or different keywords
          </Text>
          <Text style={[styles.tipText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            • Check your spelling
          </Text>
          <Text style={[styles.tipText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            • Remove filters to see all results
          </Text>
          <Text style={[styles.tipText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            • Search by file type (e.g., "PDF")
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
  tipsContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
});

/**
 * TagList Component
 * Displays a list of tags in a horizontal scrollable view
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Tag } from '../../types/document';
import TagChip from './TagChip';

interface TagListProps {
  tags: Tag[];
  onTagPress?: (tag: Tag) => void;
  onTagRemove?: (tag: Tag) => void;
  selectedTags?: number[];
  size?: 'small' | 'medium' | 'large';
  removable?: boolean;
  horizontal?: boolean;
  emptyMessage?: string;
  maxTags?: number;
}

export default function TagList({
  tags,
  onTagPress,
  onTagRemove,
  selectedTags = [],
  size = 'medium',
  removable = false,
  horizontal = true,
  emptyMessage = 'No tags',
  maxTags,
}: TagListProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  if (tags.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const content = (
    <>
      {displayTags.map((tag) => (
        <TagChip
          key={tag.id}
          tag={tag}
          onPress={onTagPress}
          onRemove={removable ? onTagRemove : undefined}
          size={size}
          removable={removable}
          selected={selectedTags.includes(tag.id)}
        />
      ))}
      {remainingCount > 0 && (
        <View style={[styles.moreChip, size === 'small' && styles.moreChipSmall]}>
          <Text style={[styles.moreText, size === 'small' && styles.moreTextSmall]}>
            +{remainingCount}
          </Text>
        </View>
      )}
    </>
  );

  if (horizontal) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollContainer}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.wrapContainer}>{content}</View>;
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  emptyContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  moreChip: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreChipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  moreTextSmall: {
    fontSize: 11,
  },
});

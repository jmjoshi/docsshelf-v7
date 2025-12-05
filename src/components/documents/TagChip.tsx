/**
 * TagChip Component
 * Displays a single tag as a colored chip/badge
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { Tag } from '../../types/document';

interface TagChipProps {
  tag: Tag;
  onPress?: (tag: Tag) => void;
  onRemove?: (tag: Tag) => void;
  size?: 'small' | 'medium' | 'large';
  removable?: boolean;
  selected?: boolean;
}

export default function TagChip({
  tag,
  onPress,
  onRemove,
  size = 'medium',
  removable = false,
  selected = false,
}: TagChipProps) {
  const sizeStyles = {
    small: styles.chipSmall,
    medium: styles.chipMedium,
    large: styles.chipLarge,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  const iconSizeMap = {
    small: 12,
    medium: 14,
    large: 16,
  };

  const backgroundColor = selected ? tag.color : `${tag.color}20`;
  const textColor = selected ? '#FFFFFF' : tag.color;
  const borderColor = tag.color;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        sizeStyles[size],
        { backgroundColor, borderColor },
        selected && styles.chipSelected,
      ]}
      onPress={() => onPress?.(tag)}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Text style={[styles.text, textSizeStyles[size], { color: textColor }]} numberOfLines={1}>
        {tag.name}
      </Text>
      {removable && onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="close-circle" size={iconSizeMap[size]} color={textColor} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipSelected: {
    borderWidth: 2,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 13,
  },
  textLarge: {
    fontSize: 15,
  },
  removeButton: {
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * Explorer Node Component
 * Individual tree node representing a category or document
 * Displays with proper indentation, icons, and expand/collapse controls
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ExplorerNodeProps } from '../../types/explorer';

export default function ExplorerNode({
  node,
  isExpanded,
  isSelected,
  onPress,
  onExpand,
  onCollapse,
}: ExplorerNodeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const indentWidth = 20;
  const indent = node.depth * indentWidth;
  
  const handleExpandCollapse = () => {
    if (isExpanded) {
      onCollapse();
    } else {
      onExpand();
    }
  };
  
  const getExpandIcon = () => {
    if (!node.hasChildren) return null;
    return isExpanded ? 'chevron-down' : 'chevron-forward';
  };
  
  const getNodeIcon = (): any => {
    if (node.type === 'category') {
      return isExpanded ? 'folder-open' : 'folder';
    }
    return getDocumentIcon(node.mimeType);
  };
  
  const getDocumentIcon = (mimeType?: string): any => {
    if (!mimeType) return 'document-outline';
    
    if (mimeType.startsWith('image/')) return 'image-outline';
    if (mimeType.startsWith('video/')) return 'videocam-outline';
    if (mimeType.includes('pdf')) return 'document-text-outline';
    if (mimeType.includes('word')) return 'document-text-outline';
    if (mimeType.includes('excel')) return 'grid-outline';
    if (mimeType.includes('powerpoint')) return 'easel-outline';
    if (mimeType.startsWith('audio/')) return 'musical-notes-outline';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive-outline';
    
    return 'document-outline';
  };
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  };
  
  const getIconColor = () => {
    if (node.type === 'category' && node.color) {
      return node.color;
    }
    return colors.tint;
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          paddingLeft: indent + 12,
          backgroundColor: isSelected ? colors.background : colors.card,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Expand/Collapse Button */}
      {node.hasChildren && (
        <TouchableOpacity
          onPress={handleExpandCollapse}
          style={styles.expandButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={getExpandIcon()!}
            size={18}
            color={colors.text}
          />
        </TouchableOpacity>
      )}
      
      {!node.hasChildren && <View style={styles.expandButton} />}
      
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: getIconColor() }]}>
        <Ionicons
          name={getNodeIcon()}
          size={20}
          color={colorScheme === 'dark' && node.type === 'document' ? '#000' : '#FFF'}
        />
      </View>
      
      {/* Name and Details */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {node.name}
        </Text>
        
        {node.type === 'category' && node.documentCount !== undefined && (
          <Text style={[styles.details, { color: colors.tabIconDefault }]}>
            {node.documentCount} {node.documentCount === 1 ? 'item' : 'items'}
          </Text>
        )}
        
        {node.type === 'document' && node.fileSize && (
          <Text style={[styles.details, { color: colors.tabIconDefault }]}>
            {formatFileSize(node.fileSize)}
          </Text>
        )}
      </View>
      
      {/* Favorite Indicator */}
      {node.type === 'document' && node.isFavorite && (
        <Ionicons name="star" size={16} color="#FFD700" style={styles.favoriteIcon} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 12,
    borderBottomWidth: 1,
  },
  expandButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  details: {
    fontSize: 12,
  },
  favoriteIcon: {
    marginLeft: 8,
  },
});

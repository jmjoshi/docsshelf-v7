/**
 * Skeleton Loading Components
 * Beautiful skeleton screens with shimmer animation
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/**
 * Base Skeleton Item with shimmer animation
 */
interface SkeletonItemProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  width = '100%',
  height,
  borderRadius = 8,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#2c2c2e' : '#e0e0e0',
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * Document List Skeleton
 */
export const DocumentListSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={styles.documentCard}>
          <SkeletonItem width={48} height={48} borderRadius={8} />
          <View style={styles.documentInfo}>
            <SkeletonItem width="70%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <SkeletonItem width="40%" height={12} borderRadius={4} />
          </View>
          <SkeletonItem width={24} height={24} borderRadius={12} />
        </View>
      ))}
    </View>
  );
};

/**
 * Category List Skeleton
 */
export const CategoryListSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.categoryCard}>
          <SkeletonItem width={40} height={40} borderRadius={20} />
          <View style={styles.categoryInfo}>
            <SkeletonItem width="60%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonItem width="30%" height={12} borderRadius={4} />
          </View>
          <SkeletonItem width={20} height={20} borderRadius={4} />
        </View>
      ))}
    </View>
  );
};

/**
 * Search Results Skeleton
 */
export const SearchSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <SkeletonItem width="100%" height={20} borderRadius={4} style={{ marginBottom: 12 }} />
        <SkeletonItem width="40%" height={14} borderRadius={4} />
      </View>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.searchResultCard}>
          <SkeletonItem width={56} height={56} borderRadius={8} />
          <View style={styles.searchResultInfo}>
            <SkeletonItem width="80%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <SkeletonItem width="60%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonItem width="40%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Profile/Settings Skeleton
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <SkeletonItem width={80} height={80} borderRadius={40} />
        <SkeletonItem width="60%" height={20} borderRadius={4} style={{ marginTop: 16 }} />
        <SkeletonItem width="40%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      </View>

      {/* Settings Items */}
      <View style={styles.settingsSection}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.settingsItem}>
            <SkeletonItem width={32} height={32} borderRadius={16} />
            <View style={styles.settingsItemText}>
              <SkeletonItem width="70%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
              <SkeletonItem width="50%" height={12} borderRadius={4} />
            </View>
            <SkeletonItem width={20} height={20} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * Document Details Skeleton
 */
export const DocumentDetailsSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Document Preview */}
      <SkeletonItem width="100%" height={200} borderRadius={12} style={{ marginBottom: 24 }} />

      {/* Document Info */}
      <View style={styles.detailsSection}>
        <SkeletonItem width="80%" height={24} borderRadius={4} style={{ marginBottom: 16 }} />
        <SkeletonItem width="40%" height={14} borderRadius={4} style={{ marginBottom: 24 }} />

        {/* Metadata */}
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.metadataRow}>
            <SkeletonItem width="30%" height={14} borderRadius={4} />
            <SkeletonItem width="50%" height={14} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <SkeletonItem width="48%" height={48} borderRadius={12} />
        <SkeletonItem width="48%" height={48} borderRadius={12} />
      </View>
    </View>
  );
};

/**
 * Stats Dashboard Skeleton
 */
export const StatsSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Welcome Header */}
      <SkeletonItem width="70%" height={28} borderRadius={4} style={{ marginBottom: 8 }} />
      <SkeletonItem width="50%" height={16} borderRadius={4} style={{ marginBottom: 24 }} />

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.statsCard}>
            <SkeletonItem width={40} height={40} borderRadius={20} style={{ marginBottom: 12 }} />
            <SkeletonItem width="80%" height={32} borderRadius={4} style={{ marginBottom: 8 }} />
            <SkeletonItem width="60%" height={14} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Feature Cards */}
      <View style={styles.featureSection}>
        {[1, 2].map((item) => (
          <View key={item} style={styles.featureCard}>
            <SkeletonItem width={48} height={48} borderRadius={24} />
            <View style={styles.featureInfo}>
              <SkeletonItem width="70%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
              <SkeletonItem width="90%" height={14} borderRadius={4} />
            </View>
            <SkeletonItem width={24} height={24} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  // Document List
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  documentInfo: {
    flex: 1,
  },
  // Category List
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  // Search
  searchHeader: {
    marginBottom: 24,
  },
  searchResultCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  // Profile
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  settingsSection: {
    marginTop: 24,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  // Document Details
  detailsSection: {
    marginBottom: 24,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureSection: {
    marginTop: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  featureInfo: {
    flex: 1,
  },
});

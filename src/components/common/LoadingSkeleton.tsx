/**
 * Loading Skeleton Component
 * Shows placeholder content while data is loading
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface DocumentSkeletonProps {
  count?: number;
}

export const DocumentListSkeleton: React.FC<DocumentSkeletonProps> = ({ count = 5 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.documentItem}>
          <LoadingSkeleton width={50} height={50} borderRadius={8} style={styles.thumbnail} />
          <View style={styles.info}>
            <LoadingSkeleton width="70%" height={16} style={styles.title} />
            <LoadingSkeleton width="50%" height={12} style={styles.subtitle} />
            <LoadingSkeleton width="40%" height={12} style={styles.date} />
          </View>
        </View>
      ))}
    </View>
  );
};

export const StatsSkeleton: React.FC = () => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <LoadingSkeleton width={60} height={32} style={styles.statValue} />
        <LoadingSkeleton width={80} height={12} style={styles.statLabel} />
      </View>
      <View style={styles.statItem}>
        <LoadingSkeleton width={60} height={32} style={styles.statValue} />
        <LoadingSkeleton width={80} height={12} style={styles.statLabel} />
      </View>
      <View style={styles.statItem}>
        <LoadingSkeleton width={60} height={32} style={styles.statValue} />
        <LoadingSkeleton width={80} height={12} style={styles.statLabel} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
  },
  container: {
    padding: 10,
  },
  documentItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
  thumbnail: {
    marginRight: 15,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 6,
  },
  date: {
    marginBottom: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    marginBottom: 8,
  },
  statLabel: {
    marginTop: 0,
  },
});

export default LoadingSkeleton;

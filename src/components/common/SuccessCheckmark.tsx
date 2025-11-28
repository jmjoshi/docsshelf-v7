/**
 * Success Checkmark Animation
 * Animated checkmark for success feedback
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SuccessCheckmarkProps {
  size?: number;
  color?: string;
  duration?: number;
  onComplete?: () => void;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  size = 80,
  color = '#10b981',
  duration = 600,
  onComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate checkmark appearance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          speed: 8,
          bounciness: 12,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.checkmarkContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color + '20',
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}>
        <IconSymbol name="checkmark" size={size * 0.5} color={color} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

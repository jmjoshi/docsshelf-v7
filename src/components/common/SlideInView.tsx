/**
 * Slide In View Component
 * Animates child elements sliding in from a direction
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

type Direction = 'left' | 'right' | 'top' | 'bottom';

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = 'bottom',
  delay = 0,
  distance = 50,
  style,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set initial position
    switch (direction) {
      case 'left':
        translateX.setValue(-distance);
        break;
      case 'right':
        translateX.setValue(distance);
        break;
      case 'top':
        translateY.setValue(-distance);
        break;
      case 'bottom':
        translateY.setValue(distance);
        break;
    }

    // Animate to final position
    const timer = setTimeout(() => {
      Animated.spring(
        direction === 'left' || direction === 'right' ? translateX : translateY,
        {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 8,
        }
      ).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX }, { translateY }],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

/**
 * Swipeable Row Component
 * Row with swipe actions (delete, archive, etc.)
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useRef } from 'react';
import {
    Animated,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface SwipeAction {
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  style?: ViewStyle;
  actionWidth?: number;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  style,
  actionWidth = 80,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        const maxLeft = leftActions.length * actionWidth;
        const maxRight = -(rightActions.length * actionWidth);
        const newValue = lastOffset.current + gestureState.dx;

        if (newValue >= maxRight && newValue <= maxLeft) {
          translateX.setValue(newValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = actionWidth / 2;
        let finalPosition = 0;

        if (gestureState.dx > threshold && leftActions.length > 0) {
          finalPosition = leftActions.length * actionWidth;
        } else if (gestureState.dx < -threshold && rightActions.length > 0) {
          finalPosition = -(rightActions.length * actionWidth);
        }

        lastOffset.current = finalPosition;

        Animated.spring(translateX, {
          toValue: finalPosition,
          useNativeDriver: true,
          speed: 12,
          bounciness: 6,
        }).start();
      },
    })
  ).current;

  const handleActionPress = (action: SwipeAction) => {
    // Close the row
    lastOffset.current = 0;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 6,
    }).start();

    // Execute action
    action.onPress();
  };

  return (
    <View style={styles.container}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.leftActions]}>
          {leftActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: action.color, width: actionWidth }]}
              onPress={() => handleActionPress(action)}
              activeOpacity={0.8}>
              <IconSymbol name={action.icon as any} size={24} color="#ffffff" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.rightActions]}>
          {rightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: action.color, width: actionWidth }]}
              onPress={() => handleActionPress(action)}
              activeOpacity={0.8}>
              <IconSymbol name={action.icon as any} size={24} color="#ffffff" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main Content */}
      <Animated.View
        style={[
          style,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftActions: {
    left: 0,
  },
  rightActions: {
    right: 0,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

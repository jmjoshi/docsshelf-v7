/**
 * Feature Highlight Component
 * Highlights new features or important UI elements
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface FeatureHighlightProps {
  visible: boolean;
  title: string;
  description: string;
  targetPosition?: { x: number; y: number; width: number; height: number };
  onDismiss: () => void;
  onNext?: () => void;
  showNext?: boolean;
}

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  visible,
  title,
  description,
  targetPosition,
  onDismiss,
  onNext,
  showNext = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const tooltipPosition = targetPosition
    ? {
        top: targetPosition.y + targetPosition.height + 16,
        left: Math.max(16, Math.min(targetPosition.x, width - 300 - 16)),
      }
    : {
        top: height / 2 - 100,
        left: (width - 300) / 2,
      };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onDismiss}
        />

        {/* Highlight circle around target */}
        {targetPosition && (
          <View
            style={[
              styles.highlight,
              {
                top: targetPosition.y - 8,
                left: targetPosition.x - 8,
                width: targetPosition.width + 16,
                height: targetPosition.height + 16,
                borderRadius: (targetPosition.width + 16) / 2,
              },
            ]}
          />
        )}

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltip,
            {
              backgroundColor: isDark ? '#2c2c2e' : '#ffffff',
              ...tooltipPosition,
              opacity: fadeAnim,
            },
          ]}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {description}
          </Text>

          <View style={styles.actions}>
            {showNext && onNext ? (
              <>
                <TouchableOpacity style={styles.skipButton} onPress={onDismiss} activeOpacity={0.8}>
                  <Text style={[styles.skipButtonText, { color: Colors.primary }]}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextButton, { backgroundColor: Colors.primary }]}
                  onPress={onNext}
                  activeOpacity={0.8}>
                  <Text style={styles.nextButtonText}>Next</Text>
                  <IconSymbol name="chevron.right" size={16} color="#ffffff" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.gotItButton, { backgroundColor: Colors.primary }]}
                onPress={onDismiss}
                activeOpacity={0.8}>
                <Text style={styles.gotItButtonText}>Got it!</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  tooltip: {
    position: 'absolute',
    width: 300,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
  gotItButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  gotItButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
});

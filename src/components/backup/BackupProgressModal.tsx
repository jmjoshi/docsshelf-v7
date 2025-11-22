import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { BackupProgress } from '../../types/backup';

interface BackupProgressModalProps {
  visible: boolean;
  progress: BackupProgress;
  onCancel?: () => void;
}

export default function BackupProgressModal({
  visible,
  progress,
  onCancel,
}: BackupProgressModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStageIcon = (stage: string): any => {
    switch (stage) {
      case 'collecting':
        return 'folder.fill';
      case 'packaging':
        return 'doc.fill';
      case 'encrypting':
        return 'lock.fill';
      case 'compressing':
        return 'archivebox.fill';
      case 'validating':
        return 'checkmark.shield.fill';
      case 'complete':
        return 'checkmark.circle.fill';
      default:
        return 'arrow.clockwise';
    }
  };

  const getStageLabel = (stage: string): string => {
    switch (stage) {
      case 'collecting':
        return 'Collecting files...';
      case 'packaging':
        return 'Creating backup...';
      case 'encrypting':
        return 'Securing data...';
      case 'compressing':
        return 'Compressing...';
      case 'validating':
        return 'Validating...';
      case 'complete':
        return 'Complete!';
      default:
        return 'Processing...';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <BlurView
        intensity={isDark ? 40 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
            <IconSymbol
              name={getStageIcon(progress.stage)}
              size={48}
              color={Colors.primary}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            {getStageLabel(progress.stage)}
          </Text>

          {/* Message */}
          {progress.message && (
            <Text style={[styles.message, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {progress.message}
            </Text>
          )}

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: isDark ? '#3a3a3c' : '#e0e0e0' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress.percentage}%`,
                    backgroundColor: Colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.percentage, { color: Colors[colorScheme ?? 'light'].text }]}>
              {Math.round(progress.percentage)}%
            </Text>
          </View>

          {/* Current Progress */}
          {progress.total > 0 && (
            <Text style={[styles.counter, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {progress.current} of {progress.total}
            </Text>
          )}

          {/* Details - removed since BackupProgress doesn't have details property */}

          {/* Loading Indicator */}
          <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />

          {/* Cancel Button (if provided) */}
          {onCancel && progress.stage !== 'complete' && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: isDark ? '#3a3a3c' : '#e0e0e0' }]}
              onPress={onCancel}>
              <Text style={[styles.cancelText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Fonts.mono,
  },
  counter: {
    fontSize: 14,
    marginBottom: 16,
  },
  detailsCard: {
    width: '100%',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  spinner: {
    marginVertical: 16,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

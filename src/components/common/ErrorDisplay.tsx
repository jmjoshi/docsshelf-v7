/**
 * Error Display Component
 * Shows user-friendly error messages with actions
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ErrorMessage, parseError } from '../../utils/ui/errorMessages';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  customMessage?: ErrorMessage;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  customMessage,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const errorMessage = customMessage || parseError(error);

  const handleAction = () => {
    switch (errorMessage.action) {
      case 'retry':
        onRetry?.();
        break;
      case 'login':
        router.replace('/(auth)/login');
        break;
      case 'forgot-password':
        router.push('/(auth)/forgot-password');
        break;
      case 'settings':
        Linking.openSettings();
        break;
      case 'back':
        router.back();
        break;
      case 'help':
        router.push('/(tabs)/explore');
        break;
      case 'compress':
        Alert.alert(
          'How to Compress Files',
          'Use a file compression app or online tool to reduce file size:\n\n' +
          '• For PDFs: Use Adobe Acrobat or online PDF compressors\n' +
          '• For images: Reduce resolution or use image compression tools\n' +
          '• For documents: Save as a more compact format'
        );
        break;
      default:
        onDismiss?.();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: '#ef4444' + '20' }]}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#ef4444" />
      </View>

      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        {errorMessage.title}
      </Text>

      <Text style={[styles.message, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        {errorMessage.message}
      </Text>

      <View style={styles.buttonContainer}>
        {errorMessage.actionLabel && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: Colors.primary }]}
            onPress={handleAction}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>
              {errorMessage.actionLabel}
            </Text>
          </TouchableOpacity>
        )}

        {onDismiss && (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                borderColor: isDark ? '#404040' : '#e0e0e0',
                backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
              },
            ]}
            onPress={onDismiss}
            activeOpacity={0.8}>
            <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Dismiss
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 320,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
});

/**
 * Error Message Component
 * Displays user-friendly error messages with suggested actions
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface ErrorInfo {
  title: string;
  message: string;
  code?: string;
  suggestedAction?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
}

interface ErrorMessageProps {
  error: ErrorInfo;
  style?: any;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.title}>{error.title}</Text>
      <Text style={styles.message}>{error.message}</Text>
      
      {error.suggestedAction && (
        <Text style={styles.suggestion}>{error.suggestedAction}</Text>
      )}
      
      {error.code && (
        <Text style={styles.code}>Error Code: {error.code}</Text>
      )}
      
      <View style={styles.actions}>
        {error.onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={error.onRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
        
        {error.onContactSupport && (
          <TouchableOpacity style={styles.supportButton} onPress={error.onContactSupport}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Common error messages for the app
export const ErrorMessages = {
  // Network errors
  networkError: (onRetry?: () => void): ErrorInfo => ({
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection.',
    code: 'NET_001',
    suggestedAction: 'Make sure you have an active internet connection and try again.',
    onRetry,
  }),

  // Database errors
  databaseError: (onRetry?: () => void): ErrorInfo => ({
    title: 'Database Error',
    message: 'Unable to access local database. Your data is safe.',
    code: 'DB_001',
    suggestedAction: 'Try restarting the app. If the problem persists, contact support.',
    onRetry,
  }),

  // Document errors
  documentNotFound: (): ErrorInfo => ({
    title: 'Document Not Found',
    message: 'The document you are looking for does not exist or has been deleted.',
    code: 'DOC_001',
    suggestedAction: 'Check if the document was moved or deleted.',
  }),

  documentLoadError: (onRetry?: () => void): ErrorInfo => ({
    title: 'Failed to Load Document',
    message: 'Unable to load the document. The file may be corrupted.',
    code: 'DOC_002',
    suggestedAction: 'Try opening the document again. If it still fails, the file may be corrupted.',
    onRetry,
  }),

  documentUploadError: (onRetry?: () => void): ErrorInfo => ({
    title: 'Upload Failed',
    message: 'Unable to upload the document. Please try again.',
    code: 'DOC_003',
    suggestedAction: 'Check your storage space and try again.',
    onRetry,
  }),

  documentDeleteError: (onRetry?: () => void): ErrorInfo => ({
    title: 'Delete Failed',
    message: 'Unable to delete the document. Please try again.',
    code: 'DOC_004',
    suggestedAction: 'Make sure the document is not open in another app.',
    onRetry,
  }),

  // Backup/Restore errors
  backupError: (onRetry?: () => void): ErrorInfo => ({
    title: 'Backup Failed',
    message: 'Unable to create backup. Check your storage space.',
    code: 'BKP_001',
    suggestedAction: 'Make sure you have enough storage space and try again.',
    onRetry,
  }),

  restoreError: (onRetry?: () => void): ErrorInfo => ({
    title: 'Restore Failed',
    message: 'Unable to restore from backup. The file may be corrupted.',
    code: 'BKP_002',
    suggestedAction: 'Try selecting a different backup file.',
    onRetry,
  }),

  // Authentication errors
  authError: (): ErrorInfo => ({
    title: 'Authentication Failed',
    message: 'Invalid email or password. Please try again.',
    code: 'AUTH_001',
    suggestedAction: 'Double-check your credentials and try again.',
  }),

  accountLockedError: (): ErrorInfo => ({
    title: 'Account Locked',
    message: 'Your account has been temporarily locked due to too many failed login attempts.',
    code: 'AUTH_002',
    suggestedAction: 'Please wait 30 minutes before trying again.',
  }),

  // Generic error
  genericError: (message: string, onRetry?: () => void, onContactSupport?: () => void): ErrorInfo => ({
    title: 'Something Went Wrong',
    message,
    code: 'GEN_001',
    suggestedAction: 'Please try again or contact support if the problem persists.',
    onRetry,
    onContactSupport,
  }),
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3e0',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    margin: 15,
  },
  errorIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d84315',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#5d4037',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestion: {
    fontSize: 13,
    color: '#6d4c41',
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  code: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  supportButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  supportButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorMessage;

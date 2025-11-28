/**
 * User-Friendly Error Messages
 * Contextual, actionable error messages for better UX
 */

export interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
  actionLabel?: string;
}

/**
 * Authentication Errors
 */
export const AuthErrors = {
  INVALID_CREDENTIALS: {
    title: 'Login Failed',
    message: 'Incorrect email or password. Please try again or reset your password.',
    action: 'forgot-password',
    actionLabel: 'Reset Password',
  },
  ACCOUNT_LOCKED: {
    title: 'Account Temporarily Locked',
    message: 'Too many failed login attempts. Your account has been locked for 30 minutes for security.',
    action: 'wait',
    actionLabel: 'Try Again Later',
  },
  EMAIL_ALREADY_EXISTS: {
    title: 'Email Already Registered',
    message: 'This email is already associated with an account. Please log in or use a different email.',
    action: 'login',
    actionLabel: 'Go to Login',
  },
  WEAK_PASSWORD: {
    title: 'Password Too Weak',
    message: 'Your password must be at least 8 characters with uppercase, lowercase, number, and special character.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  MFA_CODE_INVALID: {
    title: 'Invalid Verification Code',
    message: 'The code you entered is incorrect or has expired. Please check your authenticator app and try again.',
    action: 'retry',
    actionLabel: 'Enter Code Again',
  },
  MFA_CODE_EXPIRED: {
    title: 'Code Expired',
    message: 'The verification code has expired. Please wait for a new code in your authenticator app.',
    action: 'wait',
    actionLabel: 'Wait for New Code',
  },
  SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired for security. Please log in again to continue.',
    action: 'login',
    actionLabel: 'Log In Again',
  },
  BIOMETRIC_FAILED: {
    title: 'Biometric Authentication Failed',
    message: 'Face ID/Touch ID verification failed. Please try again or use your password.',
    action: 'password',
    actionLabel: 'Use Password',
  },
};

/**
 * Document Upload/Management Errors
 */
export const DocumentErrors = {
  FILE_TOO_LARGE: {
    title: 'File Too Large',
    message: 'File exceeds 50MB limit. Please choose a smaller file or compress it before uploading.',
    action: 'compress',
    actionLabel: 'Learn How to Compress',
  },
  INVALID_FILE_TYPE: {
    title: 'Unsupported File Type',
    message: 'This file type is not supported. Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT.',
    action: 'help',
    actionLabel: 'View Supported Types',
  },
  UPLOAD_FAILED: {
    title: 'Upload Failed',
    message: 'Failed to upload document. Please check your connection and available storage, then try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  ENCRYPTION_FAILED: {
    title: 'Encryption Failed',
    message: 'Unable to encrypt document. This may be due to low memory. Please close other apps and try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  DELETE_FAILED: {
    title: 'Delete Failed',
    message: 'Unable to delete document. Please try again or contact support if the problem persists.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  UPDATE_FAILED: {
    title: 'Update Failed',
    message: 'Unable to update document information. Please check your changes and try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  DOCUMENT_NOT_FOUND: {
    title: 'Document Not Found',
    message: 'This document no longer exists. It may have been deleted or moved.',
    action: 'back',
    actionLabel: 'Go Back',
  },
  PERMISSION_DENIED: {
    title: 'Permission Required',
    message: 'DocsShelf needs permission to access your files. Please enable file access in Settings.',
    action: 'settings',
    actionLabel: 'Open Settings',
  },
};

/**
 * Category Management Errors
 */
export const CategoryErrors = {
  CREATE_FAILED: {
    title: 'Create Failed',
    message: 'Unable to create category. Please check the name and try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  UPDATE_FAILED: {
    title: 'Update Failed',
    message: 'Unable to update category. Please check your changes and try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  DELETE_FAILED: {
    title: 'Delete Failed',
    message: 'Unable to delete category. Make sure it doesn\'t contain documents or subcategories.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  CIRCULAR_REFERENCE: {
    title: 'Invalid Parent',
    message: 'Cannot move category here as it would create a circular reference. Choose a different parent.',
    action: 'choose',
    actionLabel: 'Choose Different Parent',
  },
  MAX_DEPTH_EXCEEDED: {
    title: 'Maximum Depth Reached',
    message: 'Categories can only be nested 10 levels deep. Please choose a different parent category.',
    action: 'choose',
    actionLabel: 'Choose Different Parent',
  },
  CATEGORY_NOT_EMPTY: {
    title: 'Category Not Empty',
    message: 'This category contains documents or subcategories. Move or delete them first, or use "Delete with Contents".',
    action: 'move',
    actionLabel: 'Manage Contents',
  },
};

/**
 * Search Errors
 */
export const SearchErrors = {
  SEARCH_FAILED: {
    title: 'Search Failed',
    message: 'Unable to search documents. Please try again with different keywords.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  INDEX_REBUILD_NEEDED: {
    title: 'Search Index Outdated',
    message: 'Search results may be incomplete. Rebuild the search index in Settings > Advanced.',
    action: 'rebuild',
    actionLabel: 'Rebuild Index',
  },
};

/**
 * Backup/Restore Errors
 */
export const BackupErrors = {
  BACKUP_FAILED: {
    title: 'Backup Failed',
    message: 'Unable to create backup. Check your connection, storage space, and try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  RESTORE_FAILED: {
    title: 'Restore Failed',
    message: 'Unable to restore backup. Ensure the backup file is valid and not corrupted.',
    action: 'retry',
    actionLabel: 'Try Different Backup',
  },
  INVALID_BACKUP: {
    title: 'Invalid Backup File',
    message: 'This file is not a valid DocsShelf backup. Please select a backup file created by DocsShelf.',
    action: 'choose',
    actionLabel: 'Choose Different File',
  },
  BACKUP_CORRUPTED: {
    title: 'Backup Corrupted',
    message: 'The backup file appears to be corrupted or incomplete. Try a different backup file.',
    action: 'choose',
    actionLabel: 'Choose Different File',
  },
  WRONG_PASSWORD: {
    title: 'Incorrect Password',
    message: 'The password you entered doesn\'t match the one used to create this backup. Please try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  USB_NOT_CONNECTED: {
    title: 'USB Device Not Connected',
    message: 'No USB device detected. Please connect a USB drive and grant access permission.',
    action: 'connect',
    actionLabel: 'Connect USB',
  },
  USB_PERMISSION_DENIED: {
    title: 'USB Access Denied',
    message: 'DocsShelf needs permission to access USB devices. Please grant permission when prompted.',
    action: 'permission',
    actionLabel: 'Grant Permission',
  },
  USB_INSUFFICIENT_SPACE: {
    title: 'Not Enough Space',
    message: 'USB device doesn\'t have enough free space for the backup. Free up space or use a larger USB drive.',
    action: 'space',
    actionLabel: 'Check Space',
  },
  EXPORT_FAILED: {
    title: 'Export Failed',
    message: 'Unable to export backup. Check your storage space and try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
};

/**
 * Network Errors
 */
export const NetworkErrors = {
  NO_CONNECTION: {
    title: 'No Internet Connection',
    message: 'Please check your internet connection and try again. Most features work offline.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  TIMEOUT: {
    title: 'Request Timed Out',
    message: 'The request took too long. Please check your connection and try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again in a few minutes.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
};

/**
 * Storage Errors
 */
export const StorageErrors = {
  INSUFFICIENT_SPACE: {
    title: 'Not Enough Storage',
    message: 'Your device doesn\'t have enough free space. Free up space and try again.',
    action: 'manage',
    actionLabel: 'Manage Storage',
  },
  READ_FAILED: {
    title: 'Read Failed',
    message: 'Unable to read data from storage. This may be due to device storage issues.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  WRITE_FAILED: {
    title: 'Write Failed',
    message: 'Unable to save data. Check your available storage space and try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  CORRUPTION_DETECTED: {
    title: 'Data Corruption Detected',
    message: 'Some data appears corrupted. Restore from a recent backup to recover your documents.',
    action: 'restore',
    actionLabel: 'Restore Backup',
  },
};

/**
 * Scanner/Camera Errors
 */
export const ScannerErrors = {
  CAMERA_PERMISSION_DENIED: {
    title: 'Camera Permission Required',
    message: 'DocsShelf needs camera access to scan documents. Please enable camera permission in Settings.',
    action: 'settings',
    actionLabel: 'Open Settings',
  },
  CAMERA_UNAVAILABLE: {
    title: 'Camera Unavailable',
    message: 'Unable to access camera. Close other apps using the camera and try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  CAPTURE_FAILED: {
    title: 'Capture Failed',
    message: 'Unable to capture photo. Please try again.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  PROCESSING_FAILED: {
    title: 'Processing Failed',
    message: 'Unable to process scanned image. Please try capturing again.',
    action: 'retry',
    actionLabel: 'Scan Again',
  },
};

/**
 * Generic/Fallback Errors
 */
export const GenericErrors = {
  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    action: 'retry',
    actionLabel: 'Try Again',
  },
  OPERATION_CANCELLED: {
    title: 'Operation Cancelled',
    message: 'The operation was cancelled.',
    action: 'back',
    actionLabel: 'Go Back',
  },
  MAINTENANCE: {
    title: 'Maintenance in Progress',
    message: 'This feature is temporarily unavailable due to maintenance. Please try again later.',
    action: 'back',
    actionLabel: 'Go Back',
  },
};

/**
 * Get error message by code
 */
export const getErrorMessage = (errorCode: string): ErrorMessage => {
  const allErrors = {
    ...AuthErrors,
    ...DocumentErrors,
    ...CategoryErrors,
    ...SearchErrors,
    ...BackupErrors,
    ...NetworkErrors,
    ...StorageErrors,
    ...ScannerErrors,
    ...GenericErrors,
  };

  return allErrors[errorCode as keyof typeof allErrors] || GenericErrors.UNKNOWN_ERROR;
};

/**
 * Parse error and return user-friendly message
 */
export const parseError = (error: any): ErrorMessage => {
  // Check for specific error codes
  if (error?.code) {
    const errorMessage = getErrorMessage(error.code);
    if (errorMessage !== GenericErrors.UNKNOWN_ERROR) {
      return errorMessage;
    }
  }

  // Check for common error patterns
  const errorString = error?.message || error?.toString() || '';

  // Network errors
  if (errorString.includes('Network request failed') || errorString.includes('ENOTFOUND')) {
    return NetworkErrors.NO_CONNECTION;
  }
  if (errorString.includes('timeout') || errorString.includes('ETIMEDOUT')) {
    return NetworkErrors.TIMEOUT;
  }

  // Storage errors
  if (errorString.includes('ENOSPC') || errorString.includes('no space')) {
    return StorageErrors.INSUFFICIENT_SPACE;
  }

  // File errors
  if (errorString.includes('ENOENT') || errorString.includes('not found')) {
    return DocumentErrors.DOCUMENT_NOT_FOUND;
  }

  // Permission errors
  if (errorString.includes('EACCES') || errorString.includes('permission denied')) {
    return DocumentErrors.PERMISSION_DENIED;
  }

  // Default
  return GenericErrors.UNKNOWN_ERROR;
};

/**
 * Format error for display
 */
export const formatErrorForDisplay = (error: any): string => {
  const errorMessage = parseError(error);
  return `${errorMessage.title}\n\n${errorMessage.message}`;
};

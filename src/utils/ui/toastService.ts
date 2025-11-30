/**
 * Toast Notification Service
 * Centralized toast notification system for user feedback
 */


// Type guard to ensure we only use valid toast types
export type ToastType = 'success' | 'warning' | 'danger' | 'info';

// Extended ToastOptions with our app-specific settings
export interface ToastOptions {
  type: ToastType;
  duration?: number;
  animationType?: 'slide-in' | 'zoom-in';
  placement?: 'top' | 'bottom';
  onPress?: () => void;
}

// Toast instance will be set by the ToastProvider
let toastInstance: any = null;

/**
 * Set the toast instance (called by ToastProvider)
 */
export const setToastInstance = (instance: any) => {
  toastInstance = instance;
};

/**
 * Show a success toast
 */
export const showSuccess = (message: string, duration: number = 3000) => {
  if (!toastInstance) {
    console.warn('Toast instance not initialized');
    return;
  }
  
  toastInstance.show(message, {
    type: 'success',
    duration,
    animationType: 'slide-in',
    placement: 'top',
  });
};

/**
 * Show an error toast
 */
export const showError = (message: string, duration: number = 4000) => {
  if (!toastInstance) {
    console.warn('Toast instance not initialized');
    return;
  }
  
  toastInstance.show(message, {
    type: 'danger',
    duration,
    animationType: 'slide-in',
    placement: 'top',
  });
};

/**
 * Show a warning toast
 */
export const showWarning = (message: string, duration: number = 3500) => {
  if (!toastInstance) {
    console.warn('Toast instance not initialized');
    return;
  }
  
  toastInstance.show(message, {
    type: 'warning',
    duration,
    animationType: 'slide-in',
    placement: 'top',
  });
};

/**
 * Show an info toast
 */
export const showInfo = (message: string, duration: number = 3000) => {
  if (!toastInstance) {
    console.warn('Toast instance not initialized');
    return;
  }
  
  toastInstance.show(message, {
    type: 'info',
    duration,
    animationType: 'slide-in',
    placement: 'top',
  });
};

/**
 * Show a custom toast with full options
 */
export const showToast = (message: string, options: ToastOptions) => {
  if (!toastInstance) {
    console.warn('Toast instance not initialized');
    return;
  }
  
  toastInstance.show(message, options);
};

/**
 * Hide all toasts
 */
export const hideAll = () => {
  if (!toastInstance) {
    return;
  }
  
  toastInstance.hideAll();
};

// Predefined messages for common scenarios
export const ToastMessages = {
  // Document operations
  DOCUMENT_UPLOADED: 'Document uploaded successfully',
  DOCUMENT_DELETED: 'Document deleted',
  DOCUMENT_UPDATED: 'Document updated successfully',
  DOCUMENT_SHARED: 'Document shared',
  DOCUMENT_FAVORITE_ADDED: 'Added to favorites',
  DOCUMENT_FAVORITE_REMOVED: 'Removed from favorites',
  
  // Category operations
  CATEGORY_CREATED: 'Category created',
  CATEGORY_UPDATED: 'Category updated',
  CATEGORY_DELETED: 'Category deleted',
  
  // Authentication
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTER_SUCCESS: 'Account created successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  
  // Backup operations
  BACKUP_CREATED: 'Backup created successfully',
  BACKUP_RESTORED: 'Backup restored successfully',
  BACKUP_EXPORTED: 'Backup exported',
  
  // Sync operations
  SYNC_SUCCESS: 'Synced successfully',
  SYNC_FAILED: 'Sync failed. Please try again.',
  
  // Network
  NETWORK_ERROR: 'Network connection issue. Please check your connection.',
  
  // Errors
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  PERMISSION_DENIED: 'Permission denied',
  FILE_TOO_LARGE: 'File size exceeds the limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  
  // USB operations
  USB_BACKUP_SUCCESS: 'USB backup created successfully',
  USB_RESTORE_SUCCESS: 'USB backup restored successfully',
  USB_NOT_CONNECTED: 'USB device not connected',
  USB_PERMISSION_DENIED: 'USB access permission denied',
};

/**
 * Helper to show operation result with appropriate toast
 */
export const showOperationResult = (
  success: boolean,
  successMessage: string,
  errorMessage?: string
) => {
  if (success) {
    showSuccess(successMessage);
  } else {
    showError(errorMessage || ToastMessages.GENERIC_ERROR);
  }
};

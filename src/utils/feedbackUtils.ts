/**
 * User Feedback Utilities
 * Haptic feedback and toast notification helpers
 */

import * as Haptics from 'expo-haptics';

// Haptic feedback functions
export const hapticFeedback = {
  success: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  
  error: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  
  warning: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
  
  light: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  
  medium: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  
  heavy: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  
  selection: async () => {
    await Haptics.selectionAsync();
  },
};

// Toast message templates
export const toastMessages = {
  // Document operations
  documentUploaded: 'Document uploaded successfully',
  documentDeleted: 'Document deleted',
  documentUpdated: 'Document updated',
  documentFavorited: 'Added to favorites',
  documentUnfavorited: 'Removed from favorites',
  
  // Backup operations
  backupCreated: 'Backup created successfully',
  backupRestored: 'Backup restored successfully',
  backupFailed: 'Backup failed. Please try again.',
  
  // Category operations
  categoryCreated: 'Category created',
  categoryUpdated: 'Category updated',
  categoryDeleted: 'Category deleted',
  
  // Authentication
  loginSuccess: 'Welcome back!',
  logoutSuccess: 'Logged out successfully',
  registrationSuccess: 'Account created successfully',
  
  // Errors
  networkError: 'No internet connection',
  genericError: 'Something went wrong',
  permissionDenied: 'Permission denied',
  
  // Settings
  settingsSaved: 'Settings saved',
  passwordChanged: 'Password changed successfully',
  profileUpdated: 'Profile updated',
};

// Helper to show toast with haptic feedback
// Note: This requires useToast hook from react-native-toast-notifications
export const showToastWithHaptic = async (
  toast: any,
  type: 'success' | 'danger' | 'warning' | 'normal',
  message: string,
  haptic: boolean = true
) => {
  if (haptic) {
    switch (type) {
      case 'success':
        await hapticFeedback.success();
        break;
      case 'danger':
        await hapticFeedback.error();
        break;
      case 'warning':
        await hapticFeedback.warning();
        break;
      default:
        await hapticFeedback.light();
    }
  }
  
  toast.show(message, {
    type,
    duration: 3000,
    animationType: 'slide-in',
  });
};

export default hapticFeedback;

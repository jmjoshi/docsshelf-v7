/**
 * Feedback Utils Tests
 * Tests for haptic feedback and toast message utilities
 */

import { hapticFeedback, showToastWithHaptic, toastMessages } from '@/src/utils/feedbackUtils';
import * as Haptics from 'expo-haptics';

// Mock expo-haptics
jest.mock('expo-haptics');

describe('Feedback Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hapticFeedback', () => {
    describe('notification feedback', () => {
      it('should trigger success notification', async () => {
        await hapticFeedback.success();
        
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success
        );
      });

      it('should trigger error notification', async () => {
        await hapticFeedback.error();
        
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Error
        );
      });

      it('should trigger warning notification', async () => {
        await hapticFeedback.warning();
        
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Warning
        );
      });
    });

    describe('impact feedback', () => {
      it('should trigger light impact', async () => {
        await hapticFeedback.light();
        
        expect(Haptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });

      it('should trigger medium impact', async () => {
        await hapticFeedback.medium();
        
        expect(Haptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Medium
        );
      });

      it('should trigger heavy impact', async () => {
        await hapticFeedback.heavy();
        
        expect(Haptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Heavy
        );
      });
    });

    describe('selection feedback', () => {
      it('should trigger selection feedback', async () => {
        await hapticFeedback.selection();
        
        expect(Haptics.selectionAsync).toHaveBeenCalled();
      });
    });
  });

  describe('toastMessages', () => {
    it('should have document operation messages', () => {
      expect(toastMessages.documentUploaded).toBe('Document uploaded successfully');
      expect(toastMessages.documentDeleted).toBe('Document deleted');
      expect(toastMessages.documentUpdated).toBe('Document updated');
      expect(toastMessages.documentFavorited).toBe('Added to favorites');
      expect(toastMessages.documentUnfavorited).toBe('Removed from favorites');
    });

    it('should have backup operation messages', () => {
      expect(toastMessages.backupCreated).toBe('Backup created successfully');
      expect(toastMessages.backupRestored).toBe('Backup restored successfully');
      expect(toastMessages.backupFailed).toBe('Backup failed. Please try again.');
    });

    it('should have category operation messages', () => {
      expect(toastMessages.categoryCreated).toBe('Category created');
      expect(toastMessages.categoryUpdated).toBe('Category updated');
      expect(toastMessages.categoryDeleted).toBe('Category deleted');
    });

    it('should have authentication messages', () => {
      expect(toastMessages.loginSuccess).toBe('Welcome back!');
      expect(toastMessages.logoutSuccess).toBe('Logged out successfully');
      expect(toastMessages.registrationSuccess).toBe('Account created successfully');
    });

    it('should have error messages', () => {
      expect(toastMessages.networkError).toBe('No internet connection');
      expect(toastMessages.genericError).toBe('Something went wrong');
      expect(toastMessages.permissionDenied).toBe('Permission denied');
    });

    it('should have settings messages', () => {
      expect(toastMessages.settingsSaved).toBe('Settings saved');
      expect(toastMessages.passwordChanged).toBe('Password changed successfully');
      expect(toastMessages.profileUpdated).toBe('Profile updated');
    });

    it('should have all messages as non-empty strings', () => {
      Object.values(toastMessages).forEach((message) => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('showToastWithHaptic', () => {
    let mockToast: any;

    beforeEach(() => {
      mockToast = {
        show: jest.fn(),
      };
    });

    it('should show success toast with haptic feedback', async () => {
      await showToastWithHaptic(mockToast, 'success', 'Test message');
      
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
      expect(mockToast.show).toHaveBeenCalledWith('Test message', {
        type: 'success',
        duration: 3000,
        animationType: 'slide-in',
      });
    });

    it('should show danger toast with error haptic', async () => {
      await showToastWithHaptic(mockToast, 'danger', 'Error message');
      
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
      expect(mockToast.show).toHaveBeenCalledWith('Error message', {
        type: 'danger',
        duration: 3000,
        animationType: 'slide-in',
      });
    });

    it('should show warning toast with warning haptic', async () => {
      await showToastWithHaptic(mockToast, 'warning', 'Warning message');
      
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
      expect(mockToast.show).toHaveBeenCalledWith('Warning message', {
        type: 'warning',
        duration: 3000,
        animationType: 'slide-in',
      });
    });

    it('should show normal toast with light haptic', async () => {
      await showToastWithHaptic(mockToast, 'normal', 'Normal message');
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
      expect(mockToast.show).toHaveBeenCalledWith('Normal message', {
        type: 'normal',
        duration: 3000,
        animationType: 'slide-in',
      });
    });

    it('should skip haptic feedback when haptic=false', async () => {
      await showToastWithHaptic(mockToast, 'success', 'Test message', false);
      
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(mockToast.show).toHaveBeenCalled();
    });

    it('should use default haptic=true when not specified', async () => {
      await showToastWithHaptic(mockToast, 'success', 'Test message');
      
      expect(Haptics.notificationAsync).toHaveBeenCalled();
    });

    it('should pass correct animation type', async () => {
      await showToastWithHaptic(mockToast, 'success', 'Test message');
      
      expect(mockToast.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ animationType: 'slide-in' })
      );
    });

    it('should pass correct duration', async () => {
      await showToastWithHaptic(mockToast, 'success', 'Test message');
      
      expect(mockToast.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ duration: 3000 })
      );
    });
  });

  describe('default export', () => {
    it('should export hapticFeedback as default', () => {
      const defaultExport = require('@/src/utils/feedbackUtils').default;
      expect(defaultExport).toBe(hapticFeedback);
    });
  });
});

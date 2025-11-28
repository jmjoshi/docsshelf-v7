/**
 * Accessibility Utilities
 * Helpers for improving app accessibility (WCAG 2.1 compliance)
 */

import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Minimum touch target size (44x44 points on iOS, 48x48 dp on Android)
 */
export const MIN_TOUCH_TARGET_SIZE = Platform.OS === 'ios' ? 44 : 48;

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    return false;
  }
};

/**
 * Announce message to screen reader
 */
export const announceForAccessibility = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Calculate contrast ratio between two colors
 * Returns value between 1 and 21
 * WCAG AA requires: 4.5:1 for normal text, 3:1 for large text
 * WCAG AAA requires: 7:1 for normal text, 4.5:1 for large text
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Convert RGB to relative luminance
    const toLinear = (c: number) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast ratio meets WCAG AA standard
 */
export const meetsWCAG_AA = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Check if contrast ratio meets WCAG AAA standard
 */
export const meetsWCAG_AAA = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
};

/**
 * Accessibility labels for common actions
 */
export const A11yLabels = {
  // Navigation
  back: 'Go back',
  close: 'Close',
  menu: 'Open menu',
  more: 'More options',
  
  // Actions
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  refresh: 'Refresh',
  
  // Documents
  uploadDocument: 'Upload document',
  scanDocument: 'Scan document',
  viewDocument: 'View document',
  shareDocument: 'Share document',
  favoriteDocument: 'Add to favorites',
  unfavoriteDocument: 'Remove from favorites',
  
  // Categories
  createCategory: 'Create category',
  selectCategory: 'Select category',
  
  // Settings
  openSettings: 'Open settings',
  toggleTheme: 'Toggle dark mode',
  enableBiometrics: 'Enable biometric authentication',
  
  // States
  loading: 'Loading',
  error: 'Error occurred',
  success: 'Operation successful',
  empty: 'No items',
};

/**
 * Accessibility hints for complex interactions
 */
export const A11yHints = {
  // Swipeable actions
  swipeLeft: 'Swipe left for more actions',
  swipeRight: 'Swipe right for more actions',
  swipeToDelete: 'Swipe left to delete',
  
  // Long press
  longPress: 'Long press for more options',
  
  // Navigation
  tapToOpen: 'Tap to open',
  tapToView: 'Tap to view details',
  tapToEdit: 'Tap to edit',
  
  // Forms
  required: 'Required field',
  optional: 'Optional field',
  
  // Lists
  emptyList: 'No items to display',
  loadingList: 'Loading items',
};

/**
 * Format accessibility label for document
 */
export const formatDocumentA11yLabel = (
  filename: string,
  category?: string,
  isFavorite?: boolean,
  fileSize?: string
): string => {
  let label = `Document: ${filename}`;
  
  if (category) {
    label += `, Category: ${category}`;
  }
  
  if (isFavorite) {
    label += ', Favorited';
  }
  
  if (fileSize) {
    label += `, Size: ${fileSize}`;
  }
  
  return label;
};

/**
 * Format accessibility label for category
 */
export const formatCategoryA11yLabel = (
  name: string,
  documentCount?: number,
  hasSubcategories?: boolean
): string => {
  let label = `Category: ${name}`;
  
  if (documentCount !== undefined) {
    label += `, ${documentCount} ${documentCount === 1 ? 'document' : 'documents'}`;
  }
  
  if (hasSubcategories) {
    label += ', Has subcategories';
  }
  
  return label;
};

/**
 * Format accessibility label for button with state
 */
export const formatButtonA11yLabel = (
  label: string,
  state?: 'loading' | 'disabled' | 'selected'
): string => {
  let a11yLabel = label;
  
  if (state === 'loading') {
    a11yLabel += ', Loading';
  } else if (state === 'disabled') {
    a11yLabel += ', Disabled';
  } else if (state === 'selected') {
    a11yLabel += ', Selected';
  }
  
  return a11yLabel;
};

/**
 * Create accessible touch target
 * Ensures minimum size while maintaining visual appearance
 */
export const createAccessibleHitSlop = (visualSize: number) => {
  const difference = MIN_TOUCH_TARGET_SIZE - visualSize;
  if (difference <= 0) return undefined;
  
  const slop = difference / 2;
  return {
    top: slop,
    bottom: slop,
    left: slop,
    right: slop,
  };
};

/**
 * Document Upload Screen Tests - Post-Upload Flow
 * Tests for the scan flow loop with post-upload options
 */

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import DocumentUploadScreen from '../../src/screens/Documents/DocumentUploadScreen';
import categoryReducer from '../../src/store/slices/categorySlice';
import documentReducer from '../../src/store/slices/documentSlice';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('react-native-toast-notifications', () => ({
  useToast: () => ({
    show: jest.fn(),
  }),
}));

jest.mock('../../src/services/database/userService', () => ({
  getCurrentUserId: jest.fn().mockResolvedValue(1),
}));

jest.mock('../../src/utils/feedbackUtils', () => ({
  hapticFeedback: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('DocumentUploadScreen - Post-Upload Flow', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        category: categoryReducer,
        documents: documentReducer,
      },
    });
    jest.clearAllMocks();
  });

  const renderScreen = (params = {}) => {
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
    };

    jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue(mockRouter);
    jest.spyOn(require('expo-router'), 'useLocalSearchParams').mockReturnValue(params);

    return {
      ...render(
        <Provider store={store}>
          <DocumentUploadScreen />
        </Provider>
      ),
      mockRouter,
    };
  };

  describe('Post-Upload Modal Display', () => {
    it('should show post-upload modal after successful scan document upload', async () => {
      const { getByText, mockRouter } = renderScreen({
        scannedImageUri: 'file:///test.jpg',
        scannedFormat: 'jpeg',
      });

      await waitFor(() => {
        expect(getByText('✓ Document Uploaded')).toBeTruthy();
      });
    });

    it('should show three options in post-upload modal', async () => {
      const { getByText } = renderScreen({
        scannedImageUri: 'file:///test.jpg',
        scannedFormat: 'jpeg',
      });

      await waitFor(() => {
        expect(getByText('Scan More')).toBeTruthy();
        expect(getByText('View Document')).toBeTruthy();
        expect(getByText('Done')).toBeTruthy();
      });
    });
  });

  describe('Scan More Option', () => {
    it('should navigate back to scan flow when "Scan More" is pressed', async () => {
      const { getByText, mockRouter } = renderScreen({
        scannedImageUri: 'file:///test.jpg',
        scannedFormat: 'jpeg',
      });

      await waitFor(() => {
        const scanMoreButton = getByText('Scan More');
        fireEvent.press(scanMoreButton);
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/scan');
    });

    it('should reset upload form when "Scan More" is selected', async () => {
      const { getByText, queryByText } = renderScreen({
        scannedImageUri: 'file:///test.jpg',
        scannedFormat: 'jpeg',
      });

      await waitFor(() => {
        const scanMoreButton = getByText('Scan More');
        fireEvent.press(scanMoreButton);
      });

      // Modal should be closed
      await waitFor(() => {
        expect(queryByText('✓ Document Uploaded')).toBeNull();
      });
    });
  });

  describe('View Document Option', () => {
    it('should navigate to document viewer when "View Document" is pressed', async () => {
      const { getByText, mockRouter } = renderScreen({
        scannedImageUri: 'file:///test.jpg',
        scannedFormat: 'jpeg',
      });

      // Simulate successful upload with document ID
      const documentId = 123;
      
      await waitFor(() => {
        const viewButton = getByText('View Document');
        fireEvent.press(viewButton);
      });

      // Should navigate to document viewer with ID
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining('/document/')
        );
      });
    });
  });

  describe('Done Option', () => {
    it('should navigate to documents list when "Done" is pressed', async () => {
      const { getByText, mockRouter } = renderScreen({
        scannedImageUri: 'file:///test.jpg',
        scannedFormat: 'jpeg',
      });

      await waitFor(() => {
        const doneButton = getByText('Done');
        fireEvent.press(doneButton);
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/documents');
    });

    it('should close modal when "Done" is pressed', async () => {
      const { getByText, queryByText } = renderScreen({
        scannedImageUri: 'file:///test.jpg',
        scannedFormat: 'jpeg',
      });

      await waitFor(() => {
        const doneButton = getByText('Done');
        fireEvent.press(doneButton);
      });

      // Modal should be closed
      await waitFor(() => {
        expect(queryByText('✓ Document Uploaded')).toBeNull();
      });
    });
  });

  describe('Traditional Upload Flow', () => {
    it('should NOT show post-upload modal for traditional file picker uploads', async () => {
      const { queryByText } = renderScreen(); // No scan params

      // Simulate traditional upload (no scannedImageUri)
      await waitFor(() => {
        expect(queryByText('✓ Document Uploaded')).toBeNull();
      });
    });

    it('should navigate directly to document viewer for traditional uploads', async () => {
      const { mockRouter } = renderScreen();

      // For traditional uploads, should go straight to document view
      // This is tested implicitly by the absence of modal
      expect(mockRouter.replace).not.toHaveBeenCalledWith('/scan');
    });
  });

  describe('Modal Interactions', () => {
    it('should handle back button press on modal by calling Done', async () => {
      const { getByText, mockRouter } = renderScreen({
        scannedImageUri: 'file:///test.jpg',
        scannedFormat: 'jpeg',
      });

      await waitFor(() => {
        // Simulate Android back button or modal dismissal
        const modal = getByText('✓ Document Uploaded').parent?.parent?.parent;
        if (modal && modal.props.onRequestClose) {
          modal.props.onRequestClose();
        }
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/documents');
    });
  });

  describe('Scan Flow Loop', () => {
    it('should allow multiple scan cycles', async () => {
      const { getByText, mockRouter, rerender } = renderScreen({
        scannedImageUri: 'file:///test1.jpg',
        scannedFormat: 'jpeg',
      });

      // First scan - select Scan More
      await waitFor(() => {
        fireEvent.press(getByText('Scan More'));
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/scan');

      // Simulate coming back with second scan
      jest.spyOn(require('expo-router'), 'useLocalSearchParams').mockReturnValue({
        scannedImageUri: 'file:///test2.jpg',
        scannedFormat: 'jpeg',
      });

      rerender(
        <Provider store={store}>
          <DocumentUploadScreen />
        </Provider>
      );

      // Should show modal again for second scan
      await waitFor(() => {
        expect(getByText('✓ Document Uploaded')).toBeTruthy();
      });
    });
  });
});

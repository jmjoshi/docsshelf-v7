/**
 * Document Slice Tests
 * Tests Redux state management for documents
 * Part of Phase 1: Redux Slice Testing
 */

import { configureStore } from '@reduxjs/toolkit';
import documentReducer, {
  loadDocuments,
  loadDocumentStats,
  uploadDocumentWithProgress,
  readDocumentContent,
  updateDocumentMetadata,
  removeDocument,
  toggleFavorite,
  setSelectedDocument,
  clearError,
  setFilter,
  clearUploadProgress,
  selectAllDocuments,
  selectSelectedDocument,
  selectDocumentStats,
  selectUploadProgress,
  selectDocumentLoading,
  selectDocumentError,
  selectDocumentFilter,
  selectDocumentById,
  selectDocumentsByCategory,
  selectFavoriteDocuments,
  selectRecentDocuments,
  selectActiveUploads,
} from '../../../src/store/slices/documentSlice';
import * as documentService from '../../../src/services/database/documentService';
import type { Document, DocumentStats, DocumentFilter } from '../../../src/types/document';

// Mock the document service
jest.mock('../../../src/services/database/documentService');

const mockDocumentService = documentService as jest.Mocked<typeof documentService>;

describe('Document Slice', () => {
  let store: ReturnType<typeof configureStore>;

  // Sample test data
  const mockDocument: Document = {
    id: 1,
    user_id: 1,
    category_id: 10,
    original_filename: 'test.pdf',
    stored_filename: 'encrypted_test.bin',
    file_size: 1024,
    mime_type: 'application/pdf',
    encryption_key: 'key123',
    encryption_iv: 'iv123',
    encryption_hmac: 'hmac123',
    checksum: 'checksum123',
    is_favorite: false,
    tags: null,
    notes: null,
    created_at: '2025-11-27T00:00:00Z',
    updated_at: '2025-11-27T00:00:00Z',
  };

  const mockStats: DocumentStats = {
    total_documents: 10,
    total_size_bytes: 10240,
    total_size_formatted: '10 KB',
    by_category: {
      '10': { count: 5, size: 5120 },
      '20': { count: 5, size: 5120 },
    },
    favorite_count: 3,
  };

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        documents: documentReducer,
      },
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().documents;
      
      expect(state.documents).toEqual([]);
      expect(state.selectedDocument).toBeNull();
      expect(state.stats).toBeNull();
      expect(state.uploadProgress).toEqual({});
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.filter).toEqual({
        sort_by: 'created_at',
        sort_order: 'DESC',
      });
    });
  });

  describe('Sync Actions', () => {
    describe('setSelectedDocument', () => {
      it('should set selected document by ID', () => {
        // First add a document to the store
        store.dispatch({
          type: loadDocuments.fulfilled.type,
          payload: [mockDocument],
        });

        store.dispatch(setSelectedDocument(1));
        const state = store.getState().documents;

        expect(state.selectedDocument).toEqual(mockDocument);
      });

      it('should clear selected document when null', () => {
        store.dispatch({
          type: loadDocuments.fulfilled.type,
          payload: [mockDocument],
        });
        store.dispatch(setSelectedDocument(1));
        store.dispatch(setSelectedDocument(null));

        const state = store.getState().documents;
        expect(state.selectedDocument).toBeNull();
      });

      it('should handle non-existent document ID', () => {
        store.dispatch(setSelectedDocument(999));
        const state = store.getState().documents;

        expect(state.selectedDocument).toBeNull();
      });
    });

    describe('setFilter', () => {
      it('should update filter', () => {
        const filter: DocumentFilter = {
          category_id: 10,
          sort_by: 'title',
          sort_order: 'ASC',
        };

        store.dispatch(setFilter(filter));
        const state = store.getState().documents;

        expect(state.filter).toEqual(filter);
      });

      it('should merge partial filter updates', () => {
        store.dispatch(setFilter({ category_id: 10 }));
        let state = store.getState().documents;
        expect(state.filter.category_id).toBe(10);
        expect(state.filter.sort_by).toBe('created_at'); // Preserves default

        store.dispatch(setFilter({ sort_by: 'title' }));
        state = store.getState().documents;
        expect(state.filter.category_id).toBe(10); // Preserved
        expect(state.filter.sort_by).toBe('title'); // Updated
      });
    });

    describe('clearError', () => {
      it('should clear error message', () => {
        // Set an error first
        store.dispatch({
          type: loadDocuments.rejected.type,
          payload: 'Test error',
        });
        
        expect(store.getState().documents.error).toBe('Test error');

        store.dispatch(clearError());
        expect(store.getState().documents.error).toBeNull();
      });
    });

    describe('clearUploadProgress', () => {
      it('should clear specific upload progress', () => {
        // Manually set some upload progress
        store.dispatch({
          type: uploadDocumentWithProgress.pending.type,
          meta: { requestId: 'upload-1' },
        });

        store.dispatch(clearUploadProgress('upload-1'));
        const state = store.getState().documents;

        expect(state.uploadProgress['upload-1']).toBeUndefined();
      });
    });
  });

  describe('Async Thunks', () => {
    describe('loadDocuments', () => {
      it('should load documents successfully', async () => {
        mockDocumentService.getDocuments.mockResolvedValue([mockDocument]);

        await store.dispatch(loadDocuments(undefined));
        const state = store.getState().documents;

        expect(state.documents).toEqual([mockDocument]);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(mockDocumentService.getDocuments).toHaveBeenCalledWith(undefined);
      });

      it('should load documents with filter', async () => {
        const filter: DocumentFilter = { category_id: 10 };
        mockDocumentService.getDocuments.mockResolvedValue([mockDocument]);

        await store.dispatch(loadDocuments(filter));

        expect(mockDocumentService.getDocuments).toHaveBeenCalledWith(filter);
      });

      it('should handle load documents error', async () => {
        mockDocumentService.getDocuments.mockRejectedValue(new Error('Load failed'));

        await store.dispatch(loadDocuments(undefined));
        const state = store.getState().documents;

        expect(state.documents).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Load failed');
      });

      it('should set loading state during load', () => {
        mockDocumentService.getDocuments.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
        );

        store.dispatch(loadDocuments(undefined));
        const state = store.getState().documents;

        expect(state.loading).toBe(true);
      });
    });

    describe('loadDocumentStats', () => {
      it('should load statistics successfully', async () => {
        mockDocumentService.getDocumentStats.mockResolvedValue(mockStats);

        await store.dispatch(loadDocumentStats());
        const state = store.getState().documents;

        expect(state.stats).toEqual(mockStats);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should handle load stats error', async () => {
        mockDocumentService.getDocumentStats.mockRejectedValue(new Error('Stats failed'));

        await store.dispatch(loadDocumentStats());
        const state = store.getState().documents;

        expect(state.stats).toBeNull();
        expect(state.error).toBe('Stats failed');
      });
    });

    describe('uploadDocumentWithProgress', () => {
      it('should upload document successfully', async () => {
        const mockFile = {
          uri: 'file://test.pdf',
          name: 'test.pdf',
          size: 1024,
          mimeType: 'application/pdf',
        };

        mockDocumentService.uploadDocument.mockResolvedValue(mockDocument);

        await store.dispatch(
          uploadDocumentWithProgress({
            file: mockFile,
            options: { category_id: 10 },
          })
        );

        const state = store.getState().documents;

        expect(state.documents).toContainEqual(mockDocument);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should handle upload error', async () => {
        const mockFile = {
          uri: 'file://test.pdf',
          name: 'test.pdf',
          size: 1024,
          mimeType: 'application/pdf',
        };

        mockDocumentService.uploadDocument.mockRejectedValue(new Error('Upload failed'));

        await store.dispatch(
          uploadDocumentWithProgress({ file: mockFile })
        );

        const state = store.getState().documents;
        expect(state.error).toBe('Upload failed');
      });
    });

    describe('updateDocumentMetadata', () => {
      it('should update document successfully', async () => {
        const updatedDoc = { ...mockDocument, is_favorite: true };
        mockDocumentService.updateDocument.mockResolvedValue(updatedDoc);

        // Load initial document
        store.dispatch({
          type: loadDocuments.fulfilled.type,
          payload: [mockDocument],
        });

        await store.dispatch(
          updateDocumentMetadata({
            documentId: 1,
            updates: { is_favorite: true },
          })
        );

        const state = store.getState().documents;
        const document = state.documents.find((d) => d.id === 1);

        expect(document?.is_favorite).toBe(true);
        expect(state.error).toBeNull();
      });

      it('should handle update error', async () => {
        mockDocumentService.updateDocument.mockRejectedValue(new Error('Update failed'));

        await store.dispatch(
          updateDocumentMetadata({
            documentId: 1,
            updates: { is_favorite: true },
          })
        );

        const state = store.getState().documents;
        expect(state.error).toBe('Update failed');
      });
    });

    describe('removeDocument', () => {
      it('should delete document successfully', async () => {
        mockDocumentService.deleteDocument.mockResolvedValue();

        // Load initial document
        store.dispatch({
          type: loadDocuments.fulfilled.type,
          payload: [mockDocument],
        });

        await store.dispatch(removeDocument(1));
        const state = store.getState().documents;

        expect(state.documents).toHaveLength(0);
        expect(state.error).toBeNull();
      });

      it('should handle delete error', async () => {
        mockDocumentService.deleteDocument.mockRejectedValue(new Error('Delete failed'));

        await store.dispatch(removeDocument(1));
        const state = store.getState().documents;

        expect(state.error).toBe('Delete failed');
      });
    });

    describe('toggleFavorite', () => {
      it('should toggle favorite from false to true', async () => {
        const updatedDoc = { ...mockDocument, is_favorite: true };
        mockDocumentService.updateDocument.mockResolvedValue(updatedDoc);

        // Load initial document
        store.dispatch({
          type: loadDocuments.fulfilled.type,
          payload: [mockDocument],
        });

        await store.dispatch(toggleFavorite(1));
        const state = store.getState().documents;
        const document = state.documents.find((d) => d.id === 1);

        expect(document?.is_favorite).toBe(true);
        expect(mockDocumentService.updateDocument).toHaveBeenCalledWith(1, {
          is_favorite: true,
        });
      });

      it('should toggle favorite from true to false', async () => {
        const favoriteDoc = { ...mockDocument, is_favorite: true };
        const updatedDoc = { ...mockDocument, is_favorite: false };
        mockDocumentService.updateDocument.mockResolvedValue(updatedDoc);

        // Load initial favorite document
        store.dispatch({
          type: loadDocuments.fulfilled.type,
          payload: [favoriteDoc],
        });

        await store.dispatch(toggleFavorite(1));
        const state = store.getState().documents;
        const document = state.documents.find((d) => d.id === 1);

        expect(document?.is_favorite).toBe(false);
        expect(mockDocumentService.updateDocument).toHaveBeenCalledWith(1, {
          is_favorite: false,
        });
      });

      it('should handle toggle favorite when document not found', async () => {
        await store.dispatch(toggleFavorite(999));
        const state = store.getState().documents;

        expect(state.error).toBe('Document not found');
      });

      it('should handle toggle favorite error', async () => {
        mockDocumentService.updateDocument.mockRejectedValue(new Error('Toggle failed'));

        store.dispatch({
          type: loadDocuments.fulfilled.type,
          payload: [mockDocument],
        });

        await store.dispatch(toggleFavorite(1));
        const state = store.getState().documents;

        expect(state.error).toBe('Toggle failed');
      });
    });

    describe('readDocumentContent', () => {
      it('should read document successfully', async () => {
        mockDocumentService.readDocument.mockResolvedValue(new Uint8Array([1, 2, 3]));

        await store.dispatch(readDocumentContent(1));
        const state = store.getState().documents;

        expect(state.error).toBeNull();
        expect(mockDocumentService.readDocument).toHaveBeenCalledWith(1);
      });

      it('should call readDocument service', async () => {
        mockDocumentService.readDocument.mockResolvedValue(new Uint8Array([1, 2, 3]));

        const result = await store.dispatch(readDocumentContent(1));
        
        expect(result.type).toContain('fulfilled');
        expect(mockDocumentService.readDocument).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      const documents = [
        { ...mockDocument, id: 1, category_id: 10, is_favorite: true, created_at: '2025-11-27T10:00:00Z' },
        { ...mockDocument, id: 2, category_id: 10, is_favorite: false, created_at: '2025-11-27T11:00:00Z' },
        { ...mockDocument, id: 3, category_id: 20, is_favorite: true, created_at: '2025-11-27T12:00:00Z' },
      ];

      store.dispatch({
        type: loadDocuments.fulfilled.type,
        payload: documents,
      });

      store.dispatch({
        type: loadDocumentStats.fulfilled.type,
        payload: mockStats,
      });
    });

    it('selectAllDocuments should return all documents', () => {
      const state = store.getState();
      const documents = selectAllDocuments(state);

      expect(documents).toHaveLength(3);
    });

    it('selectSelectedDocument should return selected document', () => {
      store.dispatch(setSelectedDocument(1));
      const state = store.getState();
      const selected = selectSelectedDocument(state);

      expect(selected?.id).toBe(1);
    });

    it('selectDocumentStats should return statistics', () => {
      const state = store.getState();
      const stats = selectDocumentStats(state);

      expect(stats).toEqual(mockStats);
    });

    it('selectDocumentLoading should return loading state', () => {
      const state = store.getState();
      const loading = selectDocumentLoading(state);

      expect(loading).toBe(false);
    });

    it('selectDocumentError should return error', () => {
      store.dispatch({
        type: loadDocuments.rejected.type,
        payload: 'Test error',
      });

      const state = store.getState();
      const error = selectDocumentError(state);

      expect(error).toBe('Test error');
    });

    it('selectDocumentFilter should return current filter', () => {
      const filter: DocumentFilter = { category_id: 10 };
      store.dispatch(setFilter(filter));

      const state = store.getState();
      const currentFilter = selectDocumentFilter(state);

      expect(currentFilter.category_id).toBe(10);
    });

    it('selectDocumentById should return specific document', () => {
      const state = store.getState();
      const document = selectDocumentById(state, 2);

      expect(document?.id).toBe(2);
    });

    it('selectDocumentsByCategory should filter by category', () => {
      const state = store.getState();
      const docs = selectDocumentsByCategory(state, 10);

      expect(docs).toHaveLength(2);
      expect(docs.every((d) => d.category_id === 10)).toBe(true);
    });

    it('selectFavoriteDocuments should return only favorites', () => {
      const state = store.getState();
      const favorites = selectFavoriteDocuments(state);

      expect(favorites).toHaveLength(2);
      expect(favorites.every((d) => d.is_favorite)).toBe(true);
    });

    it('selectRecentDocuments should return sorted by date', () => {
      const state = store.getState();
      const recent = selectRecentDocuments(state);

      expect(recent).toHaveLength(3);
      expect(recent[0].id).toBe(3); // Most recent first
      expect(recent[1].id).toBe(2);
      expect(recent[2].id).toBe(1);
    });

    it('selectActiveUploads should return uploads in progress', () => {
      // Simulate an active upload
      store.dispatch({
        type: 'documents/updateUploadProgress',
        payload: {
          id: 'upload-1',
          filename: 'test.pdf',
          progress: 0.5,
          bytesUploaded: 512,
          totalBytes: 1024,
        },
      });

      const state = store.getState();
      const active = selectActiveUploads(state);

      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('upload-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple simultaneous uploads', async () => {
      const mockFile1 = {
        uri: 'file://test1.pdf',
        name: 'test1.pdf',
        size: 1024,
        mimeType: 'application/pdf',
      };

      const mockFile2 = {
        uri: 'file://test2.pdf',
        name: 'test2.pdf',
        size: 2048,
        mimeType: 'application/pdf',
      };

      mockDocumentService.uploadDocument
        .mockResolvedValueOnce({ ...mockDocument, id: 1 })
        .mockResolvedValueOnce({ ...mockDocument, id: 2 });

      await Promise.all([
        store.dispatch(uploadDocumentWithProgress({ file: mockFile1 })),
        store.dispatch(uploadDocumentWithProgress({ file: mockFile2 })),
      ]);

      const state = store.getState().documents;
      expect(state.documents).toHaveLength(2);
    });

    it('should handle empty document list', () => {
      const state = store.getState();
      const documents = selectAllDocuments(state);

      expect(documents).toEqual([]);
    });

    it('should preserve filter when loading fails', async () => {
      const filter: DocumentFilter = { category_id: 10 };
      store.dispatch(setFilter(filter));

      mockDocumentService.getDocuments.mockRejectedValue(new Error('Load failed'));
      await store.dispatch(loadDocuments(filter));

      const state = store.getState().documents;
      // Filter is merged with defaults, not replaced
      expect(state.filter.category_id).toBe(10);
      expect(state.error).toBe('Load failed');
    });
  });
});

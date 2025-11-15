/**
 * Document Redux Slice
 * Manages document state with async operations
 * Similar structure to categorySlice.ts
 */

import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    deleteDocument,
    getDocuments,
    getDocumentStats,
    readDocument,
    updateDocument,
    uploadDocument,
} from '../../services/database/documentService';
import type {
    Document,
    DocumentFilter,
    DocumentPickerResult,
    DocumentStats,
    DocumentUpdateInput,
    DocumentUploadOptions,
    UploadProgress,
} from '../../types/document';
import type { RootState } from '../index';

// State interface
interface DocumentState {
  documents: Document[];
  selectedDocument: Document | null;
  stats: DocumentStats | null;
  uploadProgress: Record<string, UploadProgress>; // Track multiple uploads by ID
  loading: boolean;
  error: string | null;
  filter: DocumentFilter;
}

// Initial state
const initialState: DocumentState = {
  documents: [],
  selectedDocument: null,
  stats: null,
  uploadProgress: {},
  loading: false,
  error: null,
  filter: {
    sort_by: 'created_at',
    sort_order: 'DESC',
  },
};

// Async thunks

/**
 * Load documents with optional filters
 */
export const loadDocuments = createAsyncThunk(
  'documents/loadDocuments',
  async (filter: DocumentFilter | undefined, { rejectWithValue }) => {
    try {
      const documents = await getDocuments(filter);
      return documents;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load documents');
    }
  }
);

/**
 * Load document statistics
 */
export const loadDocumentStats = createAsyncThunk(
  'documents/loadStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await getDocumentStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load statistics');
    }
  }
);

/**
 * Upload a document with progress tracking
 */
export const uploadDocumentWithProgress = createAsyncThunk(
  'documents/upload',
  async (
    { file, options }: { file: DocumentPickerResult; options?: DocumentUploadOptions },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Enhanced options with progress callback
      const enhancedOptions: DocumentUploadOptions = {
        ...options,
        onProgress: (progress: UploadProgress) => {
          // Update progress in Redux state
          dispatch(updateUploadProgress(progress));
          
          // Call user's callback if provided
          options?.onProgress?.(progress);
        },
      };

      const document = await uploadDocument(file, enhancedOptions);
      return document;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload document');
    }
  }
);

/**
 * Read document content (decrypt and return)
 * NOTE: This does NOT store content in Redux state (to avoid serialization issues)
 * Use the readDocument service directly in components that need document content
 */
export const readDocumentContent = createAsyncThunk(
  'documents/read',
  async (documentId: number, { rejectWithValue }) => {
    try {
      // Read the document but don't return content to Redux
      // Component should call readDocument() directly
      await readDocument(documentId);
      return { documentId }; // Only return ID, not content
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to read document');
    }
  }
);

/**
 * Update document metadata
 */
export const updateDocumentMetadata = createAsyncThunk(
  'documents/update',
  async (
    { documentId, updates }: { documentId: number; updates: DocumentUpdateInput },
    { rejectWithValue }
  ) => {
    try {
      const document = await updateDocument(documentId, updates);
      return document;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update document');
    }
  }
);

/**
 * Delete a document
 */
export const removeDocument = createAsyncThunk(
  'documents/delete',
  async (documentId: number, { rejectWithValue }) => {
    try {
      await deleteDocument(documentId);
      return documentId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete document');
    }
  }
);

/**
 * Toggle document favorite status
 */
export const toggleFavorite = createAsyncThunk(
  'documents/toggleFavorite',
  async (documentId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
        const document = state.documents.documents.find((doc: Document) => doc.id === documentId);      if (!document) {
        throw new Error('Document not found');
      }

      const updated = await updateDocument(documentId, {
        is_favorite: !document.is_favorite,
      });

      return updated;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to toggle favorite');
    }
  }
);

// Slice
const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    // Set selected document
    setSelectedDocument: (state, action: PayloadAction<number | null>) => {
      if (action.payload === null) {
        state.selectedDocument = null;
      } else {
        const document = state.documents.find((doc) => doc.id === action.payload);
        state.selectedDocument = document || null;
      }
    },

    // Update upload progress
    updateUploadProgress: (state, action: PayloadAction<UploadProgress>) => {
      const progress = action.payload;
      state.uploadProgress[progress.uploadId] = progress;

      // Clean up completed or errored uploads after a delay (in a real app, use a saga/middleware)
      if (progress.status === 'complete' || progress.status === 'error') {
        // Keep for a bit so UI can show completion
        // In production, you'd use middleware to clean this up after a timeout
      }
    },

    // Clear upload progress for a specific upload
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    },

    // Clear all upload progress
    clearAllUploadProgress: (state) => {
      state.uploadProgress = {};
    },

    // Update filter
    setFilter: (state, action: PayloadAction<DocumentFilter>) => {
      state.filter = { ...state.filter, ...action.payload };
    },

    // Clear filter
    clearFilter: (state) => {
      state.filter = {
        sort_by: 'created_at',
        sort_order: 'DESC',
      };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load documents
    builder
      .addCase(loadDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(loadDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load stats
    builder
      .addCase(loadDocumentStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDocumentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(loadDocumentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Upload document
    builder
      .addCase(uploadDocumentWithProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocumentWithProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.unshift(action.payload); // Add to beginning of list
        
        // Update stats
        if (state.stats) {
          state.stats.totalDocuments += 1;
          state.stats.totalSize += action.payload.file_size;
        }
      })
      .addCase(uploadDocumentWithProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update document
    builder
      .addCase(updateDocumentMetadata.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocumentMetadata.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex((doc) => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.selectedDocument?.id === action.payload.id) {
          state.selectedDocument = action.payload;
        }
      })
      .addCase(updateDocumentMetadata.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete document
    builder
      .addCase(removeDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeDocument.fulfilled, (state, action) => {
        state.loading = false;
        const documentId = action.payload;
        const document = state.documents.find((doc) => doc.id === documentId);
        
        state.documents = state.documents.filter((doc) => doc.id !== documentId);
        
        if (state.selectedDocument?.id === documentId) {
          state.selectedDocument = null;
        }

        // Update stats
        if (state.stats && document) {
          state.stats.totalDocuments -= 1;
          state.stats.totalSize -= document.file_size;
        }
      })
      .addCase(removeDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle favorite
    builder
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const index = state.documents.findIndex((doc) => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.selectedDocument?.id === action.payload.id) {
          state.selectedDocument = action.payload;
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  setSelectedDocument,
  updateUploadProgress,
  clearUploadProgress,
  clearAllUploadProgress,
  setFilter,
  clearFilter,
  clearError,
} = documentSlice.actions;

// Selectors
export const selectAllDocuments = (state: RootState) => state.documents.documents;
export const selectSelectedDocument = (state: RootState) => state.documents.selectedDocument;
export const selectDocumentStats = (state: RootState) => state.documents.stats;
export const selectUploadProgress = (state: RootState) => state.documents.uploadProgress;
export const selectDocumentLoading = (state: RootState) => state.documents.loading;
export const selectDocumentError = (state: RootState) => state.documents.error;
export const selectDocumentFilter = (state: RootState) => state.documents.filter;

// Derived selectors with memoization
export const selectDocumentById = createSelector(
  [selectAllDocuments, (_state: RootState, documentId: number) => documentId],
  (documents, documentId) => documents.find((doc: Document) => doc.id === documentId)
);

export const selectDocumentsByCategory = createSelector(
  [selectAllDocuments, (_state: RootState, categoryId: number | null) => categoryId],
  (documents, categoryId) => documents.filter((doc: Document) => doc.category_id === categoryId)
);

export const selectFavoriteDocuments = createSelector(
  [selectAllDocuments],
  (documents) => documents.filter((doc: Document) => doc.is_favorite)
);

export const selectRecentDocuments = createSelector(
  [selectAllDocuments, (_state: RootState, limit: number = 10) => limit],
  (documents, limit) =>
    documents
      .slice()
      .sort((a: Document, b: Document) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
);

export const selectActiveUploads = createSelector(
  [selectUploadProgress],
  (uploadProgress) =>
    Object.values(uploadProgress).filter(
      (progress: UploadProgress) => progress.status !== 'complete' && progress.status !== 'error'
    )
);

// Reducer export
export default documentSlice.reducer;

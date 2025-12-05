/**
 * Tag Redux Slice
 * Manages tag state with async operations
 */

import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    addTagToDocument,
    createTag,
    deleteTag,
    getDocumentTags,
    getTagStats,
    getTagsWithCount,
    removeTagFromDocument,
    searchTags,
    setDocumentTags,
    updateTag
} from '../../services/database/tagService';
import type { Tag, TagCreateInput } from '../../types/document';
import type { RootState } from '../index';

// State interface
interface TagState {
  tags: (Tag & { document_count?: number })[];
  selectedTags: number[]; // For filtering
  documentTags: Record<number, Tag[]>; // Cache of tags per document
  stats: {
    totalTags: number;
    totalTaggedDocuments: number;
    avgTagsPerDocument: number;
  } | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

// Initial state
const initialState: TagState = {
  tags: [],
  selectedTags: [],
  documentTags: {},
  stats: null,
  loading: false,
  error: null,
  searchQuery: '',
};

// Async thunks

/**
 * Load all tags with usage count
 */
export const loadTags = createAsyncThunk('tags/loadTags', async (_, { rejectWithValue }) => {
  try {
    const tags = await getTagsWithCount();
    return tags;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load tags');
  }
});

/**
 * Load tag statistics
 */
export const loadTagStats = createAsyncThunk(
  'tags/loadTagStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await getTagStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load tag statistics'
      );
    }
  }
);

/**
 * Create a new tag
 */
export const createNewTag = createAsyncThunk(
  'tags/createNewTag',
  async (input: TagCreateInput, { rejectWithValue }) => {
    try {
      const tag = await createTag(input);
      return tag;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create tag');
    }
  }
);

/**
 * Update an existing tag
 */
export const updateExistingTag = createAsyncThunk(
  'tags/updateExistingTag',
  async (
    { tagId, updates }: { tagId: number; updates: { name?: string; color?: string } },
    { rejectWithValue }
  ) => {
    try {
      const tag = await updateTag(tagId, updates);
      return tag;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update tag');
    }
  }
);

/**
 * Delete a tag
 */
export const removeTag = createAsyncThunk(
  'tags/removeTag',
  async (tagId: number, { rejectWithValue }) => {
    try {
      await deleteTag(tagId);
      return tagId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete tag');
    }
  }
);

/**
 * Load tags for a specific document
 */
export const loadDocumentTags = createAsyncThunk(
  'tags/loadDocumentTags',
  async (documentId: number, { rejectWithValue }) => {
    try {
      const tags = await getDocumentTags(documentId);
      return { documentId, tags };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load document tags'
      );
    }
  }
);

/**
 * Add a tag to a document
 */
export const addTagToDoc = createAsyncThunk(
  'tags/addTagToDoc',
  async ({ documentId, tagId }: { documentId: number; tagId: number }, { rejectWithValue }) => {
    try {
      await addTagToDocument(documentId, tagId);
      return { documentId, tagId };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to add tag to document'
      );
    }
  }
);

/**
 * Remove a tag from a document
 */
export const removeTagFromDoc = createAsyncThunk(
  'tags/removeTagFromDoc',
  async ({ documentId, tagId }: { documentId: number; tagId: number }, { rejectWithValue }) => {
    try {
      await removeTagFromDocument(documentId, tagId);
      return { documentId, tagId };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to remove tag from document'
      );
    }
  }
);

/**
 * Set all tags for a document (replace existing)
 */
export const setTagsForDocument = createAsyncThunk(
  'tags/setTagsForDocument',
  async ({ documentId, tagIds }: { documentId: number; tagIds: number[] }, { rejectWithValue }) => {
    try {
      await setDocumentTags(documentId, tagIds);
      // Reload document tags
      const tags = await getDocumentTags(documentId);
      return { documentId, tags };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to set document tags'
      );
    }
  }
);

/**
 * Search tags by name
 */
export const searchTagsByName = createAsyncThunk(
  'tags/searchTagsByName',
  async (query: string, { rejectWithValue }) => {
    try {
      const tags = await searchTags(query);
      return { query, tags };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search tags');
    }
  }
);

// Slice
const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    // Set selected tags for filtering
    setSelectedTags: (state, action: PayloadAction<number[]>) => {
      state.selectedTags = action.payload;
    },

    // Toggle tag selection
    toggleTagSelection: (state, action: PayloadAction<number>) => {
      const tagId = action.payload;
      const index = state.selectedTags.indexOf(tagId);
      if (index >= 0) {
        state.selectedTags.splice(index, 1);
      } else {
        state.selectedTags.push(tagId);
      }
    },

    // Clear selected tags
    clearSelectedTags: (state) => {
      state.selectedTags = [];
    },

    // Clear error
    clearTagError: (state) => {
      state.error = null;
    },

    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Clear document tags cache
    clearDocumentTagsCache: (state) => {
      state.documentTags = {};
    },

    // Clear document tags for specific document
    clearDocumentTags: (state, action: PayloadAction<number>) => {
      delete state.documentTags[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Load tags
    builder.addCase(loadTags.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadTags.fulfilled, (state, action: PayloadAction<(Tag & { document_count?: number })[]>) => {
      state.loading = false;
      state.tags = action.payload;
    });
    builder.addCase(loadTags.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Load tag stats
    builder.addCase(loadTagStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Create tag
    builder.addCase(createNewTag.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createNewTag.fulfilled, (state, action: PayloadAction<Tag>) => {
      state.loading = false;
      state.tags.push({ ...action.payload, document_count: 0 });
    });
    builder.addCase(createNewTag.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update tag
    builder.addCase(updateExistingTag.fulfilled, (state, action: PayloadAction<Tag>) => {
      const index = state.tags.findIndex((tag: Tag) => tag.id === action.payload.id);
      if (index >= 0) {
        const docCount = state.tags[index].document_count;
        state.tags[index] = { ...action.payload, document_count: docCount };
      }
    });
    builder.addCase(updateExistingTag.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Delete tag
    builder.addCase(removeTag.fulfilled, (state, action: PayloadAction<number>) => {
      state.tags = state.tags.filter((tag: Tag) => tag.id !== action.payload);
      // Remove from selected tags if present
      state.selectedTags = state.selectedTags.filter((id: number) => id !== action.payload);
    });
    builder.addCase(removeTag.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Load document tags
    builder.addCase(
      loadDocumentTags.fulfilled,
      (state, action: PayloadAction<{ documentId: number; tags: Tag[] }>) => {
        state.documentTags[action.payload.documentId] = action.payload.tags;
      }
    );

    // Add tag to document
    builder.addCase(
      addTagToDoc.fulfilled,
      (state, action: PayloadAction<{ documentId: number; tagId: number }>) => {
        const { documentId, tagId } = action.payload;
        const tag = state.tags.find((t: Tag) => t.id === tagId);
        if (tag) {
          if (!state.documentTags[documentId]) {
            state.documentTags[documentId] = [];
          }
          // Add tag if not already present
          if (!state.documentTags[documentId].find((t: Tag) => t.id === tagId)) {
            state.documentTags[documentId].push(tag);
          }
          // Increment usage count
          const tagIndex = state.tags.findIndex((t: Tag) => t.id === tagId);
          if (tagIndex >= 0 && state.tags[tagIndex].document_count !== undefined) {
            state.tags[tagIndex].document_count = (state.tags[tagIndex].document_count || 0) + 1;
          }
        }
      }
    );

    // Remove tag from document
    builder.addCase(
      removeTagFromDoc.fulfilled,
      (state, action: PayloadAction<{ documentId: number; tagId: number }>) => {
        const { documentId, tagId } = action.payload;
        if (state.documentTags[documentId]) {
          state.documentTags[documentId] = state.documentTags[documentId].filter(
            (tag: Tag) => tag.id !== tagId
          );
        }
        // Decrement usage count
        const tagIndex = state.tags.findIndex((t: Tag) => t.id === tagId);
        if (tagIndex >= 0 && state.tags[tagIndex].document_count !== undefined) {
          state.tags[tagIndex].document_count = Math.max(0, (state.tags[tagIndex].document_count || 0) - 1);
        }
      }
    );

    // Set document tags
    builder.addCase(
      setTagsForDocument.fulfilled,
      (state, action: PayloadAction<{ documentId: number; tags: Tag[] }>) => {
        state.documentTags[action.payload.documentId] = action.payload.tags;
      }
    );

    // Search tags
    builder.addCase(
      searchTagsByName.fulfilled,
      (state, action: PayloadAction<{ query: string; tags: Tag[] }>) => {
        state.searchQuery = action.payload.query;
        if (action.payload.query.trim() === '') {
          // If empty query, reload all tags (this will be handled by loadTags)
        } else {
          // Update tags with search results
          state.tags = action.payload.tags.map((tag: Tag) => ({ ...tag, document_count: 0 }));
        }
      }
    );
  },
});

// Actions
export const {
  setSelectedTags,
  toggleTagSelection,
  clearSelectedTags,
  clearTagError,
  setSearchQuery,
  clearDocumentTagsCache,
  clearDocumentTags,
} = tagSlice.actions;

// Selectors
export const selectAllTags = (state: RootState) => state.tags.tags;
export const selectSelectedTags = (state: RootState) => state.tags.selectedTags;
export const selectTagStats = (state: RootState) => state.tags.stats;
export const selectTagLoading = (state: RootState) => state.tags.loading;
export const selectTagError = (state: RootState) => state.tags.error;
export const selectSearchQuery = (state: RootState) => state.tags.searchQuery;
export const selectDocumentTags = (documentId: number) => (state: RootState) =>
  state.tags.documentTags[documentId] || [];

// Get selected tag objects
export const selectSelectedTagObjects = createSelector(
  [selectAllTags, selectSelectedTags],
  (tags, selectedIds) => tags.filter((tag: Tag) => selectedIds.includes(tag.id))
);

// Get tags sorted by name
export const selectTagsSortedByName = createSelector([selectAllTags], (tags) =>
  [...tags].sort((a: Tag, b: Tag) => a.name.localeCompare(b.name))
);

// Get tags sorted by usage
export const selectTagsSortedByUsage = createSelector([selectAllTags], (tags) =>
  [...tags].sort((a, b) => (b.document_count || 0) - (a.document_count || 0))
);

// Get popular tags (most used)
export const selectPopularTags = createSelector([selectAllTags], (tags) =>
  [...tags]
    .filter((tag) => (tag.document_count || 0) > 0)
    .sort((a, b) => (b.document_count || 0) - (a.document_count || 0))
    .slice(0, 10)
);

// Get unused tags
export const selectUnusedTags = createSelector([selectAllTags], (tags) =>
  tags.filter((tag) => (tag.document_count || 0) === 0)
);

// Reducer
export default tagSlice.reducer;

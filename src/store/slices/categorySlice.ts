/**
 * Category Redux Slice
 * Manages category state for document organization
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Category, CategoryTreeNode } from '../../types/category';
import * as categoryService from '../../services/database/categoryService';

// Input types for category operations
interface CreateCategoryInput {
  user_id: number;
  name: string;
  parent_id?: number | null;
  icon?: string;
  color?: string;
  description?: string;
}

interface UpdateCategoryInput {
  name?: string;
  parent_id?: number | null;
  icon?: string;
  color?: string;
  description?: string;
}

interface CategoryState {
  categories: Category[];
  categoryTree: CategoryTreeNode[];
  selectedCategoryId: number | null;
  loading: boolean;
  error: string | null;
  lastSync: number | null;
}

const initialState: CategoryState = {
  categories: [],
  categoryTree: [],
  selectedCategoryId: null,
  loading: false,
  error: null,
  lastSync: null,
};

// Async Thunks

/**
 * Load all categories for the current user
 */
export const loadCategories = createAsyncThunk(
  'category/loadCategories',
  async (userId: number, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getCategories(userId);
      const tree = await categoryService.getCategoryTree(userId);
      return { categories, tree };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Create a new category
 */
export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (input: CreateCategoryInput, { rejectWithValue }) => {
    try {
      const category = await categoryService.createCategory(input);
      return category;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Update an existing category
 */
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, updates }: { id: number; updates: UpdateCategoryInput }, { rejectWithValue }) => {
    try {
      await categoryService.updateCategory(id, updates);
      const category = await categoryService.getCategoryById(id);
      return category;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Delete a category
 */
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Move category to a different parent
 */
export const moveCategory = createAsyncThunk(
  'category/moveCategory',
  async ({ id, newParentId }: { id: number; newParentId: number | null }, { rejectWithValue }) => {
    try {
      await categoryService.updateCategory(id, { parent_id: newParentId });
      const category = await categoryService.getCategoryById(id);
      return category;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Slice

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<number | null>) => {
      state.selectedCategoryId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCategories: (state) => {
      state.categories = [];
      state.categoryTree = [];
      state.selectedCategoryId = null;
      state.lastSync = null;
    },
  },
  extraReducers: (builder) => {
    // Load Categories
    builder.addCase(loadCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload.categories;
      state.categoryTree = action.payload.tree;
      state.lastSync = Date.now();
    });
    builder.addCase(loadCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Category
    builder.addCase(createCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.categories.push(action.payload);
      }
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Category
    builder.addCase(updateCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        const index = state.categories.findIndex((c) => c.id === action.payload!.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      }
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Category
    builder.addCase(deleteCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = state.categories.filter((c) => c.id !== action.payload);
      if (state.selectedCategoryId === action.payload) {
        state.selectedCategoryId = null;
      }
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Move Category
    builder.addCase(moveCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(moveCategory.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        const index = state.categories.findIndex((c) => c.id === action.payload!.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      }
    });
    builder.addCase(moveCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Actions
export const { setSelectedCategory, clearError, clearCategories } = categorySlice.actions;

// Selectors
export const selectAllCategories = (state: RootState) => state.category.categories;
export const selectCategoryTree = (state: RootState) => state.category.categoryTree;
export const selectSelectedCategoryId = (state: RootState) => state.category.selectedCategoryId;
export const selectSelectedCategory = (state: RootState) => {
  const id = state.category.selectedCategoryId;
  return id ? state.category.categories.find((c) => c.id === id) : null;
};
export const selectCategoryById = (state: RootState, id: number) =>
  state.category.categories.find((c) => c.id === id);
export const selectCategoriesByParent = (state: RootState, parentId: number | null) =>
  state.category.categories.filter((c) => c.parent_id === parentId);
export const selectCategoryLoading = (state: RootState) => state.category.loading;
export const selectCategoryError = (state: RootState) => state.category.error;
export const selectLastSync = (state: RootState) => state.category.lastSync;

// Reducer
export default categorySlice.reducer;

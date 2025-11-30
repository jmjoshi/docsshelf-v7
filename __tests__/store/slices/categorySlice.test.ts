/**
 * Category Slice Tests
 * Tests Redux state management for categories
 * Part of Phase 1: Redux Slice Testing
 */

import { configureStore } from '@reduxjs/toolkit';
import * as categoryService from '../../../src/services/database/categoryService';
import categoryReducer, {
    clearCategories,
    clearError,
    createCategory,
    deleteCategory,
    loadCategories,
    moveCategory,
    selectAllCategories,
    selectCategoriesByParent,
    selectCategoryById,
    selectCategoryError,
    selectCategoryLoading,
    selectCategoryTree,
    selectLastSync,
    selectSelectedCategory,
    selectSelectedCategoryId,
    setSelectedCategory,
    updateCategory,
} from '../../../src/store/slices/categorySlice';
import type { Category, CategoryTreeNode } from '../../../src/types/category';

// Mock the category service
jest.mock('../../../src/services/database/categoryService');

const mockCategoryService = categoryService as jest.Mocked<typeof categoryService>;

describe('Category Slice', () => {
  let store: ReturnType<typeof configureStore>;

  // Sample test data
  const mockCategory: Category = {
    id: 1,
    user_id: 1,
    name: 'Documents',
    parent_id: null,
    icon: 'folder',
    color: '#3b82f6',
    description: 'General documents',
    created_at: '2025-11-27T00:00:00Z',
    updated_at: '2025-11-27T00:00:00Z',
  };

  const mockChildCategory: Category = {
    id: 2,
    user_id: 1,
    name: 'Work',
    parent_id: 1,
    icon: 'briefcase',
    color: '#10b981',
    description: 'Work documents',
    created_at: '2025-11-27T00:00:00Z',
    updated_at: '2025-11-27T00:00:00Z',
  };

  const mockCategoryTree: CategoryTreeNode[] = [
    {
      ...mockCategory,
      children: [{ ...mockChildCategory, children: [] }],
    },
  ];

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        category: categoryReducer,
      },
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().category;

      expect(state.categories).toEqual([]);
      expect(state.categoryTree).toEqual([]);
      expect(state.selectedCategoryId).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastSync).toBeNull();
    });
  });

  describe('Sync Actions', () => {
    describe('setSelectedCategory', () => {
      it('should set selected category ID', () => {
        store.dispatch(setSelectedCategory(1));
        const state = store.getState().category;

        expect(state.selectedCategoryId).toBe(1);
      });

      it('should clear selected category when null', () => {
        store.dispatch(setSelectedCategory(1));
        store.dispatch(setSelectedCategory(null));
        const state = store.getState().category;

        expect(state.selectedCategoryId).toBeNull();
      });
    });

    describe('clearError', () => {
      it('should clear error message', () => {
        // Set an error first
        store.dispatch({
          type: loadCategories.rejected.type,
          payload: 'Test error',
        });

        expect(store.getState().category.error).toBe('Test error');

        store.dispatch(clearError());
        expect(store.getState().category.error).toBeNull();
      });
    });

    describe('clearCategories', () => {
      it('should reset all category state', () => {
        // Load some data first
        store.dispatch({
          type: loadCategories.fulfilled.type,
          payload: {
            categories: [mockCategory],
            tree: mockCategoryTree,
          },
        });
        store.dispatch(setSelectedCategory(1));

        // Clear everything
        store.dispatch(clearCategories());
        const state = store.getState().category;

        expect(state.categories).toEqual([]);
        expect(state.categoryTree).toEqual([]);
        expect(state.selectedCategoryId).toBeNull();
        expect(state.lastSync).toBeNull();
      });
    });
  });

  describe('Async Thunks', () => {
    describe('loadCategories', () => {
      it('should load categories successfully', async () => {
        mockCategoryService.getCategories.mockResolvedValue([mockCategory, mockChildCategory]);
        mockCategoryService.getCategoryTree.mockResolvedValue(mockCategoryTree);

        await store.dispatch(loadCategories(1));
        const state = store.getState().category;

        expect(state.categories).toEqual([mockCategory, mockChildCategory]);
        expect(state.categoryTree).toEqual(mockCategoryTree);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.lastSync).toBeTruthy();
      });

      it('should handle load error', async () => {
        mockCategoryService.getCategories.mockRejectedValue(new Error('Load failed'));

        await store.dispatch(loadCategories(1));
        const state = store.getState().category;

        expect(state.categories).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Load failed');
      });

      it('should set loading state during load', () => {
        mockCategoryService.getCategories.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
        );

        store.dispatch(loadCategories(1));
        const state = store.getState().category;

        expect(state.loading).toBe(true);
      });
    });

    describe('createCategory', () => {
      it('should create category successfully', async () => {
        const newCategory: Category = { ...mockCategory, id: 3, name: 'New Category' };
        mockCategoryService.createCategory.mockResolvedValue(newCategory);

        await store.dispatch(
          createCategory({
            user_id: 1,
            name: 'New Category',
            icon: 'folder',
            color: '#3b82f6',
          })
        );

        const state = store.getState().category;

        expect(state.categories).toContainEqual(newCategory);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should handle create error', async () => {
        mockCategoryService.createCategory.mockRejectedValue(new Error('Create failed'));

        await store.dispatch(
          createCategory({
            user_id: 1,
            name: 'New Category',
          })
        );

        const state = store.getState().category;
        expect(state.error).toBe('Create failed');
      });
    });

    describe('updateCategory', () => {
      it('should update category successfully', async () => {
        const updatedCategory: Category = { ...mockCategory, name: 'Updated Name' };
        mockCategoryService.updateCategory.mockResolvedValue();
        mockCategoryService.getCategoryById.mockResolvedValue(updatedCategory);

        // Load initial category
        store.dispatch({
          type: loadCategories.fulfilled.type,
          payload: {
            categories: [mockCategory],
            tree: mockCategoryTree,
          },
        });

        await store.dispatch(
          updateCategory({
            id: 1,
            updates: { name: 'Updated Name' },
          })
        );

        const state = store.getState().category;
        const category = state.categories.find((c) => c.id === 1);

        expect(category?.name).toBe('Updated Name');
        expect(state.error).toBeNull();
      });

      it('should handle update error', async () => {
        mockCategoryService.updateCategory.mockRejectedValue(new Error('Update failed'));

        await store.dispatch(
          updateCategory({
            id: 1,
            updates: { name: 'Updated Name' },
          })
        );

        const state = store.getState().category;
        expect(state.error).toBe('Update failed');
      });
    });

    describe('deleteCategory', () => {
      it('should delete category successfully', async () => {
        mockCategoryService.deleteCategory.mockResolvedValue();

        // Load initial categories
        store.dispatch({
          type: loadCategories.fulfilled.type,
          payload: {
            categories: [mockCategory, mockChildCategory],
            tree: mockCategoryTree,
          },
        });

        await store.dispatch(deleteCategory(1));
        const state = store.getState().category;

        expect(state.categories).not.toContainEqual(mockCategory);
        expect(state.error).toBeNull();
      });

      it('should handle delete error', async () => {
        mockCategoryService.deleteCategory.mockRejectedValue(new Error('Delete failed'));

        await store.dispatch(deleteCategory(1));
        const state = store.getState().category;

        expect(state.error).toBe('Delete failed');
      });

      it('should clear selected category if deleted', async () => {
        mockCategoryService.deleteCategory.mockResolvedValue();

        store.dispatch({
          type: loadCategories.fulfilled.type,
          payload: {
            categories: [mockCategory],
            tree: mockCategoryTree,
          },
        });
        store.dispatch(setSelectedCategory(1));

        await store.dispatch(deleteCategory(1));
        const state = store.getState().category;

        expect(state.selectedCategoryId).toBeNull();
      });
    });

    describe('moveCategory', () => {
      it('should move category to new parent', async () => {
        const movedCategory: Category = { ...mockChildCategory, parent_id: 10 };
        mockCategoryService.updateCategory.mockResolvedValue();
        mockCategoryService.getCategoryById.mockResolvedValue(movedCategory);

        // Load initial categories
        store.dispatch({
          type: loadCategories.fulfilled.type,
          payload: {
            categories: [mockCategory, mockChildCategory],
            tree: mockCategoryTree,
          },
        });

        await store.dispatch(
          moveCategory({
            id: 2,
            newParentId: 10,
          })
        );

        const state = store.getState().category;
        const category = state.categories.find((c) => c.id === 2);

        expect(category?.parent_id).toBe(10);
        expect(state.error).toBeNull();
      });

      it('should move category to root (null parent)', async () => {
        const movedCategory: Category = { ...mockChildCategory, parent_id: null };
        mockCategoryService.updateCategory.mockResolvedValue();
        mockCategoryService.getCategoryById.mockResolvedValue(movedCategory);

        store.dispatch({
          type: loadCategories.fulfilled.type,
          payload: {
            categories: [mockChildCategory],
            tree: mockCategoryTree,
          },
        });

        await store.dispatch(
          moveCategory({
            id: 2,
            newParentId: null,
          })
        );

        const state = store.getState().category;
        const category = state.categories.find((c) => c.id === 2);

        expect(category?.parent_id).toBeNull();
      });

      it('should handle move error', async () => {
        mockCategoryService.updateCategory.mockRejectedValue(new Error('Move failed'));

        await store.dispatch(
          moveCategory({
            id: 2,
            newParentId: 10,
          })
        );

        const state = store.getState().category;
        expect(state.error).toBe('Move failed');
      });
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      store.dispatch({
        type: loadCategories.fulfilled.type,
        payload: {
          categories: [mockCategory, mockChildCategory],
          tree: mockCategoryTree,
        },
      });
    });

    it('selectAllCategories should return all categories', () => {
      const state = store.getState();
      const categories = selectAllCategories(state);

      expect(categories).toHaveLength(2);
    });

    it('selectCategoryTree should return category tree', () => {
      const state = store.getState();
      const tree = selectCategoryTree(state);

      expect(tree).toEqual(mockCategoryTree);
    });

    it('selectSelectedCategoryId should return selected ID', () => {
      store.dispatch(setSelectedCategory(1));
      const state = store.getState();
      const id = selectSelectedCategoryId(state);

      expect(id).toBe(1);
    });

    it('selectSelectedCategory should return selected category object', () => {
      store.dispatch(setSelectedCategory(1));
      const state = store.getState();
      const category = selectSelectedCategory(state);

      expect(category).toEqual(mockCategory);
    });

    it('selectSelectedCategory should return null when no selection', () => {
      const state = store.getState();
      const category = selectSelectedCategory(state);

      expect(category).toBeNull();
    });

    it('selectCategoryById should return specific category', () => {
      const state = store.getState();
      const category = selectCategoryById(state, 2);

      expect(category).toEqual(mockChildCategory);
    });

    it('selectCategoryById should return undefined for non-existent ID', () => {
      const state = store.getState();
      const category = selectCategoryById(state, 999);

      expect(category).toBeUndefined();
    });

    it('selectCategoriesByParent should filter by parent ID', () => {
      const state = store.getState();
      const children = selectCategoriesByParent(state, 1);

      expect(children).toHaveLength(1);
      expect(children[0].id).toBe(2);
    });

    it('selectCategoriesByParent should return root categories for null', () => {
      const state = store.getState();
      const roots = selectCategoriesByParent(state, null);

      expect(roots).toHaveLength(1);
      expect(roots[0].id).toBe(1);
    });

    it('selectCategoryLoading should return loading state', () => {
      const state = store.getState();
      const loading = selectCategoryLoading(state);

      expect(loading).toBe(false);
    });

    it('selectCategoryError should return error', () => {
      store.dispatch({
        type: loadCategories.rejected.type,
        payload: 'Test error',
      });

      const state = store.getState();
      const error = selectCategoryError(state);

      expect(error).toBe('Test error');
    });

    it('selectLastSync should return last sync timestamp', () => {
      const state = store.getState();
      const lastSync = selectLastSync(state);

      expect(lastSync).toBeTruthy();
      expect(typeof lastSync).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple simultaneous creates', async () => {
      const cat1: Category = { ...mockCategory, id: 10, name: 'Cat 1' };
      const cat2: Category = { ...mockCategory, id: 11, name: 'Cat 2' };

      mockCategoryService.createCategory
        .mockResolvedValueOnce(cat1)
        .mockResolvedValueOnce(cat2);

      await Promise.all([
        store.dispatch(createCategory({ user_id: 1, name: 'Cat 1' })),
        store.dispatch(createCategory({ user_id: 1, name: 'Cat 2' })),
      ]);

      const state = store.getState().category;
      expect(state.categories).toHaveLength(2);
    });

    it('should handle empty category list', () => {
      const state = store.getState();
      const categories = selectAllCategories(state);

      expect(categories).toEqual([]);
    });

    it('should preserve selection when categories reload', async () => {
      store.dispatch({
        type: loadCategories.fulfilled.type,
        payload: {
          categories: [mockCategory],
          tree: mockCategoryTree,
        },
      });

      store.dispatch(setSelectedCategory(1));

      mockCategoryService.getCategories.mockResolvedValue([mockCategory, mockChildCategory]);
      mockCategoryService.getCategoryTree.mockResolvedValue(mockCategoryTree);

      await store.dispatch(loadCategories(1));

      const state = store.getState().category;
      expect(state.selectedCategoryId).toBe(1);
    });

    it('should handle creating category with minimal data', async () => {
      const minimalCategory: Category = {
        ...mockCategory,
        icon: undefined,
        color: undefined,
        description: undefined,
      };

      mockCategoryService.createCategory.mockResolvedValue(minimalCategory);

      await store.dispatch(
        createCategory({
          user_id: 1,
          name: 'Minimal',
        })
      );

      const state = store.getState().category;
      expect(state.categories).toHaveLength(1);
    });
  });
});

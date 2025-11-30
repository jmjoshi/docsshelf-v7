/**
 * Redux Store Configuration
 * Central state management for the application
 */

import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './slices/categorySlice';

import documentReducer from './slices/documentSlice';
import tagReducer from './slices/tagSlice';

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    documents: documentReducer,
    tags: tagReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: [
          'category/loadCategories/fulfilled',
          'documents/upload/fulfilled',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.arg.file'],
        // Ignore these paths in the state
        ignoredPaths: ['category.lastSync', 'documents.uploadProgress'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

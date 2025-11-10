/**
 * Categories Tab Screen
 * Entry point for category management
 */

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../src/store';
import CategoryManagementScreen from '../../src/screens/CategoryManagementScreen';

export default function CategoriesScreen() {
  return (
    <Provider store={store}>
      <CategoryManagementScreen />
    </Provider>
  );
}

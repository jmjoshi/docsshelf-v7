/**
 * Categories Tab Screen
 * Entry point for category management
 */

import React from 'react';
import { Provider } from 'react-redux';
import CategoryManagementScreen from '../../src/screens/CategoryManagementScreen';
import { store } from '../../src/store';

export default function CategoriesScreen() {
  return (
    <Provider store={store}>
      <CategoryManagementScreen />
    </Provider>
  );
}

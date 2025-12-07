/**
 * Explorer Tab Screen
 * Entry point for the file explorer interface
 */

import React from 'react';
import { Provider } from 'react-redux';
import FileExplorerScreen from '../../src/screens/Explorer/FileExplorerScreen';
import { store } from '../../src/store';

export default function ExplorerTab() {
  return (
    <Provider store={store}>
      <FileExplorerScreen />
    </Provider>
  );
}

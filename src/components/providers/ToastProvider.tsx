/**
 * Toast Provider Component
 * Wraps the app with toast notification functionality
 */

import React from 'react';
import { ToastProvider as RNToastProvider } from 'react-native-toast-notifications';
import { setToastInstance } from '../../utils/ui/toastService';

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const handleRef = (ref: any) => {
    if (ref) {
      setToastInstance(ref);
    }
  };

  return (
    <RNToastProvider
      // @ts-ignore - ref type mismatch in library
      ref={handleRef}
      placement="top"
      duration={3000}
      animationType="slide-in"
      offsetTop={50}
      swipeEnabled={true}
      successColor="#10b981" // green-500
      dangerColor="#ef4444"  // red-500
      warningColor="#f59e0b" // amber-500
      normalColor="#3b82f6"  // blue-500
      textStyle={{
        fontSize: 14,
        fontWeight: '500',
      }}
      style={{
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {children}
    </RNToastProvider>
  );
};

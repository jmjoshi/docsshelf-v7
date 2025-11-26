/**
 * Toast Component
 * Wrapper for react-native-toast-notifications with custom styling
 */

import React from 'react';
import { ToastProvider } from 'react-native-toast-notifications';

interface ToastProps {
  children: React.ReactNode;
}

export const Toast: React.FC<ToastProps> = ({ children }) => {
  return (
    <ToastProvider
      placement="top"
      duration={3000}
      animationType="slide-in"
      animationDuration={250}
      successColor="#4caf50"
      dangerColor="#f44336"
      warningColor="#ff9800"
      normalColor="#2196F3"
      textStyle={{ fontSize: 14, fontWeight: '500' }}
      offset={50}
      offsetTop={30}
      offsetBottom={40}
      swipeEnabled={true}
    >
      {children}
    </ToastProvider>
  );
};

export default Toast;

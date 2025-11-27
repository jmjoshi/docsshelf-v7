/**
 * Toast Component
 * Wrapper for react-native-toast-notifications with custom styling
 */

import React, { useEffect, useRef } from 'react';
import { ToastProvider } from 'react-native-toast-notifications';
import { setToastInstance } from '../../utils/ui/toastService';

interface ToastProps {
  children: React.ReactNode;
}

export const Toast: React.FC<ToastProps> = ({ children }) => {
  const toastRef = useRef<any>(null);

  useEffect(() => {
    if (toastRef.current) {
      setToastInstance(toastRef.current);
    }
  }, []);

  return (
    <ToastProvider
      // @ts-ignore - ref is not in type definition but works
      ref={toastRef}
      placement="top"
      duration={3000}
      animationType="slide-in"
      animationDuration={250}
      successColor="#10b981" // green-500 for consistency
      dangerColor="#ef4444"  // red-500 for consistency
      warningColor="#f59e0b" // amber-500 for consistency
      normalColor="#3b82f6"  // blue-500 for consistency
      textStyle={{ fontSize: 14, fontWeight: '500' }}
      offset={50}
      offsetTop={30}
      offsetBottom={40}
      swipeEnabled={true}
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
    </ToastProvider>
  );
};

export default Toast;

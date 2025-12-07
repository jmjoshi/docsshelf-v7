/**
 * Persistent Bottom Navigation
 * Shows tab bar across all screens in the app
 */

import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TabItem {
  name: string;
  icon: string;
  route: string;
  label: string;
}

const tabs: TabItem[] = [
  { name: 'home', icon: 'house.fill', route: '/(tabs)', label: 'Home' },
  { name: 'categories', icon: 'folder.fill', route: '/(tabs)/categories', label: 'Categories' },
  { name: 'documents', icon: 'doc.fill', route: '/(tabs)/documents', label: 'Documents' },
  { name: 'explorer', icon: 'filemenu.and.selection', route: '/(tabs)/explorer', label: 'Explorer' },
  { name: 'settings', icon: 'gear', route: '/(tabs)/explore', label: 'Settings' },
];

export function PersistentBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  
  // Hide on auth screens
  if (pathname.includes('/(auth)') || pathname.includes('/login') || pathname.includes('/register')) {
    return null;
  }
  
  // Hide on full-screen modals
  if (pathname.includes('/scan')) {
    return null;
  }

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  const isActive = (route: string) => {
    if (route === '/(tabs)' && pathname === '/') return true;
    if (route === '/(tabs)' && pathname === '/(tabs)') return true;
    return pathname.startsWith(route) || pathname === route;
  };

  const backgroundColor = Colors[colorScheme ?? 'light'].background;
  const borderColor = colorScheme === 'dark' ? '#333' : '#e0e0e0';

  return (
    <View style={[
      styles.container, 
      { 
        paddingBottom: insets.bottom + 8, 
        height: 60 + insets.bottom,
        backgroundColor,
        borderTopColor: borderColor,
      }
    ]}>
      {tabs.map((tab) => {
        const active = isActive(tab.route);
        const color = active 
          ? Colors[colorScheme ?? 'light'].tint 
          : Colors[colorScheme ?? 'light'].tabIconDefault;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handlePress(tab.route)}
            activeOpacity={0.7}
          >
            <IconSymbol name={tab.icon} size={28} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});

/**
 * Persistent Bottom Navigation
 * Shows tab bar across all screens in the app
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  name: string;
  icon: string;
  route: string;
  label: string;
}

const tabs: TabItem[] = [
  { name: 'home', icon: '🏠', route: '/(tabs)', label: 'Home' },
  { name: 'categories', icon: '📁', route: '/(tabs)/categories', label: 'Categories' },
  { name: 'documents', icon: '📄', route: '/(tabs)/documents', label: 'Documents' },
  { name: 'explorer', icon: '🗂️', route: '/(tabs)/explorer', label: 'Explorer' },
  { name: 'settings', icon: '⚙️', route: '/(tabs)/explore', label: 'Settings' },
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

  const backgroundColor = colorScheme === 'dark' ? 'rgba(28, 28, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const borderColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <View style={[
      styles.container, 
      { 
        paddingBottom: insets.bottom + 4, 
        paddingTop: 8,
        height: 68 + insets.bottom,
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
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
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
    borderTopWidth: 0.5,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  icon: {
    fontSize: 22,
    marginBottom: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
});

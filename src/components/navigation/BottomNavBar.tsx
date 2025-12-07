import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function BottomNavBar() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Home',
      icon: 'house.fill' as const,
      path: '/(tabs)' as any,
      isActive: pathname === '/' || pathname === '/(tabs)',
    },
    {
      name: 'Categories',
      icon: 'folder.fill' as const,
      path: '/(tabs)/categories' as any,
      isActive: pathname.includes('/categories'),
    },
    {
      name: 'Documents',
      icon: 'doc.fill' as const,
      path: '/(tabs)/documents' as any,
      isActive: pathname.includes('/documents'),
    },
    {
      name: 'Settings',
      icon: 'gear' as const,
      path: '/(tabs)/explore' as any,
      isActive: pathname.includes('/settings') || pathname.includes('/explore'),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
        },
      ]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tab}
          onPress={() => router.push(tab.path)}
          activeOpacity={0.7}>
          <IconSymbol
            name={tab.icon}
            size={28}
            color={tab.isActive ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].textSecondary}
          />
          <Text
            style={[
              styles.label,
              {
                color: tab.isActive
                  ? Colors[colorScheme ?? 'light'].tint
                  : Colors[colorScheme ?? 'light'].textSecondary,
              },
            ]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});

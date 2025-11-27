import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const settingsItems = [
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Manage your personal information',
      icon: 'person.circle.fill' as any,
      color: '#007AFF',
      onPress: () => router.push('/settings/profile' as any),
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Password, MFA, and biometrics',
      icon: 'lock.shield.fill' as any,
      color: '#ff9500',
      onPress: () => router.push('/settings/security' as any),
    },
    {
      id: 'preferences',
      title: 'Preferences',
      subtitle: 'App settings and appearance',
      icon: 'slider.horizontal.3' as any,
      color: '#5ac8fa',
      onPress: () => router.push('/settings/preferences' as any),
    },
    {
      id: 'document-management',
      title: 'Document Management',
      subtitle: 'Storage, cleanup, and bulk operations',
      icon: 'folder.badge.gearshape' as any,
      color: '#AF52DE',
      onPress: () => router.push('/settings/document-management' as any),
    },
    {
      id: 'backup',
      title: 'Backup & Restore',
      subtitle: 'Export and import your data',
      icon: 'archivebox.fill' as any,
      color: '#4CAF50',
      onPress: () => router.push('/settings/backup' as any),
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'info.circle.fill',
      color: '#8e8e93',
      onPress: () => router.push('/settings/about' as any),
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Settings
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {settingsItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
              },
            ]}
            onPress={item.onPress}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <IconSymbol name={item.icon} size={28} color={item.color} />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
                {item.title}
              </Text>
              <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {item.subtitle}
              </Text>
            </View>

            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: Fonts.rounded,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
});

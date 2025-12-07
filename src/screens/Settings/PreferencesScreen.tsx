import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { BottomNavBar } from '@/src/components/navigation/BottomNavBar';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getPreferences, resetPreferences, setPreference } from '@/src/services/database/preferenceService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from 'react-native-toast-notifications';

export default function PreferencesScreen() {
  const { colorScheme, refreshTheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const toast = useToast();

  // Helper to show messages with Alert fallback
  const showMessage = (message: string, type: 'success' | 'danger' = 'danger') => {
    if (toast) {
      toast.show(message, { type });
    } else {
      Alert.alert(type === 'success' ? 'Success' : 'Error', message);
    }
  };

  // App preferences state
  const [loading, setLoading] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [compactViewEnabled, setCompactViewEnabled] = useState(false);
  const [showThumbnailsEnabled, setShowThumbnailsEnabled] = useState(true);

  // Load preferences from database on mount
  useEffect(() => {
    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getPreferences();
      setDarkModeEnabled(prefs.darkMode);
      setNotificationsEnabled(prefs.notifications);
      setAutoBackupEnabled(prefs.autoBackup);
      setCompactViewEnabled(prefs.compactView);
      setShowThumbnailsEnabled(prefs.showThumbnails);
    } catch (error) {
      console.error('Error loading preferences:', error);
      showMessage('Failed to load preferences', 'danger');
    } finally {
      setLoading(false);
    }
  };



  const handleToggleDarkMode = async () => {
    try {
      const newValue = !darkModeEnabled;
      await setPreference('darkMode', newValue);
      setDarkModeEnabled(newValue);
      // Refresh theme to apply changes immediately
      await refreshTheme();
      showMessage(`Dark mode ${newValue ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling dark mode:', error);
      showMessage('Failed to update dark mode', 'danger');
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const newValue = !notificationsEnabled;
      await setPreference('notifications', newValue);
      setNotificationsEnabled(newValue);
      showMessage(`Notifications ${newValue ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling notifications:', error);
      showMessage('Failed to update notifications', 'danger');
    }
  };

  const handleToggleAutoBackup = async () => {
    try {
      const newValue = !autoBackupEnabled;
      await setPreference('autoBackup', newValue);
      setAutoBackupEnabled(newValue);
      showMessage(`Auto backup ${newValue ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling auto backup:', error);
      showMessage('Failed to update auto backup', 'danger');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary files and thumbnails. Your documents and data will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: () => {
            // Cache clearing will be implemented when Document Management screen is built
            // For now, just show success message
            showMessage('Cache cleared successfully', 'success');
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all app preferences to their default values. Your documents and account data will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetPreferences();
              await loadPreferences();
              showMessage('Settings reset to defaults', 'success');
            } catch (error) {
              console.error('Error resetting settings:', error);
              showMessage('Failed to reset settings', 'danger');
            }
          },
        },
      ]
    );
  };

  const handleToggleCompactView = async (value: boolean) => {
    try {
      await setPreference('compactView', value);
      setCompactViewEnabled(value);
      showMessage(`Compact view ${value ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling compact view:', error);
      showMessage('Failed to update compact view', 'danger');
    }
  };

  const handleToggleShowThumbnails = async (value: boolean) => {
    try {
      await setPreference('showThumbnails', value);
      setShowThumbnailsEnabled(value);
      showMessage(`Thumbnails ${value ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling thumbnails:', error);
      showMessage('Failed to update thumbnails', 'danger');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Loading preferences...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Preferences
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Appearance
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Dark Mode
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Currently follows system settings
              </Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={darkModeEnabled ? Colors.primary : '#f4f3f4'}
            />
          </View>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Compact View
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Show more items on screen
              </Text>
            </View>
            <Switch
              value={compactViewEnabled}
              onValueChange={handleToggleCompactView}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={compactViewEnabled ? Colors.primary : '#f4f3f4'}
            />
          </View>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Show Thumbnails
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Display document previews
              </Text>
            </View>
            <Switch
              value={showThumbnailsEnabled}
              onValueChange={handleToggleShowThumbnails}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={showThumbnailsEnabled ? Colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Notifications
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Enable Notifications
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Receive updates and reminders
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={notificationsEnabled ? Colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Backup Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Backup
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Auto Backup
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Automatic daily encrypted backups
              </Text>
            </View>
            <Switch
              value={autoBackupEnabled}
              onValueChange={handleToggleAutoBackup}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={autoBackupEnabled ? Colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Data & Storage
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}
            onPress={handleClearCache}>
            <View style={[styles.iconContainer, { backgroundColor: '#ff9500' + '20' }]}>
              <IconSymbol name="trash.fill" size={24} color="#ff9500" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Clear Cache
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Remove temporary files
              </Text>
            </View>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}
            onPress={handleResetSettings}>
            <View style={[styles.iconContainer, { backgroundColor: '#ff3b30' + '20' }]}>
              <IconSymbol name="arrow.counterclockwise" size={24} color="#ff3b30" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: '#ff3b30' }]}>Reset Settings</Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Restore default preferences
              </Text>
            </View>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Info Notice */}
        <View style={styles.notice}>
          <Text
            style={[
              styles.noticeText,
              { color: Colors[colorScheme ?? 'light'].textSecondary },
            ]}>
            Settings are saved automatically and will persist across app restarts.
          </Text>
        </View>
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  notice: {
    padding: 16,
    marginTop: 16,
  },
  noticeText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

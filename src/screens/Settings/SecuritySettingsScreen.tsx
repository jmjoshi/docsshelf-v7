import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BottomNavBar } from '@/src/components/navigation/BottomNavBar';
import { useAuth } from '@/src/contexts/AuthContext';
import { getDatabase } from '@/src/services/database/dbInit';
import { getCurrentUserId } from '@/src/services/database/userService';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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

export default function SecuritySettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logout } = useAuth();
  const toast = useToast();

  // State connected to database
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load security settings from database
  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;

      const db = await getDatabase();
      const user = await db.getFirstAsync<any>(
        'SELECT mfa_enabled, biometric_enabled FROM users WHERE id = ?',
        [userId]
      );

      if (user) {
        setMfaEnabled(user.mfa_enabled === 1);
        setBiometricEnabled(user.biometric_enabled === 1);
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMFA = async () => {
    if (mfaEnabled) {
      Alert.alert(
        'Disable MFA',
        'Are you sure you want to disable Multi-Factor Authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              try {
                const userId = await getCurrentUserId();
                if (!userId) return;

                const db = await getDatabase();
                await db.runAsync(
                  'UPDATE users SET mfa_enabled = 0, mfa_type = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                  [userId]
                );

                setMfaEnabled(false);
                toast.show('MFA disabled', { type: 'success' });
              } catch (error) {
                console.error('Failed to disable MFA:', error);
                toast.show('Failed to disable MFA', { type: 'error' });
              }
            },
          },
        ]
      );
    } else {
      // Navigate to MFA setup screen (reuse from auth flow)
      router.push('/(auth)/mfa-setup');
    }
  };

  const handleToggleBiometric = async () => {
    if (!biometricEnabled) {
      try {
        // Check if device supports biometric
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware) {
          Alert.alert(
            'Not Supported',
            'Your device does not support biometric authentication'
          );
          return;
        }

        if (!isEnrolled) {
          Alert.alert(
            'Not Configured',
            'Please set up fingerprint or face recognition in your device settings first'
          );
          return;
        }

        // Test biometric authentication
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity to enable biometric login',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });

        if (result.success) {
          const userId = await getCurrentUserId();
          if (!userId) return;

          const db = await getDatabase();
          await db.runAsync(
            'UPDATE users SET biometric_enabled = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
          );

          setBiometricEnabled(true);
          toast.show('Biometric authentication enabled', { type: 'success' });
        } else {
          toast.show('Biometric verification failed', { type: 'error' });
        }
      } catch (error) {
        console.error('Failed to enable biometric:', error);
        toast.show('Failed to enable biometric authentication', { type: 'error' });
      }
    } else {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const db = await getDatabase();
        await db.runAsync(
          'UPDATE users SET biometric_enabled = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [userId]
        );

        setBiometricEnabled(false);
        toast.show('Biometric authentication disabled', { type: 'info' });
      } catch (error) {
        console.error('Failed to disable biometric:', error);
        toast.show('Failed to disable biometric authentication', { type: 'error' });
      }
    }
  };

  const handleChangePassword = () => {
    router.push('/settings/change-password' as any);
  };

  const handleViewSecurityLog = () => {
    router.push('/settings/security-log' as any);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Security
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Loading settings...
            </Text>
          </View>
        ) : (
          <>
        {/* Authentication Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Authentication
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Multi-Factor Authentication
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Add an extra layer of security with TOTP
              </Text>
            </View>
            <Switch
              value={mfaEnabled}
              onValueChange={handleToggleMFA}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={mfaEnabled ? Colors.primary : '#f4f3f4'}
            />
          </View>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Biometric Authentication
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Use fingerprint or face recognition
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={biometricEnabled ? Colors.primary : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}
            onPress={handleChangePassword}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Change Password
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Update your account password
              </Text>
            </View>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* App Lock Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            App Lock
          </Text>

          <View
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Auto-Lock
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Lock app after 30 minutes of inactivity
              </Text>
            </View>
            <Switch
              value={autoLockEnabled}
              onValueChange={setAutoLockEnabled}
              trackColor={{ false: '#767577', true: Colors.primary + '80' }}
              thumbColor={autoLockEnabled ? Colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Security Log Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Activity
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}
            onPress={handleViewSecurityLog}>
            <View style={[styles.iconContainer, { backgroundColor: '#ff9500' + '20' }]}>
              <IconSymbol name="clock.fill" size={24} color="#ff9500" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Security Log
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                View login attempts and activity
              </Text>
            </View>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#ff3b30' }]}>Danger Zone</Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              styles.dangerItem,
              { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
            ]}
            onPress={() => {
              Alert.alert(
                'Log Out',
                'Are you sure you want to log out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: logout,
                  },
                ]
              );
            }}>
            <View style={[styles.iconContainer, { backgroundColor: '#ff3b30' + '20' }]}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#ff3b30" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: '#ff3b30' }]}>Log Out</Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}>
                Sign out of your account
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View style={styles.notice}>
          <IconSymbol name="lock.shield.fill" size={32} color={Colors.primary} />
          <Text style={[styles.noticeTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Your Security Matters
          </Text>
          <Text
            style={[
              styles.noticeText,
              { color: Colors[colorScheme ?? 'light'].textSecondary },
            ]}>
            DocsShelf uses AES-256 encryption to protect your documents. Enable MFA and biometric
            authentication for maximum security.
          </Text>
        </View>
        </>
        )}
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingBottom: 250, // Extra space for bottom navigation and text wrapping on small screens
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
  dangerItem: {
    borderWidth: 1,
    borderColor: '#ff3b30' + '40',
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
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    marginTop: 12,
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});

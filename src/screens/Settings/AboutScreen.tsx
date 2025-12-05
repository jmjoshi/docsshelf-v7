import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const appVersion = '1.0.0';
  const buildNumber = '1';
  const appName = 'DocsShelf';

  const handleRateApp = () => {
    Alert.alert('Coming Soon', 'App Store link will be available after release');
  };

  const handleViewPrivacyPolicy = () => {
    Linking.openURL('https://github.com/jmjoshi/docsshelf-v7/blob/master/documents/legal/PRIVACY_POLICY.md');
  };

  const handleViewTerms = () => {
    Linking.openURL('https://github.com/jmjoshi/docsshelf-v7/blob/master/documents/legal/TERMS_OF_SERVICE.md');
  };

  const handleViewLicenses = () => {
    Alert.alert('Open Source Licenses', 'License viewer will be available soon');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you would like to contact us:',
      [
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:support@docsshelf.app?subject=DocsShelf Support');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
          About
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* App Logo & Name */}
        <View style={styles.appInfo}>
          <View style={[styles.logoContainer, { backgroundColor: Colors.primary + '20' }]}>
            <IconSymbol name="doc.text.fill" size={64} color={Colors.primary} />
          </View>
          <Text style={[styles.appName, { color: Colors[colorScheme ?? 'light'].text }]}>
            {appName}
          </Text>
          <Text style={[styles.tagline, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Secure Document Management
          </Text>
          <View style={styles.versionBadge}>
            <Text style={[styles.versionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Version {appVersion} ({buildNumber})
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Features
          </Text>

          <View style={[styles.featureItem, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
            <View style={[styles.featureIcon, { backgroundColor: '#4CAF50' + '20' }]}>
              <IconSymbol name="lock.shield.fill" size={24} color="#4CAF50" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                AES-256 Encryption
              </Text>
              <Text style={[styles.featureDesc, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Military-grade encryption for all documents
              </Text>
            </View>
          </View>

          <View style={[styles.featureItem, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
            <View style={[styles.featureIcon, { backgroundColor: '#2196F3' + '20' }]}>
              <IconSymbol name="icloud.slash.fill" size={24} color="#2196F3" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Offline First
              </Text>
              <Text style={[styles.featureDesc, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                All features work without internet
              </Text>
            </View>
          </View>

          <View style={[styles.featureItem, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
            <View style={[styles.featureIcon, { backgroundColor: '#FF9800' + '20' }]}>
              <IconSymbol name="camera.fill" size={24} color="#FF9800" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Document Scanning
              </Text>
              <Text style={[styles.featureDesc, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Scan documents with your camera
              </Text>
            </View>
          </View>

          <View style={[styles.featureItem, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}>
            <View style={[styles.featureIcon, { backgroundColor: '#9C27B0' + '20' }]}>
              <IconSymbol name="folder.fill" size={24} color="#9C27B0" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Smart Organization
              </Text>
              <Text style={[styles.featureDesc, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Categories, tags, and powerful search
              </Text>
            </View>
          </View>
        </View>

        {/* Links Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            More Information
          </Text>

          <TouchableOpacity
            style={[styles.linkItem, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}
            onPress={handleRateApp}>
            <Text style={[styles.linkTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Rate This App
            </Text>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkItem, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}
            onPress={handleViewPrivacyPolicy}>
            <Text style={[styles.linkTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Privacy Policy
            </Text>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkItem, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}
            onPress={handleViewTerms}>
            <Text style={[styles.linkTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Terms of Service
            </Text>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkItem, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}
            onPress={handleViewLicenses}>
            <Text style={[styles.linkTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Open Source Licenses
            </Text>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkItem, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}
            onPress={handleContactSupport}>
            <Text style={[styles.linkTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Contact Support
            </Text>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={[styles.copyrightText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            © 2025 DocsShelf
          </Text>
          <Text style={[styles.copyrightText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            All rights reserved
          </Text>
        </View>
      </ScrollView>
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
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    marginBottom: 16,
  },
  versionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
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
  featureItem: {
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
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  copyrightText: {
    fontSize: 14,
  },
});

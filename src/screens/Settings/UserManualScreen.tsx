import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  content: string[];
}

export default function UserManualScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections: Section[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'flag.fill',
      color: '#4CAF50',
      content: [
        '📱 Registration: Tap "Register" → Enter email → Create strong password (8+ chars, uppercase, lowercase, number, special character)',
        '🔑 Login: Enter email and password → Tap "Login"',
        '🔒 Security Setup: Enable biometric authentication and two-factor authentication (recommended)',
      ],
    },
    {
      id: 'documents',
      title: 'Document Management',
      icon: 'doc.text.fill',
      color: '#2196F3',
      content: [
        '📸 Scan Documents: Tap camera icon → Capture → Add filename, category, tags → Save',
        '📁 Upload Files: Documents tab → Upload → Select file → Add details → Save',
        '👁️ View Documents: Tap any document to open and view',
        '✏️ Edit: Open document → Edit button → Update name/category/tags → Save',
        '🗑️ Delete: Open document → Delete button → Confirm',
        '📤 Share: Use Share button to send via email or messaging',
        '🖨️ Print: Use Print button (requires printer setup)',
      ],
    },
    {
      id: 'categories',
      title: 'Categories & Organization',
      icon: 'folder.fill',
      color: '#FF9800',
      content: [
        '➕ Create Category: Categories tab → + button → Enter name, choose icon/color → Save',
        '✏️ Edit Category: Long-press category → Edit → Update details → Save',
        '🗑️ Delete Category: Long-press → Delete → Choose what to do with documents',
        '🏗️ Subcategories: Create nested categories up to 3 levels deep',
        '🎨 Custom Colors: Assign colors for easy visual identification',
        '📊 Organization: Use categories like Receipts, Medical, Financial, Work, etc.',
      ],
    },
    {
      id: 'explorer',
      title: 'File Explorer',
      icon: 'list.bullet.rectangle',
      color: '#9C27B0',
      content: [
        '🌲 Tree View: See all categories in expandable tree structure',
        '👆 Expand/Collapse: Tap folder to expand, tap again to collapse',
        '🔍 Search: Type in search box to filter categories and documents',
        '📂 Navigate: Click through folders to find documents',
        '🔄 Refresh: Pull down or tap refresh button to update view',
        '📈 Expand All: Use toolbar button to expand entire tree',
        '📉 Collapse All: Use toolbar button to collapse everything',
      ],
    },
    {
      id: 'search',
      title: 'Search & Filter',
      icon: 'magnifyingglass',
      color: '#00BCD4',
      content: [
        '🔍 Quick Search: Type in search bar to find documents instantly',
        '🏷️ Tag Search: Search by tags (e.g., "urgent", "2024", "taxes")',
        '📁 Category Filter: Filter documents by category',
        '✨ Smart Search: Partial matches work (e.g., "rec" finds "receipt")',
        '🔤 Case-Insensitive: Search works regardless of capitalization',
      ],
    },
    {
      id: 'security',
      title: 'Security Features',
      icon: 'lock.shield.fill',
      color: '#F44336',
      content: [
        '🔐 Password Protection: Strong encryption using PBKDF2-SHA256',
        '👆 Biometric Login: Enable fingerprint or face unlock in Settings → Security',
        '🔑 Two-Factor Auth (MFA): Settings → Security → Enable MFA → Scan QR with authenticator app',
        '⚠️ Account Lockout: 5 failed attempts = 15-minute lockout (email notification sent)',
        '🔄 Password Reset: Login screen → Forgot Password → Check email → Create new password',
        '💾 Secure Storage: All data encrypted and stored locally on device',
        '⏱️ Auto-Logout: Sessions expire after 15 minutes of inactivity',
      ],
    },
    {
      id: 'settings',
      title: 'Settings & Preferences',
      icon: 'gear',
      color: '#607D8B',
      content: [
        '👤 Profile: Update email and personal information',
        '🔒 Security: Change password, enable MFA, biometric settings',
        '🎨 Appearance: Choose light/dark theme or system default',
        '💾 Storage: View usage, clear cache, manage space',
        '📥 Backup: Export documents to device storage (encrypted)',
        '📊 Document Management: Bulk operations, cleanup, storage optimization',
      ],
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      icon: 'lightbulb.fill',
      color: '#FFC107',
      content: [
        '📝 Naming: Use descriptive names with dates (e.g., "2024-01-15-Receipt.jpg")',
        '🏷️ Tags: Use consistent tags like year, urgency, status',
        '📁 Categories: Create 5-10 main categories, use subcategories for details',
        '🧹 Cleanup: Review and delete outdated documents monthly',
        '🔒 Security: Enable biometric + MFA for maximum protection',
        '📸 Scanning: Use good lighting, hold steady, ensure document is flat',
        '💾 Storage: Compress large images, use PDF for multiple pages',
        '🔄 Updates: Keep app updated for latest security and features',
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: 'wrench.fill',
      color: '#795548',
      content: [
        '❌ Login Issues: Check email spelling → Verify password → Use "Forgot Password" if needed',
        '🔒 Account Locked: Wait 15 minutes or reset password to unlock immediately',
        '📱 MFA Problems: Ensure device time is correct → Try next code → Use backup code',
        '📷 Camera Issues: Grant camera permission → Restart app → Clean camera lens',
        '🔍 Search Problems: Check spelling → Try partial search → Clear filters',
        '🐌 Slow Performance: Clear cache (Settings → Storage) → Restart app → Free device storage',
        '💥 App Crashes: Update to latest version → Clear cache → Restart device',
        '📧 Email Not Received: Check spam folder → Verify email address → Wait a few minutes',
      ],
    },
    {
      id: 'support',
      title: 'Support & Contact',
      icon: 'questionmark.circle.fill',
      color: '#3F51B5',
      content: [
        '📧 Email Support: support@docsshelf.app',
        '🐛 Report Bug: Settings → Report a Bug → Describe issue → Submit',
        '💡 Feature Request: Settings → Send Feedback → Describe idea → Submit',
        '⭐ Rate App: Settings → About → Rate This App',
        '📚 Documentation: Check this User Manual first',
        '🔄 App Version: Settings → About → Version info',
      ],
    },
  ];

  const filteredSections = sections.filter(
    (section) =>
      searchQuery === '' ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.some((item) =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
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
          User Manual
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1c1c1e' : '#f5f5f5' }]}>
        <IconSymbol name="magnifyingglass" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Search manual..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.introSection}>
          <View style={[styles.introIcon, { backgroundColor: Colors.primary + '20' }]}>
            <IconSymbol name="book.fill" size={32} color={Colors.primary} />
          </View>
          <Text style={[styles.introTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Welcome to DocsShelf!
          </Text>
          <Text style={[styles.introText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Your complete guide to using DocsShelf for secure document management. Tap any section below to learn more.
          </Text>
        </View>

        {filteredSections.map((section) => {
          const isExpanded = expandedSection === section.id;
          
          return (
            <View
              key={section.id}
              style={[
                styles.sectionCard,
                { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' },
              ]}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.id)}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
                    <IconSymbol name={section.icon as any} size={24} color={section.color} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {section.title}
                  </Text>
                </View>
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down'}
                  size={20}
                  color={Colors[colorScheme ?? 'light'].textSecondary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.sectionContent}>
                  {section.content.map((item, index) => (
                    <View key={index} style={styles.contentItem}>
                      <Text style={[styles.contentText, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            DocsShelf v7.0.0
          </Text>
          <Text style={[styles.footerText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Need more help? Contact support@docsshelf.app
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 250, // Extra space for bottom navigation and text wrapping on small screens
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
    marginBottom: 8,
  },
  introText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  sectionCard: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  contentItem: {
    marginBottom: 12,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.regular,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

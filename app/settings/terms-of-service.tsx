import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
  const colorScheme = useColorScheme();
  // const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Terms of Service
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}>
        
        <Text style={[styles.lastUpdated, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
          Last Updated: November 26, 2025
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Agreement to Terms
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          By accessing or using the DocsShelf mobile application (the "App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Description of Service
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          DocsShelf is a personal document management application that allows you to:{'\n\n'}
          • Store and organize documents securely on your device{'\n'}
          • Create encrypted backups of your documents{'\n'}
          • Manage categories, tags, and document metadata{'\n'}
          • Search and filter your document collection{'\n'}
          • Protect your data with multi-factor authentication and encryption
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          User Accounts
        </Text>
        
        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Account Creation
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • You must provide accurate, current, and complete information during registration{'\n'}
          • You must be at least 13 years old to create an account{'\n'}
          • You are responsible for maintaining the confidentiality of your password{'\n'}
          • You are responsible for all activities under your account
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Account Security
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • You must use a strong password that meets our security requirements{'\n'}
          • You should enable Multi-Factor Authentication (MFA) for additional security{'\n'}
          • Notify us immediately of any unauthorized access or security breach{'\n'}
          • We are not liable for losses due to compromised credentials
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Acceptable Use
        </Text>
        
        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          You May:
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • Use the App for personal, non-commercial document management{'\n'}
          • Store documents you own or have rights to{'\n'}
          • Create backups of your data{'\n'}
          • Share feedback and suggestions
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          You May NOT:
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • Use the App for illegal activities or to store illegal content{'\n'}
          • Upload malware, viruses, or malicious code{'\n'}
          • Attempt to reverse engineer, decompile, or hack the App{'\n'}
          • Store copyrighted material without proper authorization{'\n'}
          • Use automated tools to extract or scrape data{'\n'}
          • Impersonate others or create fake accounts{'\n'}
          • Violate any applicable laws or regulations
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Intellectual Property
        </Text>
        
        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Our Rights
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • The App, including all code, design, graphics, and content, is owned by DocsShelf{'\n'}
          • "DocsShelf" name, logo, and trademarks are our property{'\n'}
          • You may not copy, modify, distribute, or create derivative works without permission
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Your Content
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • You retain all ownership rights to documents you upload{'\n'}
          • By using the App, you grant us a limited license to store and process your documents{'\n'}
          • We do not claim ownership of your documents{'\n'}
          • You are responsible for ensuring you have rights to uploaded content
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Data and Privacy
        </Text>
        
        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Data Storage
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • All data is stored locally on your device{'\n'}
          • We do not access your documents without your explicit consent{'\n'}
          • Backup files remain under your control on your device or chosen backup location
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Data Security
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • We implement industry-standard encryption (AES-256, PBKDF2){'\n'}
          • We cannot recover lost passwords or decrypt forgotten encrypted backups{'\n'}
          • You are responsible for maintaining backups of critical data
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Disclaimers and Limitations
        </Text>
        
        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Service Availability
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • The App is provided "as is" and "as available"{'\n'}
          • We do not guarantee uninterrupted or error-free service{'\n'}
          • We may modify, suspend, or discontinue features at any time{'\n'}
          • We are not responsible for data loss due to device failure or user error
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          No Warranty
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW:{'\n\n'}
          • WE MAKE NO WARRANTIES, EXPRESS OR IMPLIED{'\n'}
          • WE DISCLAIM WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE{'\n'}
          • WE DO NOT WARRANT THAT THE APP IS BUG-FREE OR SECURE{'\n'}
          • USE OF THE APP IS AT YOUR OWN RISK
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Limitation of Liability
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW:{'\n\n'}
          • WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES{'\n'}
          • OUR TOTAL LIABILITY SHALL NOT EXCEED $100 USD{'\n'}
          • WE ARE NOT LIABLE FOR DATA LOSS, BUSINESS INTERRUPTION, OR LOST PROFITS
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Backups and Data Loss
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • You are responsible for creating and maintaining backups of your data{'\n'}
          • We provide backup tools, but you must use them{'\n'}
          • We are not responsible for data loss due to device failure, app uninstallation, or user error{'\n\n'}
          Recommendations:{'\n'}
          • Create regular encrypted backups{'\n'}
          • Store backups in multiple locations{'\n'}
          • Test restore functionality periodically
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Contact Us
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          If you have any questions about these Terms, please contact us at:{'\n\n'}
          Email: support@docsshelf.app
        </Text>

        <View style={styles.bottomSpacer} />
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.sans,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 250, // Extra space for bottom navigation and text wrapping on small screens
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.sans,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    fontFamily: Fonts.sans,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    lineHeight: 22,
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});

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

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();

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
          Privacy Policy
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
          Introduction
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          DocsShelf ("we", "our", or "us") is a privacy-first document management application. This Privacy Policy explains our approach to data collection and storage when you use the DocsShelf mobile application (the "App").
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Our Privacy Commitment
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          DocsShelf is designed with privacy as a core principle:{'\n\n'}
          • All data is stored locally on your device only{'\n'}
          • We do not collect, transmit, or store any user data on our servers{'\n'}
          • We do not track your usage or behavior{'\n'}
          • We do not share any information with third parties{'\n'}
          • We have no access to your documents, passwords, or personal information
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Information Storage
        </Text>
        
        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          What is Stored Locally on Your Device
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          All information remains exclusively on your device:{'\n\n'}
          • Account Information: Email address, encrypted password hash, name, and optional phone number{'\n'}
          • Documents: Files you upload (images, PDFs, scans) and their metadata{'\n'}
          • Organization Data: Categories, tags, and document organization preferences{'\n'}
          • Settings: App preferences and configuration options{'\n'}
          • Security Settings: MFA configuration and biometric authentication preferences
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          What We Do NOT Collect
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          We explicitly do not collect:{'\n\n'}
          • Your documents or their contents{'\n'}
          • Your personal information or account credentials{'\n'}
          • Usage analytics or behavioral data{'\n'}
          • Device identifiers or location data{'\n'}
          • Crash reports or diagnostic information{'\n'}
          • Any information that leaves your device
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          How Your Data is Used
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          Your data is used exclusively on your device to:{'\n\n'}
          • Provide document storage and organization functionality{'\n'}
          • Authenticate your access to the app{'\n'}
          • Enable search, filtering, and categorization features{'\n'}
          • Generate local encrypted backups when you choose to create them{'\n'}
          • Maintain app preferences and settings
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Data Security
        </Text>
        
        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Local-Only Storage
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • All data resides exclusively on your device{'\n'}
          • Database: Encrypted SQLite database using SQLCipher with AES-256-GCM encryption{'\n'}
          • Documents: Stored in your device's secure, sandboxed file system{'\n'}
          • No Network Transmission: Your data never leaves your device automatically{'\n'}
          • No Cloud Synchronization: We do not operate any cloud storage or sync services
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Security Features
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          • Password Protection: SHA-512 hashing with 100,000 iterations and unique salt per user{'\n'}
          • Database Encryption: Military-grade AES-256 encryption for all stored data{'\n'}
          • HMAC Verification: Cryptographic integrity verification prevents data tampering{'\n'}
          • Multi-Factor Authentication: Optional TOTP-based MFA (industry-standard 6-digit codes){'\n'}
          • Biometric Authentication: Optional Face ID/Touch ID/Fingerprint support{'\n'}
          • Session Management: Automatic timeout and lockout after inactivity{'\n'}
          • Brute Force Protection: Account lockout after failed login attempts
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Data Sharing and Third Parties
        </Text>
        
        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          No Data Collection or Sharing
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          Because all data is stored locally on your device:{'\n\n'}
          • We do not collect any user data{'\n'}
          • We do not share data with third parties{'\n'}
          • We do not sell, rent, or trade any information{'\n'}
          • We do not use analytics or tracking services{'\n'}
          • We have no access to your documents or personal information
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          No Third-Party Services
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          The app does not integrate with any third-party services for:{'\n\n'}
          • Analytics or usage tracking{'\n'}
          • Advertising or marketing{'\n'}
          • Cloud storage or synchronization{'\n'}
          • Crash reporting or diagnostics{'\n'}
          • Social media integration
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          Legal Compliance Exception
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          Since we do not collect or have access to your data, we cannot provide user information to third parties, law enforcement, or legal authorities. Only you have access to data stored on your device, subject to your device's security and any legal obligations you may have regarding your own device.
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Backups and Data Export
        </Text>
        
        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          User-Controlled Backups
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          You have complete control over your data backups:{'\n\n'}
          • Manual Backups: Create encrypted backup files at any time{'\n'}
          • Export Location: Choose where to save backups (device storage, USB, external storage){'\n'}
          • Encryption: All backups are encrypted with your password{'\n'}
          • No Automatic Cloud Upload: Backups are never automatically uploaded to any server{'\n'}
          • Your Responsibility: You choose where and how to store backup files
        </Text>

        <Text style={[styles.subheading, { color: Colors[colorScheme ?? 'light'].text }]}>
          If You Choose Cloud Storage
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          If you manually save backup files to a cloud service (Google Drive, Dropbox, etc.):{'\n\n'}
          • This is your independent action, not a feature of DocsShelf{'\n'}
          • Your backup files remain encrypted{'\n'}
          • The cloud provider's privacy policy applies to files you store there{'\n'}
          • We do not have any relationship with or access to third-party cloud services you may use
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Your Rights and Control
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          You have complete control over your data:{'\n\n'}
          • Access: View all data within the app at any time{'\n'}
          • Export: Create encrypted backups whenever you want{'\n'}
          • Delete: Remove documents, categories, or your entire account locally{'\n'}
          • Transfer: Export your data in .docsshelf backup format{'\n'}
          • No Account Recovery: If you forget your password, data cannot be recovered (by design for security)
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Data Retention and Deletion
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          Since all data is stored locally on your device:{'\n\n'}
          • Data exists only on your device{'\n'}
          • Uninstalling the app deletes all data unless you created backups{'\n'}
          • Deleting your account removes all data from your device{'\n'}
          • Device reset or factory wipe removes all data{'\n'}
          • We do not retain any data on servers as we have no servers storing user data
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Children's Privacy
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          DocsShelf does not collect any personal information from anyone, including children under 13. Since all data is stored locally on the device, parental supervision of device usage is recommended.
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          International Users
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          Since DocsShelf stores all data locally on your device and does not transmit data internationally, data protection regulations (GDPR, CCPA, etc.) related to data transfer do not apply. Your data never leaves your device unless you manually export it.
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Changes to This Privacy Policy
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          We may update this Privacy Policy to reflect changes in the app or legal requirements. Continued use of the app after changes constitutes acceptance of the updated policy. Material changes will be communicated through app updates.
        </Text>

        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Contact Us
        </Text>
        <Text style={[styles.paragraph, { color: Colors[colorScheme ?? 'light'].text }]}>
          If you have any questions about this Privacy Policy, please contact us at:{'\n\n'}
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
    fontSize: 28,
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

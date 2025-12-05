/**
 * Security Warning Modal (FR-MAIN-013A)
 * Displays prominent security warnings before creating unencrypted backups
 * 
 * ⚠️ CRITICAL SECURITY COMPONENT ⚠️
 * This modal MUST be shown before allowing unencrypted backup creation.
 * User must explicitly acknowledge security risks by checking the consent checkbox.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface SecurityWarningModalProps {
  visible: boolean;
  onAccept: () => void;
  onCancel: () => void;
  documentCount: number;
}

/**
 * SecurityWarningModal Component
 * 
 * Features:
 * - Prominent warning icon and title
 * - Clear explanation of security risks
 * - List of security recommendations
 * - Required consent checkbox
 * - Accept/Cancel buttons (Accept disabled until consent)
 */
export default function SecurityWarningModal({
  visible,
  onAccept,
  onCancel,
  documentCount,
}: SecurityWarningModalProps) {
  const [consentChecked, setConsentChecked] = useState(false);

  // Reset consent when modal is shown
  React.useEffect(() => {
    if (visible) {
      setConsentChecked(false);
    }
  }, [visible]);

  const handleAccept = () => {
    if (consentChecked) {
      onAccept();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Warning Header */}
          <View style={styles.header}>
            <Ionicons name="warning" size={48} color="#FF6B6B" />
            <Text style={styles.title}>Security Warning</Text>
            <Text style={styles.subtitle}>Unencrypted Backup</Text>
          </View>

          {/* Warning Content */}
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={true}>
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ You are about to create an UNENCRYPTED backup of {documentCount} document{documentCount !== 1 ? 's' : ''}.
              </Text>
              <Text style={styles.warningText}>
                These files will NOT be protected by encryption and can be viewed by anyone with physical access.
              </Text>
            </View>

            {/* Risks Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Risks:</Text>
              <View style={styles.riskItem}>
                <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
                <Text style={styles.riskText}>
                  Anyone with access to the USB drive or external storage can read your documents
                </Text>
              </View>
              <View style={styles.riskItem}>
                <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
                <Text style={styles.riskText}>
                  If the device is lost or stolen, your data is exposed
                </Text>
              </View>
              <View style={styles.riskItem}>
                <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
                <Text style={styles.riskText}>
                  Data may remain on the device even after deletion
                </Text>
              </View>
            </View>

            {/* Recommendations Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Recommendations:</Text>
              <View style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                <Text style={styles.recommendationText}>
                  Use encrypted backups (FR-MAIN-013) for sensitive documents
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                <Text style={styles.recommendationText}>
                  Store backups in a physically secure location you control
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                <Text style={styles.recommendationText}>
                  Encrypt USB drives with BitLocker (Windows) or FileVault (macOS)
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                <Text style={styles.recommendationText}>
                  Delete unencrypted backups after use (securely wipe)
                </Text>
              </View>
            </View>

            {/* Use Cases Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appropriate Use Cases:</Text>
              <Text style={styles.useCaseText}>
                • Personal USB backup for home computer{'\n'}
                • Emergency recovery on trusted device{'\n'}
                • Transfer to personal NAS/external drive{'\n'}
                • Temporary migration between devices
              </Text>
            </View>
          </ScrollView>

          {/* Consent Checkbox */}
          <View style={styles.consentContainer}>
            <Switch
              value={consentChecked}
              onValueChange={setConsentChecked}
              trackColor={{ false: '#767577', true: '#4ECDC4' }}
              thumbColor={consentChecked ? '#2ECC71' : '#f4f3f4'}
            />
            <Text style={styles.consentText}>
              I understand the security risks and choose to create an unencrypted backup
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acceptButton,
                !consentChecked && styles.acceptButtonDisabled
              ]}
              onPress={handleAccept}
              disabled={!consentChecked}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.acceptButtonText,
                !consentChecked && styles.acceptButtonTextDisabled
              ]}>
                Accept & Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  contentScroll: {
    maxHeight: 400,
  },
  warningBox: {
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 15,
    color: '#D63031',
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 8,
  },
  riskText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    marginLeft: 12,
    lineHeight: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    marginLeft: 12,
    lineHeight: 20,
  },
  useCaseText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    paddingLeft: 8,
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginLeft: 12,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#CCC',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  acceptButtonTextDisabled: {
    color: '#999',
  },
});

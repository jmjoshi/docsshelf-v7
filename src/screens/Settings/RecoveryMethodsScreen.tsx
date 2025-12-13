/**
 * Recovery Methods Settings Screen
 * Allows users to setup or update their password recovery methods
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../../constants/theme';
import RecoverySetupScreen from '../../components/auth/RecoverySetupScreen';
import { useColorScheme } from '../../hooks/use-color-scheme';
import {
  getRecoveryMethodName,
  type RecoveryMethod,
  type RecoverySetup,
} from '../../services/auth/recoveryService';
import { getDatabase } from '../../services/database/dbInit';
import { getCurrentUserId } from '../../services/database/userService';

export default function RecoveryMethodsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [loading, setLoading] = useState(true);
  const [currentMethods, setCurrentMethods] = useState<RecoveryMethod[]>([]);
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    loadCurrentMethods();
  }, []);

  const loadCurrentMethods = async () => {
    try {
      setLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) return;

      const db = getDatabase();
      const user = await db.getFirstAsync<any>(
        'SELECT recovery_methods_enabled FROM users WHERE id = ?',
        [userId]
      );

      if (user && user.recovery_methods_enabled) {
        const methods = JSON.parse(user.recovery_methods_enabled);
        setCurrentMethods(methods);
      }
    } catch (error) {
      console.error('Error loading recovery methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = async (setup: RecoverySetup) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const db = getDatabase();

      // Prepare security questions JSON
      const securityQuestionsJson = setup.securityQuestions 
        ? JSON.stringify(setup.securityQuestions) 
        : null;

      // Update user with recovery methods
      await db.runAsync(
        `UPDATE users 
         SET recovery_phrase_hash = ?, 
             recovery_pin_hash = ?, 
             security_questions = ?,
             recovery_methods_enabled = ?
         WHERE id = ?`,
        [
          setup.phraseHash || null,
          setup.pinHash || null,
          securityQuestionsJson,
          JSON.stringify(setup.methods),
          userId,
        ]
      );

      setShowSetupModal(false);
      loadCurrentMethods();

      Alert.alert(
        'Success',
        `Recovery methods configured successfully!\n\n${
          setup.phrase
            ? `⚠️ IMPORTANT: Your recovery phrase is:\n\n${setup.phrase}\n\nWrite this down and store it safely. You won't see it again!`
            : 'Your recovery methods have been saved securely.'
        }`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving recovery methods:', error);
      Alert.alert('Error', 'Failed to save recovery methods. Please try again.');
    }
  };

  const handleRemoveMethods = () => {
    Alert.alert(
      'Remove Recovery Methods?',
      'Are you sure you want to remove all recovery methods? You will not be able to recover your password if you forget it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = await getCurrentUserId();
              if (!userId) return;

              const db = getDatabase();
              await db.runAsync(
                `UPDATE users 
                 SET recovery_phrase_hash = NULL, 
                     recovery_pin_hash = NULL, 
                     security_questions = NULL,
                     recovery_methods_enabled = '[]'
                 WHERE id = ?`,
                [userId]
              );

              setCurrentMethods([]);
              Alert.alert('Removed', 'All recovery methods have been removed.');
            } catch (error) {
              console.error('Error removing recovery methods:', error);
              Alert.alert('Error', 'Failed to remove recovery methods.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color={colors.tint} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Recovery Methods</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Info Section */}
        <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Password Recovery</Text>
            <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>
              Recovery methods allow you to reset your password if you forget it. Choose 1-2 methods
              that you can remember or access securely.
            </Text>
          </View>
        </View>

        {/* Current Methods */}
        {currentMethods.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Methods</Text>
            {currentMethods.map((method) => (
              <View
                key={method}
                style={[styles.methodCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#4CAF50"
                  style={styles.methodIcon}
                />
                <Text style={[styles.methodName, { color: colors.text }]}>
                  {getRecoveryMethodName(method)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="warning" size={48} color="#FF9500" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Recovery Methods</Text>
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              You haven't set up any recovery methods. If you forget your password, you won't be able
              to recover your account.
            </Text>
          </View>
        )}

        {/* Warning */}
        <View style={[styles.warningBox, { backgroundColor: '#FF3B3020' }]}>
          <Ionicons name="alert-circle" size={20} color="#FF3B30" />
          <Text style={[styles.warningText, { color: colors.text }]}>
            <Text style={{ fontWeight: 'bold', color: '#FF3B30' }}>Important:</Text> This is a
            zero-knowledge app. We cannot recover your password for you. Recovery methods are your
            only way to reset your password if forgotten.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={() => setShowSetupModal(true)}
          >
            <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
              {currentMethods.length > 0 ? 'Update Recovery Methods' : 'Setup Recovery Methods'}
            </Text>
          </TouchableOpacity>

          {currentMethods.length > 0 && (
            <TouchableOpacity style={[styles.dangerButton]} onPress={handleRemoveMethods}>
              <Text style={[styles.dangerButtonText, { color: '#FF3B30' }]}>
                Remove All Methods
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Setup Modal */}
      <RecoverySetupScreen
        visible={showSetupModal}
        onComplete={handleSetupComplete}
        onSkip={() => setShowSetupModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 250,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  methodIcon: {
    marginRight: 12,
  },
  methodName: {
    fontSize: 16,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

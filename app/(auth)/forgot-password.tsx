/**
 * Forgot Password Screen  
 * Multi-method password recovery (Phrase, PIN, Security Questions)
 * Email recovery disabled for free version
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Shadows, Spacing, Typography } from '../../constants/colors';
import { Colors } from '../../constants/theme';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { useColorScheme } from '../../src/hooks/use-color-scheme';
import {
  RecoveryMethod,
  SecurityQuestion,
  verifyRecoveryPhrase,
  verifyRecoveryPin,
  verifySecurityAnswer,
} from '../../src/services/auth/recoveryService';
import { getDatabase } from '../../src/services/database/dbInit';
import { getUserByEmail } from '../../src/services/database/userService';
import { getUserPasswordHashKey, getUserSaltKey } from '../../src/utils/auth/secureStoreKeys';
import { generateSalt, hashPassword } from '../../src/utils/crypto/passwordHash';
import { sanitizeEmail, validateEmail } from '../../src/utils/validators/emailValidator';

type Step = 'email' | 'method' | 'verify' | 'newPassword';

function ForgotPasswordContent() {
  const colorScheme = useColorScheme();

  // Step management
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);

  // User data
  const [email, setEmail] = useState('');
  const [userRecoveryMethods, setUserRecoveryMethods] = useState<RecoveryMethod[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Selected method
  const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod | null>(null);

  // Recovery phrase
  const [recoveryPhrase, setRecoveryPhrase] = useState('');

  // Recovery PIN
  const [recoveryPin, setRecoveryPin] = useState('');

  // Security questions
  const [userSecurityQuestions, setUserSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [securityAnswers, setSecurityAnswers] = useState<string[]>(['', '']);

  // New password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');

  const handleEmailSubmit = async () => {
    setError('');

    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.message || 'Invalid email');
      return;
    }

    const sanitizedEmail = sanitizeEmail(email);
    setLoading(true);

    try {
      const user = await getUserByEmail(sanitizedEmail);

      if (!user) {
        setError('No account found with this email address');
        setLoading(false);
        return;
      }

      // Get recovery methods
      const recoveryMethodsEnabled = user.recovery_methods_enabled 
        ? JSON.parse(user.recovery_methods_enabled) 
        : [];

      if (recoveryMethodsEnabled.length === 0) {
        setLoading(false);
        Alert.alert(
          'No Recovery Methods',
          'This account has no recovery methods configured. Please contact support or create a new account.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get security questions if available
      if (recoveryMethodsEnabled.includes('questions') && user.security_questions) {
        const questions = JSON.parse(user.security_questions);
        setUserSecurityQuestions(questions);
      }

      setUserId(user.id!);
      setUserRecoveryMethods(recoveryMethodsEnabled);
      setStep('method');
    } catch (err) {
      console.error('Email lookup error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: RecoveryMethod) => {
    setSelectedMethod(method);
    setStep('verify');
    setError('');
  };

  const handleVerify = async () => {
    if (!selectedMethod || !userId) return;

    setError('');
    setLoading(true);

    try {
      const db = getDatabase();
      const user = await db.getFirstAsync<any>(
        'SELECT recovery_phrase_hash, recovery_pin_hash, security_questions FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        setError('User not found');
        return;
      }

      let verified = false;

      if (selectedMethod === 'phrase') {
        if (!recoveryPhrase) {
          setError('Please enter your recovery phrase');
          return;
        }
        verified = await verifyRecoveryPhrase(recoveryPhrase, user.recovery_phrase_hash);
        if (!verified) {
          setError('Incorrect recovery phrase. Please check and try again.');
        }
      } else if (selectedMethod === 'pin') {
        if (!recoveryPin) {
          setError('Please enter your recovery PIN');
          return;
        }
        verified = await verifyRecoveryPin(recoveryPin, user.recovery_pin_hash);
        if (!verified) {
          setError('Incorrect recovery PIN');
        }
      } else if (selectedMethod === 'questions') {
        const questions: SecurityQuestion[] = JSON.parse(user.security_questions);
        
        if (!securityAnswers[0] || !securityAnswers[1]) {
          setError('Please answer both security questions');
          return;
        }

        const verified0 = await verifySecurityAnswer(securityAnswers[0], questions[0].answerHash);
        const verified1 = await verifySecurityAnswer(securityAnswers[1], questions[1].answerHash);
        
        verified = verified0 && verified1;
        
        if (!verified) {
          setError('One or more answers are incorrect. Please try again.');
        }
      }

      if (verified) {
        setStep('newPassword');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!userId) {
      setError('User not found');
      return;
    }

    setLoading(true);

    try {
      // Generate new salt and hash password using the SAME method as registration
      const newSalt = await generateSalt(); // 32 bytes (64 hex chars) - same as registration
      const newPasswordHash = await hashPassword(newPassword, newSalt); // SHA-512 - same as registration

      console.log('=== FORGOT PASSWORD - RESET ===');
      console.log('Email:', sanitizeEmail(email));
      console.log('New salt (first 10):', newSalt.substring(0, 10));
      console.log('New hash (first 20):', newPasswordHash.substring(0, 20));

      // Update in SecureStore (NO DATABASE STORAGE - credentials are SecureStore only)
      const sanitizedEmail = sanitizeEmail(email);
      await SecureStore.setItemAsync(getUserSaltKey(sanitizedEmail), newSalt);
      await SecureStore.setItemAsync(getUserPasswordHashKey(sanitizedEmail), newPasswordHash);
      
      console.log('SecureStore updated successfully');
      console.log('=== FORGOT PASSWORD - RESET COMPLETE ===');

      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset. You can now login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <View>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Reset Password
      </Text>
      <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
        Enter your email address to begin password recovery
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            color: Colors[colorScheme ?? 'light'].text,
            borderColor: Colors[colorScheme ?? 'light'].border,
          },
        ]}
        placeholder="Email"
        placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
        onPress={handleEmailSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colorScheme === 'dark' ? '#000' : '#fff'} />
        ) : (
          <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
            Continue
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => router.back()}
      >
        <Text style={[styles.linkText, { color: Colors[colorScheme ?? 'light'].tint }]}>
          Back to Login
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMethodSelection = () => (
    <View>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Select Recovery Method
      </Text>
      <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
        Choose how you want to verify your identity
      </Text>

      <View style={styles.methodsContainer}>
        {userRecoveryMethods.includes('phrase') && (
          <TouchableOpacity
            style={[
              styles.methodCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].border },
            ]}
            onPress={() => handleMethodSelect('phrase')}
          >
            <Ionicons name="document-text" size={32} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.methodTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Recovery Phrase
            </Text>
            <Text style={[styles.methodDesc, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Use your 12-word recovery phrase
            </Text>
          </TouchableOpacity>
        )}

        {userRecoveryMethods.includes('pin') && (
          <TouchableOpacity
            style={[
              styles.methodCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].border },
            ]}
            onPress={() => handleMethodSelect('pin')}
          >
            <Ionicons name="keypad" size={32} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.methodTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Recovery PIN
            </Text>
            <Text style={[styles.methodDesc, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Enter your 4-6 digit PIN
            </Text>
          </TouchableOpacity>
        )}

        {userRecoveryMethods.includes('questions') && (
          <TouchableOpacity
            style={[
              styles.methodCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].border },
            ]}
            onPress={() => handleMethodSelect('questions')}
          >
            <Ionicons name="help-circle" size={32} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.methodTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Security Questions
            </Text>
            <Text style={[styles.methodDesc, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Answer your security questions
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => setStep('email')}
      >
        <Text style={[styles.linkText, { color: Colors[colorScheme ?? 'light'].tint }]}>
          ← Back
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerification = () => {
    if (!selectedMethod) return null;

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Verify Your Identity
        </Text>

        {selectedMethod === 'phrase' && (
          <>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Enter your 12-word recovery phrase
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].card,
                  color: Colors[colorScheme ?? 'light'].text,
                  borderColor: Colors[colorScheme ?? 'light'].border,
                },
              ]}
              placeholder="word1 word2 word3 ..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
              value={recoveryPhrase}
              onChangeText={(text) => {
                setRecoveryPhrase(text);
                setError('');
              }}
              multiline
              numberOfLines={3}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        )}

        {selectedMethod === 'pin' && (
          <>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Enter your recovery PIN
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].card,
                  color: Colors[colorScheme ?? 'light'].text,
                  borderColor: Colors[colorScheme ?? 'light'].border,
                },
              ]}
              placeholder="Enter PIN"
              placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
              value={recoveryPin}
              onChangeText={(text) => {
                setRecoveryPin(text);
                setError('');
              }}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
            />
          </>
        )}

        {selectedMethod === 'questions' && (
          <>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              Answer your security questions
            </Text>
            {userSecurityQuestions.map((q, index) => (
              <View key={index} style={styles.questionContainer}>
                <Text style={[styles.questionText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {q.question}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: Colors[colorScheme ?? 'light'].card,
                      color: Colors[colorScheme ?? 'light'].text,
                      borderColor: Colors[colorScheme ?? 'light'].border,
                    },
                  ]}
                  placeholder="Your answer"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  value={securityAnswers[index]}
                  onChangeText={(text) => {
                    const newAnswers = [...securityAnswers];
                    newAnswers[index] = text;
                    setSecurityAnswers(newAnswers);
                    setError('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            ))}
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colorScheme === 'dark' ? '#000' : '#fff'} />
          ) : (
            <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
              Verify
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => {
            setStep('method');
            setError('');
          }}
        >
          <Text style={[styles.linkText, { color: Colors[colorScheme ?? 'light'].tint }]}>
            ← Try Different Method
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderNewPassword = () => (
    <View>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Set New Password
      </Text>
      <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
        Choose a strong password for your account
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            color: Colors[colorScheme ?? 'light'].text,
            borderColor: Colors[colorScheme ?? 'light'].border,
          },
        ]}
        placeholder="New Password"
        placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);
          setError('');
        }}
        secureTextEntry
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            color: Colors[colorScheme ?? 'light'].text,
            borderColor: Colors[colorScheme ?? 'light'].border,
          },
        ]}
        placeholder="Confirm New Password"
        placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setError('');
        }}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
        onPress={handlePasswordReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colorScheme === 'dark' ? '#000' : '#fff'} />
        ) : (
          <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
            Reset Password
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <View style={styles.content}>
        {step === 'email' && renderEmailStep()}
        {step === 'method' && renderMethodSelection()}
        {step === 'verify' && renderVerification()}
        {step === 'newPassword' && renderNewPassword()}
      </View>
    </SafeAreaView>
  );
}

export default function ForgotPasswordScreen() {
  return (
    <ErrorBoundary>
      <ForgotPasswordContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing['2xl'],
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    fontSize: Typography.fontSize.base,
    ...Shadows.sm,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: '#fff',
    marginBottom: Spacing.md,
    textAlign: 'center',
    backgroundColor: '#ef4444',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  button: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  buttonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  linkContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  methodsContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  methodCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  methodDesc: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: Spacing.lg,
  },
  questionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.md,
  },
});

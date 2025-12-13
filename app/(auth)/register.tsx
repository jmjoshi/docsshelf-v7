import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocsShelfMascot } from '../../components/branding/Logo';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/colors';
import RecoverySetupScreen from '../../src/components/auth/RecoverySetupScreen';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { RecoverySetup } from '../../src/services/auth/recoveryService';
import { getDatabase, initializeDatabase, isDatabaseInitialized } from '../../src/services/database/dbInit';
import { createUser, userExists } from '../../src/services/database/userService';
import { UserProfile } from '../../src/types/user';
import { CURRENT_USER_EMAIL_KEY, getUserPasswordHashKey, getUserSaltKey } from '../../src/utils/auth/secureStoreKeys';
import { generateSalt, hashPassword } from '../../src/utils/crypto/passwordHash';
import { logger } from '../../src/utils/helpers/logger';
import { sanitizeEmail, validateEmail } from '../../src/utils/validators/emailValidator';
import { validatePassword } from '../../src/utils/validators/passwordValidator';
import { validatePhone } from '../../src/utils/validators/phoneValidator';

function RegisterScreenContent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [homePhone, setHomePhone] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [showRecoverySetup, setShowRecoverySetup] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Initialize database on component mount
  useEffect(() => {
    const initDb = async () => {
      try {
        if (!isDatabaseInitialized()) {
          await initializeDatabase();
        }
        setDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setError('Failed to initialize app. Please restart.');
      }
    };
    initDb();
  }, []);

  const handleRegister = useCallback(async () => {
    // Don't proceed if database not ready
    if (!dbReady) {
      setError('App is initializing, please wait...');
      return;
    }

    // Validate first name
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    
    // Validate last name
    if (!lastName.trim()) {
      setError('Last name is required');
      return;
    }
    
    // Validate and sanitize email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message ?? 'Invalid email');
      return;
    }
    
    const sanitizedEmail = sanitizeEmail(email);
    
    // Check if user already exists - wrapped in try-catch
    try {
      const exists = await userExists(sanitizedEmail);
      if (exists) {
        setError('An account with this email already exists');
        return;
      }
    } catch (err) {
      console.error('Error checking user existence:', err);
      setError('Failed to verify email. Please try again.');
      return;
    }
    
    // Validate phone numbers (mobile required, others optional)
    const mobileValidation = validatePhone(mobilePhone, true);
    if (!mobileValidation.valid) {
      setError(mobileValidation.message ?? 'Invalid mobile phone number');
      return;
    }
    
    const homeValidation = validatePhone(homePhone, false);
    if (!homeValidation.valid) {
      setError(homeValidation.message ?? 'Invalid home phone number');
      return;
    }
    
    const workValidation = validatePhone(workPhone, false);
    if (!workValidation.valid) {
      setError(workValidation.message ?? 'Invalid work phone number');
      return;
    }
    
    // Validate password
    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.message ?? 'Invalid password');
      return;
    }
    
    // Check password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Check legal consent
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service to continue');
      return;
    }
    
    if (!agreedToPrivacy) {
      setError('You must agree to the Privacy Policy to continue');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Generate cryptographically secure random salt
      const salt = await generateSalt();
      
      // Hash the password using PBKDF2-SHA256
      const passwordHash = await hashPassword(password, salt);
      
      // Create user profile in database
      const userProfile: UserProfile = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: sanitizedEmail,
        phoneNumbers: {
          mobile: mobileValidation.formatted,
          home: homeValidation.formatted,
          work: workValidation.formatted,
        },
      };
      
      console.log('=== REGISTRATION START ===');
      console.log('Email being registered:', sanitizedEmail);
      console.log('Salt (first 10 chars):', salt.substring(0, 10));
      console.log('Hash (first 20 chars):', passwordHash.substring(0, 20));
      console.log('Password length:', password.length);
      
      await createUser(userProfile);
      
      // Store authentication credentials securely per-user
      await SecureStore.setItemAsync(CURRENT_USER_EMAIL_KEY, sanitizedEmail); // Keep current user
      await SecureStore.setItemAsync(getUserSaltKey(sanitizedEmail), salt);
      await SecureStore.setItemAsync(getUserPasswordHashKey(sanitizedEmail), passwordHash);
      
      console.log('Stored CURRENT_USER_EMAIL_KEY:', sanitizedEmail);
      console.log('Stored salt key:', getUserSaltKey(sanitizedEmail));
      console.log('Stored hash key:', getUserPasswordHashKey(sanitizedEmail));
      
      // Verify what was stored
      const verifyEmail = await SecureStore.getItemAsync(CURRENT_USER_EMAIL_KEY);
      const verifySalt = await SecureStore.getItemAsync(getUserSaltKey(sanitizedEmail));
      const verifyHash = await SecureStore.getItemAsync(getUserPasswordHashKey(sanitizedEmail));
      console.log('VERIFIED - Email in SecureStore:', verifyEmail);
      console.log('VERIFIED - Salt exists:', !!verifySalt);
      console.log('VERIFIED - Hash exists:', !!verifyHash);
      console.log('=== REGISTRATION END ===');
      
      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobilePhone('');
      setHomePhone('');
      setWorkPhone('');
      setPassword('');
      setConfirmPassword('');
      setAgreedToTerms(false);
      setAgreedToPrivacy(false);
      
      logger.info('User registration successful', { email: sanitizedEmail });
      
      // Save email for recovery setup
      setRegisteredEmail(sanitizedEmail);
      
      // Show recovery setup modal
      setShowRecoverySetup(true);
    } catch (err) {
      logger.error('Registration failed', err as Error, { email: sanitizeEmail(email) });
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, mobilePhone, homePhone, workPhone, password, confirmPassword, dbReady, agreedToTerms, agreedToPrivacy]);

  const handleRecoverySetupComplete = async (recoverySetup: RecoverySetup) => {
    try {
      console.log('=== RECOVERY SETUP START ===');
      console.log('Recovery setup data:', {
        methods: recoverySetup.methods,
        hasPhraseHash: !!recoverySetup.phraseHash,
        hasPinHash: !!recoverySetup.pinHash,
        hasQuestions: !!recoverySetup.securityQuestions,
        email: registeredEmail,
      });

      const db = getDatabase();
      console.log('Database instance obtained');
      
      // Get user ID
      const user = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM users WHERE email = ?',
        [registeredEmail]
      );

      console.log('User query result:', user);

      if (!user) {
        throw new Error('User not found');
      }

      console.log('Attempting to update recovery methods for user ID:', user.id);

      // Update user with recovery methods
      const result = await db.runAsync(
        `UPDATE users 
         SET recovery_phrase_hash = ?, 
             recovery_pin_hash = ?, 
             security_questions = ?, 
             recovery_methods_enabled = ?
         WHERE id = ?`,
        [
          recoverySetup.phraseHash || null,
          recoverySetup.pinHash || null,
          recoverySetup.securityQuestions ? JSON.stringify(recoverySetup.securityQuestions) : null,
          JSON.stringify(recoverySetup.methods),
          user.id,
        ]
      );

      console.log('Update result:', result);
      logger.info('Recovery methods saved', { email: registeredEmail, methods: recoverySetup.methods });
      console.log('=== RECOVERY SETUP SUCCESS ===');

      // Close recovery setup modal
      setShowRecoverySetup(false);

      // Navigate to MFA setup
      Alert.alert(
        'Success',
        'Account created successfully! Now let\'s secure your account with two-factor authentication.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/mfa-setup' as any) }]
      );
    } catch (err) {
      console.error('=== RECOVERY SETUP FAILED ===');
      console.error('Error details:', err);
      console.error('Error message:', (err as Error).message);
      console.error('Error stack:', (err as Error).stack);
      
      logger.error('Failed to save recovery methods', err as Error, { email: registeredEmail });
      Alert.alert('Error', 'Failed to save recovery methods. Please try setting them up again in account settings.');
      
      // Still navigate to MFA setup
      router.replace('/(auth)/mfa-setup' as any);
    }
  };

  const handleRecoverySetupSkip = () => {
    Alert.alert(
      'Skip Recovery Setup?',
      'Without recovery methods, you will not be able to reset your password if you forget it. Your data will be permanently lost.\n\nAre you sure you want to skip?',
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Skip Anyway',
          style: 'destructive',
          onPress: () => {
            setShowRecoverySetup(false);
            Alert.alert(
              'Success',
              'Account created successfully! Now let\'s secure your account with two-factor authentication.',
              [{ text: 'OK', onPress: () => router.replace('/(auth)/mfa-setup' as any) }]
            );
          },
        },
      ]
    );
  };

  // Show loading while database initializes
  if (!dbReady) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
        <DocsShelfMascot size={80} />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join DocsShelf for secure document management</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name *"
          placeholderTextColor={Colors.text.placeholder}
          autoCapitalize="words"
          value={firstName}
          onChangeText={setFirstName}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name *"
          placeholderTextColor={Colors.text.placeholder}
          autoCapitalize="words"
          value={lastName}
          onChangeText={setLastName}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Email *"
          placeholderTextColor={Colors.text.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Numbers</Text>
        <TextInput
          style={styles.input}
          placeholder="Mobile Phone * (Required)"
          placeholderTextColor={Colors.text.placeholder}
          keyboardType="phone-pad"
          value={mobilePhone}
          onChangeText={setMobilePhone}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Home Phone (Optional)"
          placeholderTextColor={Colors.text.placeholder}
          keyboardType="phone-pad"
          value={homePhone}
          onChangeText={setHomePhone}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Work Phone (Optional)"
          placeholderTextColor={Colors.text.placeholder}
          keyboardType="phone-pad"
          value={workPhone}
          onChangeText={setWorkPhone}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TextInput
          style={styles.input}
          placeholder="Password *"
          placeholderTextColor={Colors.text.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <Text style={styles.passwordHint}>
          Min 12 characters, uppercase, lowercase, numbers, symbols
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password *"
          placeholderTextColor={Colors.text.placeholder}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />
      </View>

      <View style={styles.legalSection}>
        <Text style={styles.legalTitle}>Legal Agreements</Text>
        
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          disabled={loading}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.checkboxTextContainer}>
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text 
                style={styles.link}
                onPress={(e) => {
                  e.stopPropagation();
                  Linking.openURL('https://github.com/jmjoshi/docsshelf-v7/blob/master/documents/legal/TERMS_OF_SERVICE.md');
                }}
              >
                Terms of Service
              </Text>
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setAgreedToPrivacy(!agreedToPrivacy)}
          disabled={loading}
        >
          <View style={[styles.checkbox, agreedToPrivacy && styles.checkboxChecked]}>
            {agreedToPrivacy && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.checkboxTextContainer}>
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text 
                style={styles.link}
                onPress={(e) => {
                  e.stopPropagation();
                  Linking.openURL('https://github.com/jmjoshi/docsshelf-v7/blob/master/documents/legal/PRIVACY_POLICY.md');
                }}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.legalNote}>
          By registering, you acknowledge that you have read and understood our data handling practices. All your documents are stored locally and encrypted on your device.
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Creating your account...</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={[
            styles.registerButton,
            (agreedToTerms && agreedToPrivacy) && styles.registerButtonEnabled
          ]}
          onPress={handleRegister}
          disabled={loading || !agreedToTerms || !agreedToPrivacy}
        >
          <Text style={[
            styles.registerButtonText,
            (agreedToTerms && agreedToPrivacy) && styles.registerButtonTextEnabled
          ]}>
            Register
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        style={styles.linkContainer}
        onPress={() => router.push('/(auth)/login' as any)}
        disabled={loading}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {showRecoverySetup && (
        <RecoverySetupScreen
          visible={showRecoverySetup}
          onComplete={handleRecoverySetupComplete}
          onSkip={handleRecoverySetupSkip}
        />
      )}
    </>
  );
}

export default function RegisterScreen() {
  return (
    <ErrorBoundary>
      <RegisterScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.paper,
  },
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textAlign: 'center',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing['2xl'],
    textAlign: 'center',
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.main,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    fontSize: Typography.fontSize.base,
    backgroundColor: Colors.background.default,
    color: Colors.text.primary,
    ...Shadows.sm,
  },
  passwordHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
    paddingHorizontal: Spacing.xs,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.xs,
  },
  error: {
    color: Colors.error.main,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    backgroundColor: Colors.error.light,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  linkContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.primary.main,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  legalSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.background.default,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
  legalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border.main,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.paper,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
  },
  checkboxTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  checkboxText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  link: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  legalNote: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.main,
  },
  registerButton: {
    backgroundColor: Colors.border.main,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  registerButtonEnabled: {
    backgroundColor: Colors.primary.main,
    ...Shadows.md,
  },
  registerButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  registerButtonTextEnabled: {
    color: '#FFFFFF',
  },
});

import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { CURRENT_USER_EMAIL_KEY, getUserPasswordHashKey, getUserSaltKey } from '../../src/utils/auth/secureStoreKeys';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DocsShelfMascot } from '../../components/branding/Logo';
import { Colors, Shadows, BorderRadius, Spacing, Typography } from '../../constants/colors';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { initializeDatabase, isDatabaseInitialized } from '../../src/services/database/dbInit';
import { createUser, userExists } from '../../src/services/database/userService';
import { UserProfile } from '../../src/types/user';
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
      
      await createUser(userProfile);
      
      // Store authentication credentials securely per-user
      await SecureStore.setItemAsync(CURRENT_USER_EMAIL_KEY, sanitizedEmail); // Keep current user
      await SecureStore.setItemAsync(getUserSaltKey(sanitizedEmail), salt);
      await SecureStore.setItemAsync(getUserPasswordHashKey(sanitizedEmail), passwordHash);
      
      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobilePhone('');
      setHomePhone('');
      setWorkPhone('');
      setPassword('');
      setConfirmPassword('');
      
      logger.info('User registration successful', { email: sanitizedEmail });
      Alert.alert('Success', 'Account created successfully! Now let\'s secure your account with two-factor authentication.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/mfa-setup' as any) }
      ]);
    } catch (err) {
      logger.error('Registration failed', err as Error, { email: sanitizeEmail(email) });
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, mobilePhone, homePhone, workPhone, password, confirmPassword, dbReady]);

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

      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Creating your account...</Text>
        </View>
      ) : (
        <Button 
          title="Register" 
          onPress={handleRegister}
          disabled={loading}
        />
      )}
      <TouchableOpacity 
        style={styles.linkContainer}
        onPress={() => router.push('/(auth)/login' as any)}
        disabled={loading}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: Colors.background.paper,
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
});

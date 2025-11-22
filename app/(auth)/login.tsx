import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocsShelfMascot } from '../../components/branding/Logo';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/colors';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { useAuth } from '../../src/contexts/AuthContext';
import { formatLockoutTime, isAccountLocked, recordFailedAttempt, resetFailedAttempts } from '../../src/services/auth/accountSecurityService';
import { initializeDatabase, isDatabaseInitialized } from '../../src/services/database/dbInit';
import { CURRENT_USER_EMAIL_KEY, getUserPasswordHashKey, getUserSaltKey } from '../../src/utils/auth/secureStoreKeys';
import { verifyPassword } from '../../src/utils/crypto/passwordHash';
import { logger } from '../../src/utils/helpers/logger';
import { sanitizeEmail, validateEmail } from '../../src/utils/validators/emailValidator';

function LoginScreenContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const { login } = useAuth();

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

  const handleLogin = useCallback(async () => {
    // Don't proceed if database not ready
    if (!dbReady) {
      setError('App is initializing, please wait...');
      return;
    }

    // Validate and sanitize email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message ?? 'Invalid email');
      return;
    }
    
    const sanitizedEmail = sanitizeEmail(email);
    
    if (!password) {
      setError('Please enter your password');
      return;
    }

    // Check if account is locked (FR-LOGIN-005)
    const lockStatus = await isAccountLocked(sanitizedEmail);
    if (lockStatus.isLocked) {
      const timeRemaining = formatLockoutTime(lockStatus.remainingTime);
      setError(`Account locked due to multiple failed login attempts. Please try again in ${timeRemaining}.`);
      Alert.alert(
        'Account Locked',
        `Your account has been temporarily locked for security reasons.\n\nTime remaining: ${timeRemaining}\n\nA notification has been sent to your email.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Check if user exists in database first
      const { userExists } = await import('../../src/services/database/userService');
      const accountExists = await userExists(sanitizedEmail);
      
      if (!accountExists) {
        // Record failed attempt for non-existent account
        const isLocked = await recordFailedAttempt(sanitizedEmail);
        const attempts = await isAccountLocked(sanitizedEmail);
        
        if (isLocked) {
          setError('Account locked due to multiple failed attempts. Check your email for details.');
        } else {
          setError(`Invalid email or password. ${attempts.attemptsRemaining} attempts remaining.`);
        }
        setLoading(false);
        return;
      }
      
      // Retrieve stored credentials for this specific user
      const storedSalt = await SecureStore.getItemAsync(getUserSaltKey(sanitizedEmail));
      const storedHash = await SecureStore.getItemAsync(getUserPasswordHashKey(sanitizedEmail));
      
      if (!storedSalt || !storedHash) {
        setError('Account credentials not found. Please contact support.');
        setLoading(false);
        return;
      }
      
      // Verify the password
      const isValid = await verifyPassword(password, storedSalt, storedHash);
      
      if (isValid) {
        // Reset failed attempts on successful login
        await resetFailedAttempts(sanitizedEmail);
        logger.info('User login successful', { email: sanitizedEmail });
        
        // Check if MFA is enabled
        const { isMFARequired } = await import('../../src/services/auth/mfaService');
        const mfaRequired = await isMFARequired(sanitizedEmail);
        
        if (mfaRequired) {
          // Store email for MFA verification and set as current user
          await SecureStore.setItemAsync('pending_mfa_email', sanitizedEmail);
          await SecureStore.setItemAsync(CURRENT_USER_EMAIL_KEY, sanitizedEmail);
          // Navigate to MFA verification
          router.push('/(auth)/mfa-verify' as any);
        } else {
          // Login without MFA - user has skipped or hasn't set it up yet
          // MFA setup is optional and can be configured in settings
          await SecureStore.setItemAsync(CURRENT_USER_EMAIL_KEY, sanitizedEmail);
          await login();
          // Navigation to tabs will be handled by the root layout
        }
      } else {
        // Record failed attempt and check if account should be locked
        const isLocked = await recordFailedAttempt(sanitizedEmail);
        const attempts = await isAccountLocked(sanitizedEmail);
        
        if (isLocked) {
          const timeRemaining = formatLockoutTime(attempts.remainingTime);
          setError(`Account locked for ${timeRemaining}. Check your email for details.`);
        } else {
          setError(`Invalid email or password. ${attempts.attemptsRemaining} attempts remaining.`);
        }
      }
    } catch (err) {
      logger.error('Login failed', err as Error, { email: sanitizeEmail(email) });
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, login, dbReady]);

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <DocsShelfMascot size={100} />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your DocsShelf account</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.text.placeholder}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.text.placeholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Verifying credentials...</Text>
        </View>
      ) : (
        <>
          <Button 
            title="Login" 
            onPress={handleLogin}
            disabled={loading}
          />
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => router.push('/(auth)/forgot-password' as any)}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity 
        style={styles.linkContainer}
        onPress={() => router.push('/(auth)/register' as any)}
        disabled={loading}
      >
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function LoginScreen() {
  return (
    <ErrorBoundary>
      <LoginScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing['2xl'],
    backgroundColor: Colors.background.paper,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: Spacing.lg,
    textAlign: 'center',
    color: Colors.text.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.main,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    fontSize: Typography.fontSize.base,
    backgroundColor: Colors.background.default,
    color: Colors.text.primary,
    ...Shadows.sm,
  },
  error: {
    color: Colors.error.main,
    marginBottom: Spacing.md,
    textAlign: 'center',
    backgroundColor: Colors.error.light,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
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
  forgotPasswordContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: Colors.primary.main,
    fontSize: Typography.fontSize.sm,
    textDecorationLine: 'underline',
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

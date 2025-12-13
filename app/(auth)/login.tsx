import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocsShelfMascot } from '../../components/branding/Logo';
import { BorderRadius, Shadows, Spacing, Typography } from '../../constants/colors';
import { Colors } from '../../constants/theme';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { useAuth } from '../../src/contexts/AuthContext';
import { useColorScheme } from '../../src/hooks/use-color-scheme';
import { formatLockoutTime, isAccountLocked, recordFailedAttempt, resetFailedAttempts } from '../../src/services/auth/accountSecurityService';
import { initializeDatabase, isDatabaseInitialized } from '../../src/services/database/dbInit';
import { CURRENT_USER_EMAIL_KEY, getUserPasswordHashKey, getUserSaltKey } from '../../src/utils/auth/secureStoreKeys';
import { verifyPassword } from '../../src/utils/crypto/passwordHash';
import { logger } from '../../src/utils/helpers/logger';
import { sanitizeEmail, validateEmail } from '../../src/utils/validators/emailValidator';

function LoginScreenContent() {
  const colorScheme = useColorScheme();
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
          setError(`Account ${sanitizedEmail} locked due to multiple failed attempts. Check your email for details.`);
        } else {
          setError(`Invalid email or password for ${sanitizedEmail}. ${attempts.attemptsRemaining} attempts remaining.`);
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
        // Reset failed attempts immediately on successful password verification
        // This ensures the counter is reset even if MFA verification happens next
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
          setError(`Account ${sanitizedEmail} locked for ${timeRemaining}. Check your email for details.`);
        } else {
          setError(`Invalid email or password for ${sanitizedEmail}. ${attempts.attemptsRemaining} attempts remaining.`);
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
      <View style={[styles.container, styles.centerContent, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Initializing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['top']}>
      <View style={styles.header}>
        <DocsShelfMascot size={100} />
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Sign in to your DocsShelf account</Text>
      </View>
      <TextInput
        style={[styles.input, { 
          borderColor: Colors[colorScheme ?? 'light'].border,
          backgroundColor: Colors[colorScheme ?? 'light'].inputBackground,
          color: Colors[colorScheme ?? 'light'].text
        }]}
        placeholder="Email"
        placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        style={[styles.input, { 
          borderColor: Colors[colorScheme ?? 'light'].border,
          backgroundColor: Colors[colorScheme ?? 'light'].inputBackground,
          color: Colors[colorScheme ?? 'light'].text
        }]}
        placeholder="Password"
        placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Verifying credentials...</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={[styles.loginButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => router.push('/(auth)/forgot-password' as any)}
            disabled={loading}
          >
            <Text style={[styles.forgotPasswordText, { color: Colors[colorScheme ?? 'light'].tint }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity 
        style={styles.linkContainer}
        onPress={() => router.push('/(auth)/register' as any)}
        disabled={loading}
      >
        <Text style={[styles.linkText, { color: Colors[colorScheme ?? 'light'].tint }]}>Don't have an account? Register</Text>
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
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    fontSize: Typography.fontSize.base,
    ...Shadows.sm,
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
  loginButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  loginButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  linkContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  forgotPasswordContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.sm,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
});

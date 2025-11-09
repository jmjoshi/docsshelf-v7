import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { useAuth } from '../../src/contexts/AuthContext';
import { formatLockoutTime, isAccountLocked, recordFailedAttempt, resetFailedAttempts } from '../../src/services/auth/accountSecurityService';
import { initializeDatabase, isDatabaseInitialized } from '../../src/services/database/dbInit';
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
      // Retrieve stored credentials
      const storedEmail = await SecureStore.getItemAsync('user_email');
      const storedSalt = await SecureStore.getItemAsync('user_salt');
      const storedHash = await SecureStore.getItemAsync('user_password_hash');
      
      if (!storedEmail || !storedSalt || !storedHash) {
        setError('No account found. Please register first.');
        setLoading(false);
        return;
      }
      
      // Verify email matches
      if (storedEmail !== sanitizedEmail) {
        // Record failed attempt
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
          // Store email for MFA verification
          await SecureStore.setItemAsync('pending_mfa_email', sanitizedEmail);
          // Navigate to MFA verification
          router.push('/(auth)/mfa-verify' as any);
        } else {
          // Check if this is first login (no MFA setup yet)
          const firstLoginFlag = await SecureStore.getItemAsync('first_login_complete');
          
          if (!firstLoginFlag) {
            // First login - redirect to MFA setup
            await SecureStore.setItemAsync('first_login_complete', 'true');
            router.push('/(auth)/mfa-setup' as any);
          } else {
            // Regular login without MFA
            await login();
            // Navigation will be handled by the root layout
          }
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
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
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
    </View>
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
    padding: 24,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  forgotPasswordContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
});

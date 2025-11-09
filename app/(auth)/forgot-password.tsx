/**
 * Forgot Password Screen
 * FR-LOGIN-006 implementation
 */

import { router } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { requestPasswordReset } from '../../src/services/auth/passwordRecoveryService';
import { sanitizeEmail, validateEmail } from '../../src/utils/validators/emailValidator';

function ForgotPasswordScreenContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleResetRequest = useCallback(async () => {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message ?? 'Invalid email');
      return;
    }

    const sanitizedEmail = sanitizeEmail(email);
    setError('');
    setLoading(true);

    try {
      const { resetLink, expiresAt } = await requestPasswordReset(sanitizedEmail);
      
      console.log('Reset Link:', resetLink);
      
      setResetSent(true);
      
      Alert.alert(
        'Password Reset Email Sent',
        `A password reset link has been sent to ${sanitizedEmail}.\n\nThe link will expire at ${expiresAt.toLocaleTimeString()}.\n\n**Development Mode**: Check the console for the reset link.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      console.error('Password reset request failed:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  if (resetSent) {
    return (
      <View style={styles.container}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a password reset link to:
        </Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.instructions}>
          The link will expire in 1 hour. Click the link in your email to reset your password.
        </Text>
        <Button
          title="Back to Login"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Sending reset email...</Text>
        </View>
      ) : (
        <>
          <Button
            title="Send Reset Link"
            onPress={handleResetRequest}
            disabled={loading || !email}
          />
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.linkText}>Back to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

export default function ForgotPasswordScreen() {
  return (
    <ErrorBoundary>
      <ForgotPasswordScreenContent />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
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
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  successIcon: {
    fontSize: 64,
    textAlign: 'center',
    color: '#4caf50',
    marginBottom: 16,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
});

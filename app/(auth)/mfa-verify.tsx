import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { useAuth } from '../../src/contexts/AuthContext';
import { authenticateWithBiometrics, checkBiometricSupport, getMFASettings, verifyTOTPLogin } from '../../src/services/auth/mfaService';

function MFAVerifyScreenContent() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    loadMFASettings();
    attemptBiometricAuth();
  }, []);

  const loadMFASettings = async () => {
    try {
      // Get email from SecureStore (set during login)
      const { getItemAsync } = await import('expo-secure-store');
      const userEmail = await getItemAsync('pending_mfa_email');
      
      if (!userEmail) {
        router.replace('/(auth)/login' as any);
        return;
      }
      
      setEmail(userEmail);
      
      // Check MFA settings
      const settings = await getMFASettings(userEmail);
      
      if (settings.biometricEnabled) {
        const support = await checkBiometricSupport();
        setBiometricAvailable(support.available);
      }
    } catch (err) {
      console.error('Failed to load MFA settings:', err);
      setError('Failed to load authentication settings');
    }
  };

  const attemptBiometricAuth = async () => {
    try {
      const { getItemAsync } = await import('expo-secure-store');
      const userEmail = await getItemAsync('pending_mfa_email');
      
      if (!userEmail) return;
      
      const settings = await getMFASettings(userEmail);
      
      if (settings.biometricEnabled) {
        const support = await checkBiometricSupport();
        
        if (support.available) {
          // Automatically attempt biometric authentication
          const success = await authenticateWithBiometrics();
          
          if (success) {
            await completeMFALogin();
          }
        }
      }
    } catch (err) {
      console.error('Biometric auth attempt failed:', err);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const isValid = await verifyTOTPLogin(email, code);
      
      if (isValid) {
        await completeMFALogin();
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      console.error('MFA verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeMFALogin = async () => {
    try {
      // Clear pending MFA email
      const { deleteItemAsync } = await import('expo-secure-store');
      await deleteItemAsync('pending_mfa_email');
      
      // Complete login
      await login();
      
      // Navigation handled by auth context
    } catch (err) {
      console.error('Failed to complete login:', err);
      setError('Login completion failed');
    }
  };

  const handleUseBiometric = async () => {
    setLoading(true);
    setError('');
    
    try {
      const success = await authenticateWithBiometrics();
      
      if (success) {
        await completeMFALogin();
      } else {
        setError('Biometric authentication failed');
      }
    } catch (err) {
      console.error('Biometric auth error:', err);
      setError('Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const { deleteItemAsync } = await import('expo-secure-store');
    await deleteItemAsync('pending_mfa_email');
    router.replace('/(auth)/login' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Two-Factor Authentication</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code from your authenticator app
      </Text>

      <TextInput
        style={styles.codeInput}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        editable={!loading}
        autoFocus
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Verifying...</Text>
        </View>
      ) : (
        <>
          <Button
            title="Verify"
            onPress={handleVerifyCode}
            disabled={code.length !== 6}
          />

          {biometricAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleUseBiometric}
            >
              <Text style={styles.biometricText}>Use Biometric Authentication</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}
      </View>
    </SafeAreaView>
  );
}

export default function MFAVerifyScreen() {
  return (
    <ErrorBoundary>
      <MFAVerifyScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
    color: '#666',
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 10,
    fontFamily: 'monospace',
    marginBottom: 24,
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
  biometricButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  biometricText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
});

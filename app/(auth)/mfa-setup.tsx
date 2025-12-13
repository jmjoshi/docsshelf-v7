import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { checkBiometricSupport, enableBiometric, setupTOTP, verifyAndActivateTOTP } from '../../src/services/auth/mfaService';
import { startSession } from '../../src/services/auth/sessionService';
import { getCurrentUserEmail } from '../../src/services/database/userService';

function MFASetupScreenContent() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'choice' | 'totp-setup' | 'totp-verify' | 'biometric'>('choice');
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricSupport, setBiometricSupport] = useState({ available: false, type: '' });

  useEffect(() => {
    loadUserAndBiometricSupport();
  }, []);

  const loadUserAndBiometricSupport = async () => {
    try {
      const userEmail = await getCurrentUserEmail();
      setEmail(userEmail || '');
      
      const support = await checkBiometricSupport();
      setBiometricSupport(support);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const handleSetupTOTP = async () => {
    // Wait for email to load if needed
    let userEmail = email;
    if (!userEmail) {
      console.log('[MFA Setup] Email not loaded yet, fetching...');
      userEmail = await getCurrentUserEmail() || '';
      if (!userEmail) {
        setError('Unable to load user information. Please try again.');
        return;
      }
      setEmail(userEmail);
    }
    
    console.log('[MFA Setup] Setting up TOTP for email:', userEmail);
    setLoading(true);
    setError('');
    
    try {
      const result = await setupTOTP(userEmail);
      setTotpSecret(result.secret);
      setQrCodeUri(result.qrCodeUri);
      setStep('totp-setup');
    } catch (err) {
      setError('Failed to setup authenticator. Please try again.');
      console.error('TOTP setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('[MFA Setup] Verifying code:', verificationCode);
      console.log('[MFA Setup] User email:', email);
      console.log('[MFA Setup] TOTP secret:', totpSecret);
      console.log('[MFA Setup] Device time:', new Date().toISOString());
      console.log('[MFA Setup] Unix timestamp:', Math.floor(Date.now() / 1000));
      
      const isValid = await verifyAndActivateTOTP(email, verificationCode);
      
      if (isValid) {
        Alert.alert(
          'Success!',
          'Two-factor authentication has been enabled for your account.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)' as any),
            },
          ]
        );
      } else {
        setError('Invalid code. Please check your authenticator app and try again. Make sure your device time is set to automatic.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error('TOTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupBiometric = async () => {
    setLoading(true);
    setError('');
    
    try {
      const success = await enableBiometric(email);
      
      if (success) {
        Alert.alert(
          'Success!',
          `${biometricSupport.type} authentication has been enabled.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)' as any),
            },
          ]
        );
      } else {
        setError('Biometric authentication failed. Please try again.');
      }
    } catch (err) {
      setError('Failed to enable biometric authentication.');
      console.error('Biometric setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    Alert.alert(
      'Skip MFA Setup?',
      'Multi-factor authentication adds an extra layer of security to your account. You can set it up later in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            // Set authenticated state and start session
            await SecureStore.setItemAsync('user_authenticated', 'true');
            await startSession();
            router.replace('/(tabs)' as any);
          },
        },
      ]
    );
  };

  if (step === 'choice') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>Secure Your Account</Text>
        <Text style={styles.subtitle}>
          Add an extra layer of security with two-factor authentication
        </Text>

        <View style={styles.optionCard}>
          <Text style={styles.optionTitle}>📱 Authenticator App</Text>
          <Text style={styles.optionDescription}>
            Use Google Authenticator, Authy, or Microsoft Authenticator to generate codes
          </Text>
          <Button title="Setup Authenticator" onPress={handleSetupTOTP} disabled={loading} />
        </View>

        {biometricSupport.available && (
          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>🔐 {biometricSupport.type}</Text>
            <Text style={styles.optionDescription}>
              Use your device's {biometricSupport.type.toLowerCase()} for quick authentication
            </Text>
            <Button
              title={`Enable ${biometricSupport.type}`}
              onPress={handleSetupBiometric}
              disabled={loading}
            />
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'totp-setup') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>Setup Authenticator</Text>
        <Text style={styles.subtitle}>
          Scan this QR code with your authenticator app
        </Text>

        <View style={styles.qrContainer}>
          <QRCode value={qrCodeUri} size={250} />
        </View>

        <View style={styles.secretContainer}>
          <Text style={styles.secretLabel}>Or enter this code manually:</Text>
          <Text style={styles.secretCode}>{totpSecret}</Text>
        </View>

        <Text style={styles.instructions}>
          After scanning, enter the 6-digit code from your authenticator app to verify
        </Text>

        <Button
          title="Next: Enter Code"
          onPress={() => setStep('totp-verify')}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setStep('choice');
            setTotpSecret('');
            setQrCodeUri('');
          }}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'totp-verify') {
    const handleTestCode = async () => {
      try {
        const { generateTOTPCode } = await import('../../src/utils/crypto/totp');
        const code = await generateTOTPCode(totpSecret);
        Alert.alert('Test Code', `Current expected code: ${code}\n\nThis is for debugging only. Use your authenticator app.`);
      } catch (err) {
        Alert.alert('Error', 'Failed to generate test code');
      }
    };

    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>Verify Authenticator</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code from your authenticator app
        </Text>

        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          value={verificationCode}
          onChangeText={setVerificationCode}
          editable={!loading}
          autoFocus
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Verifying code...</Text>
          </View>
        ) : (
          <>
            <Button
              title="Verify & Enable"
              onPress={handleVerifyTOTP}
              disabled={verificationCode.length !== 6}
            />
            
            {__DEV__ && (
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: '#f0f0f0', marginTop: 8 }]}
                onPress={handleTestCode}
              >
                <Text style={[styles.backText, { color: '#666' }]}>Debug: Show Expected Code</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setStep('totp-setup');
            setVerificationCode('');
            setError('');
          }}
          disabled={loading}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

export default function MFASetupScreen() {
  return (
    <ErrorBoundary>
      <MFASetupScreenContent />
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
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 250,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
    color: '#666',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  optionCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secretContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  secretLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  secretCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#000',
    letterSpacing: 2,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
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
  skipButton: {
    marginTop: 24,
    padding: 12,
    alignItems: 'center',
  },
  skipText: {
    color: '#666',
    fontSize: 16,
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

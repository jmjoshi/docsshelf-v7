/**
 * Password Reset Utility Screen
 * Use this screen to reset your password when locked out
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { generateSalt, hashPassword } from '../src/utils/crypto/passwordHash';
import { getUserSaltKey, getUserPasswordHashKey } from '../src/constants/auth';

export default function PasswordResetScreen() {
  const [email, setEmail] = useState('jjoshim@yahoo.com');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (newPassword.length < 12) {
      Alert.alert('Error', 'Password must be at least 12 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Generate new salt and hash
      const salt = await generateSalt();
      const passwordHash = await hashPassword(newPassword, salt);

      console.log('=== PASSWORD RESET ===');
      console.log('Email:', email);
      console.log('New salt (first 10):', salt.substring(0, 10));
      console.log('New hash (first 20):', passwordHash.substring(0, 20));
      console.log('Password length:', newPassword.length);

      // Store new credentials
      await SecureStore.setItemAsync(getUserSaltKey(email), salt);
      await SecureStore.setItemAsync(getUserPasswordHashKey(email), passwordHash);

      // Verify storage
      const verifySalt = await SecureStore.getItemAsync(getUserSaltKey(email));
      const verifyHash = await SecureStore.getItemAsync(getUserPasswordHashKey(email));
      
      console.log('Verification - Salt stored:', !!verifySalt);
      console.log('Verification - Hash stored:', !!verifyHash);
      
      if (verifySalt && verifyHash) {
        Alert.alert(
          'Success!',
          'Password reset successfully. You can now login with your new password.',
          [{ text: 'OK' }]
        );
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', 'Failed to store credentials');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', 'Failed to reset password: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Password Reset Utility</Text>
        <Text style={styles.subtitle}>
          Reset your password when locked out
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="At least 12 characters"
          secureTextEntry
        />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>Instructions:</Text>
          <Text style={styles.infoText}>
            1. Enter your email address
          </Text>
          <Text style={styles.infoText}>
            2. Enter a new password (12+ characters)
          </Text>
          <Text style={styles.infoText}>
            3. Confirm the password
          </Text>
          <Text style={styles.infoText}>
            4. Tap "Reset Password"
          </Text>
          <Text style={styles.infoText}>
            5. Try logging in with the new password
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
});

import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { generateSalt, hashPassword } from '../../src/utils/crypto/passwordHash';
import { logger } from '../../src/utils/helpers/logger';
import { sanitizeEmail, validateEmail } from '../../src/utils/validators/emailValidator';
import { validatePassword } from '../../src/utils/validators/passwordValidator';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validate and sanitize email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message ?? 'Invalid email');
      return;
    }
    
    const sanitizedEmail = sanitizeEmail(email);
    
    // Validate password
    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.message ?? 'Invalid password');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Generate cryptographically secure random salt
      const salt = await generateSalt();
      
      // Hash the password using PBKDF2-SHA256
      const passwordHash = await hashPassword(password, salt);
      
      // Store email, salt, and hashed password securely
      await SecureStore.setItemAsync('user_email', sanitizedEmail);
      await SecureStore.setItemAsync('user_salt', salt);
      await SecureStore.setItemAsync('user_password_hash', passwordHash);
      
      setEmail('');
      setPassword('');
      logger.info('User registration successful', { email: sanitizedEmail });
      Alert.alert('Success', 'Account created securely!', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login' as any) }
      ]);
    } catch (err) {
      logger.error('Registration failed', err as Error, { email: sanitizeEmail(email) });
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
    </View>
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
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
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

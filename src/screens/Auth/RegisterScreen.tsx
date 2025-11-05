import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import argon2 from 'react-native-argon2';
import { ENV } from '../../config/env';
import { logger } from '../../utils/helpers/logger';
import { sanitizeEmail, validateEmail } from '../../utils/validators/emailValidator';
import { validatePassword } from '../../utils/validators/passwordValidator';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    
    try {
      // Generate cryptographically secure random salt
      const saltArray = new Uint8Array(32);
      crypto.getRandomValues(saltArray);
      const salt = Array.from(saltArray, byte => byte.toString(16).padStart(2, '0')).join('');
      
      const result = await argon2(password, salt, {
        iterations: ENV.ARGON2_ITERATIONS,
        memory: ENV.ARGON2_MEMORY,
        parallelism: ENV.ARGON2_PARALLELISM,
        hashLength: ENV.ARGON2_HASH_LENGTH,
        mode: 'argon2id',
      });
      
      // Store email, salt, and hashed password securely
      await SecureStore.setItemAsync('user_email', sanitizedEmail);
      await SecureStore.setItemAsync('user_salt', salt);
      await SecureStore.setItemAsync('user_password_hash', result.encodedHash);
      
      setEmail('');
      setPassword('');
      logger.info('User registration successful', { email: sanitizedEmail });
      Alert.alert('Success', 'Account created securely!');
    } catch (err) {
      logger.error('Registration failed', err as Error, { email: sanitizeEmail(email) });
      setError('Failed to create account. Please try again.');
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
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Register" onPress={handleRegister} />
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
});

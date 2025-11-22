import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { CURRENT_USER_EMAIL_KEY, getUserPasswordHashKey, getUserSaltKey } from '../../utils/auth/secureStoreKeys';
import { generateSalt, hashPassword } from '../../utils/crypto/passwordHash';
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
      const salt = await generateSalt();
      
      // Hash the password using PBKDF2-SHA256
      const passwordHash = await hashPassword(password, salt);
      
      // Store email, salt, and hashed password securely per-user
      await SecureStore.setItemAsync(CURRENT_USER_EMAIL_KEY, sanitizedEmail);
      await SecureStore.setItemAsync(getUserSaltKey(sanitizedEmail), salt);
      await SecureStore.setItemAsync(getUserPasswordHashKey(sanitizedEmail), passwordHash);
      
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

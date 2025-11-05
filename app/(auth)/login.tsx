import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { verifyPassword } from '../../src/utils/crypto/passwordHash';
import { logger } from '../../src/utils/helpers/logger';
import { sanitizeEmail, validateEmail } from '../../src/utils/validators/emailValidator';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
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
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      
      // Verify the password
      const isValid = await verifyPassword(password, storedSalt, storedHash);
      
      if (isValid) {
        logger.info('User login successful', { email: sanitizedEmail });
        // Update authentication state
        await login();
        // Navigation will be handled by the root layout
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      logger.error('Login failed', err as Error, { email: sanitizeEmail(email) });
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <Button 
          title="Login" 
          onPress={handleLogin}
          disabled={loading}
        />
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

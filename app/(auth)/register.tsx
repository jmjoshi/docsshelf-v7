import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { generateSalt, hashPassword } from '../../src/utils/crypto/passwordHash';
import { logger } from '../../src/utils/helpers/logger';
import { sanitizeEmail, validateEmail } from '../../src/utils/validators/emailValidator';
import { validatePassword } from '../../src/utils/validators/passwordValidator';
import { validatePhone } from '../../src/utils/validators/phoneValidator';
import { createUser, userExists } from '../../src/services/database/userService';
import { UserProfile } from '../../src/types/user';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [homePhone, setHomePhone] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validate first name
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    
    // Validate last name
    if (!lastName.trim()) {
      setError('Last name is required');
      return;
    }
    
    // Validate and sanitize email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message ?? 'Invalid email');
      return;
    }
    
    const sanitizedEmail = sanitizeEmail(email);
    
    // Check if user already exists
    const exists = await userExists(sanitizedEmail);
    if (exists) {
      setError('An account with this email already exists');
      return;
    }
    
    // Validate phone numbers (mobile required, others optional)
    const mobileValidation = validatePhone(mobilePhone, true);
    if (!mobileValidation.valid) {
      setError(mobileValidation.message ?? 'Invalid mobile phone number');
      return;
    }
    
    const homeValidation = validatePhone(homePhone, false);
    if (!homeValidation.valid) {
      setError(homeValidation.message ?? 'Invalid home phone number');
      return;
    }
    
    const workValidation = validatePhone(workPhone, false);
    if (!workValidation.valid) {
      setError(workValidation.message ?? 'Invalid work phone number');
      return;
    }
    
    // Validate password
    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.message ?? 'Invalid password');
      return;
    }
    
    // Check password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Generate cryptographically secure random salt
      const salt = await generateSalt();
      
      // Hash the password using PBKDF2-SHA256
      const passwordHash = await hashPassword(password, salt);
      
      // Create user profile in database
      const userProfile: UserProfile = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: sanitizedEmail,
        phoneNumbers: {
          mobile: mobileValidation.formatted,
          home: homeValidation.formatted,
          work: workValidation.formatted,
        },
      };
      
      await createUser(userProfile);
      
      // Store authentication credentials securely
      await SecureStore.setItemAsync('user_email', sanitizedEmail);
      await SecureStore.setItemAsync('user_salt', salt);
      await SecureStore.setItemAsync('user_password_hash', passwordHash);
      
      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobilePhone('');
      setHomePhone('');
      setWorkPhone('');
      setPassword('');
      setConfirmPassword('');
      
      logger.info('User registration successful', { email: sanitizedEmail });
      Alert.alert('Success', 'Account created successfully!', [
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Please provide your information</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name *"
          autoCapitalize="words"
          value={firstName}
          onChangeText={setFirstName}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name *"
          autoCapitalize="words"
          value={lastName}
          onChangeText={setLastName}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Email *"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Numbers</Text>
        <TextInput
          style={styles.input}
          placeholder="Mobile Phone * (Required)"
          keyboardType="phone-pad"
          value={mobilePhone}
          onChangeText={setMobilePhone}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Home Phone (Optional)"
          keyboardType="phone-pad"
          value={homePhone}
          onChangeText={setHomePhone}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Work Phone (Optional)"
          keyboardType="phone-pad"
          value={workPhone}
          onChangeText={setWorkPhone}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TextInput
          style={styles.input}
          placeholder="Password *"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <Text style={styles.passwordHint}>
          Min 12 characters, uppercase, lowercase, numbers, symbols
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password *"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
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
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    marginTop: -8,
    paddingHorizontal: 4,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  linkContainer: {
    marginTop: 20,
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

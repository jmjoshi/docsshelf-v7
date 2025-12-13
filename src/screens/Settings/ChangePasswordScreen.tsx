import { BottomNavBar } from '@/src/components/navigation/BottomNavBar';
import { getDatabase } from '@/src/services/database/dbInit';
import { CURRENT_USER_EMAIL_KEY, getUserPasswordHashKey, getUserSaltKey } from '@/src/utils/auth/secureStoreKeys';
import { generateSalt, hashPassword, verifyPassword } from '@/src/utils/crypto/passwordHash';
import { sanitizeEmail } from '@/src/utils/validators/emailValidator';
import { validatePassword } from '@/src/utils/validators/passwordValidator';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, label: '', color: '#8E8E93' };
    }

    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { score, label: 'Weak', color: '#FF3B30' };
    } else if (score <= 4) {
      return { score, label: 'Fair', color: '#FF9500' };
    } else if (score <= 5) {
      return { score, label: 'Good', color: '#34C759' };
    } else {
      return { score, label: 'Strong', color: '#00C7BE' };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const validateCurrentPassword = async (): Promise<boolean> => {
    if (!currentPassword.trim()) {
      setCurrentPasswordError('Current password is required');
      return false;
    }

    try {
      console.log('\n\n=== CHANGE PASSWORD START ===');
      console.log('Current password being validated (length):', currentPassword.length);
      console.log('Current password (first 5 chars):', currentPassword.substring(0, 5));
      
      // Get email directly from SecureStore and sanitize it (CRITICAL FIX)
      const rawEmail = await SecureStore.getItemAsync(CURRENT_USER_EMAIL_KEY);
      const email = rawEmail ? sanitizeEmail(rawEmail) : null;
      
      console.log('Retrieved email from CURRENT_USER_EMAIL_KEY (raw):', rawEmail);
      console.log('Sanitized email:', email);
      console.log('CURRENT_USER_EMAIL_KEY constant value:', CURRENT_USER_EMAIL_KEY);
      
      // Query database to see ALL registered users
      console.log('\n--- DATABASE QUERY: ALL USERS ---');
      const db = await getDatabase();
      const allUsers = await db.getAllAsync('SELECT id, email, created_at FROM users ORDER BY created_at');
      console.log('Total users in database:', allUsers.length);
      allUsers.forEach((user: any, index: number) => {
        console.log(`User ${index + 1}:`, { id: user.id, email: user.email, created_at: user.created_at });
      });
      
      // Check SecureStore for all found emails
      console.log('\n--- SECURESTORE CHECK FOR ALL USERS ---');
      for (const user of allUsers as any[]) {
        const saltKey = getUserSaltKey(user.email);
        const hashKey = getUserPasswordHashKey(user.email);
        const hasSalt = await SecureStore.getItemAsync(saltKey);
        const hasHash = await SecureStore.getItemAsync(hashKey);
        console.log(`${user.email}: salt=${!!hasSalt}, hash=${!!hasHash}`);
      }

      if (!email) {
        console.error('No email found in SecureStore');
        setCurrentPasswordError('User not found - please login again');
        return false;
      }

      // Retrieve stored credentials from SecureStore
      const storedSalt = await SecureStore.getItemAsync(getUserSaltKey(email));
      const storedHash = await SecureStore.getItemAsync(getUserPasswordHashKey(email));

      console.log('Stored salt exists:', !!storedSalt);
      console.log('Stored hash exists:', !!storedHash);

      if (!storedSalt || !storedHash) {
        console.error('Credentials not found in SecureStore');
        setCurrentPasswordError('User credentials not found - please login again');
        return false;
      }

      // TEST: Try verifying with the login flow to compare
      console.log('\n=== PASSWORD VERIFICATION TEST ===');
      console.log('Test 1: Direct verification');
      const testIsValid = await verifyPassword(currentPassword, storedSalt, storedHash);
      console.log('Direct verification result:', testIsValid);
      
      // Test 2: Manual hash computation
      console.log('\nTest 2: Manual hash computation');
      const manualHash = await hashPassword(currentPassword, storedSalt);
      console.log('Manual hash (first 20):', manualHash.substring(0, 20));
      console.log('Stored hash (first 20):', storedHash.substring(0, 20));
      console.log('Manual hashes match:', manualHash === storedHash);
      
      // Test 3: Character-by-character comparison
      console.log('\nTest 3: Character comparison');
      console.log('Password string:', currentPassword);
      console.log('Password bytes:', Array.from(currentPassword).map(c => c.charCodeAt(0)));
      console.log('Salt length:', storedSalt.length);
      console.log('Hash length:', storedHash.length);
      console.log('Computed hash length:', manualHash.length);
      
      // Find first difference
      let firstDiff = -1;
      for (let i = 0; i < Math.max(manualHash.length, storedHash.length); i++) {
        if (manualHash[i] !== storedHash[i]) {
          firstDiff = i;
          break;
        }
      }
      console.log('First difference at position:', firstDiff);
      if (firstDiff >= 0) {
        console.log(`Computed[${firstDiff}]: "${manualHash[firstDiff]}" (code: ${manualHash.charCodeAt(firstDiff)})`);
        console.log(`Stored[${firstDiff}]: "${storedHash[firstDiff]}" (code: ${storedHash.charCodeAt(firstDiff)})`);
      }
      
      const isValid = testIsValid;
      console.log('\n=== FINAL RESULT:', isValid, '===\n');
      
      if (!isValid) {
        setCurrentPasswordError('Current password is incorrect');
        return false;
      }

      setCurrentPasswordError('');
      return true;
    } catch (error) {
      console.error('Error validating current password:', error);
      setCurrentPasswordError('Error validating password');
      return false;
    }
  };

  const validateNewPassword = (): boolean => {
    const validation = validatePassword(newPassword);

    if (!validation.valid) {
      setNewPasswordError(validation.message || 'Invalid password');
      return false;
    }

    if (newPassword === currentPassword) {
      setNewPasswordError('New password must be different from current password');
      return false;
    }

    setNewPasswordError('');
    return true;
  };

  const validateConfirmPassword = (): boolean => {
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }

    if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }

    setConfirmPasswordError('');
    return true;
  };

  const handleChangePassword = async () => {
    console.log('Change password button clicked');
    
    // Clear previous errors
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    // Validate all fields
    console.log('Validating current password...');
    const isCurrentValid = await validateCurrentPassword();
    console.log('Current password valid:', isCurrentValid);
    
    console.log('Validating new password...');
    const isNewValid = validateNewPassword();
    console.log('New password valid:', isNewValid);
    
    console.log('Validating confirm password...');
    const isConfirmValid = validateConfirmPassword();
    console.log('Confirm password valid:', isConfirmValid);

    if (!isCurrentValid || !isNewValid || !isConfirmValid) {
      console.log('Validation failed, aborting password change');
      return;
    }

    setLoading(true);

    try {
      console.log('Getting current user email from SecureStore...');
      const rawEmail = await SecureStore.getItemAsync(CURRENT_USER_EMAIL_KEY);
      const email = rawEmail ? sanitizeEmail(rawEmail) : null;
      console.log('Current user email (raw):', rawEmail);
      console.log('Current user email (sanitized):', email);

      if (!email) {
        console.error('No email found in SecureStore');
        Alert.alert('Error', 'User not found - please login again');
        setLoading(false);
        return;
      }

      // Generate new salt for better security
      console.log('Generating new salt...');
      const newSalt = await generateSalt();
      console.log('New salt generated');

      // Hash new password with new salt
      console.log('Hashing new password...');
      const newPasswordHash = await hashPassword(newPassword, newSalt);
      console.log('New password hashed');

      // Update password credentials in SecureStore using sanitized email
      console.log('Updating SecureStore...');
      await SecureStore.setItemAsync(getUserSaltKey(email), newSalt);
      await SecureStore.setItemAsync(getUserPasswordHashKey(email), newPasswordHash);
      console.log('SecureStore updated successfully');

      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    currentPassword.trim() &&
    newPassword.trim() &&
    confirmPassword.trim() &&
    !currentPasswordError &&
    !newPasswordError &&
    !confirmPasswordError;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Choose a strong password with at least 12 characters, including uppercase, lowercase,
            numbers, and symbols.
          </Text>
        </View>

        {/* Current Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, currentPasswordError ? styles.inputError : null]}
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setCurrentPasswordError('');
              }}
              secureTextEntry={!showCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#8E8E93"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons
                name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>
          {currentPasswordError ? (
            <Text style={styles.errorText}>{currentPasswordError}</Text>
          ) : null}
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, newPasswordError ? styles.inputError : null]}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setNewPasswordError('');
              }}
              secureTextEntry={!showNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#8E8E93"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>
          {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}

          {/* Password Strength Indicator */}
          {newPassword ? (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    { width: `${(passwordStrength.score / 6) * 100}%`, backgroundColor: passwordStrength.color },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, confirmPasswordError ? styles.inputError : null]}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
              }}
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#8E8E93"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          ) : null}
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          style={[
            styles.changeButton,
            (!isFormValid || loading) && styles.changeButtonDisabled,
          ]}
          onPress={handleChangePassword}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.changeButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 250, // Extra space for bottom navigation and text wrapping on small screens
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    paddingRight: 48,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: 6,
  },
  strengthContainer: {
    marginTop: 12,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  changeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  changeButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  changeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
});

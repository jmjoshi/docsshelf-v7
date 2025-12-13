/**
 * Password Diagnostic Tool
 * Add this as a button in your app to diagnose password issues
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { hashPassword } from '../utils/crypto/passwordHash';
import { getUserSaltKey, getUserPasswordHashKey, CURRENT_USER_EMAIL_KEY } from '../constants/auth';

export default function PasswordDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<string>('');

  const runDiagnostics = async () => {
    let output = '=== PASSWORD DIAGNOSTICS ===\n\n';

    try {
      // 1. Get current user email
      const email = await SecureStore.getItemAsync(CURRENT_USER_EMAIL_KEY);
      output += `Current User Email: ${email || 'NOT FOUND'}\n\n`;

      if (email) {
        // 2. Get stored credentials
        const salt = await SecureStore.getItemAsync(getUserSaltKey(email));
        const storedHash = await SecureStore.getItemAsync(getUserPasswordHashKey(email));

        output += `Stored Salt: ${salt ? salt.substring(0, 20) + '...' : 'NOT FOUND'}\n`;
        output += `Stored Hash: ${storedHash ? storedHash.substring(0, 20) + '...' : 'NOT FOUND'}\n\n`;

        if (salt && storedHash) {
          // 3. Test with the password
          const testPassword = 'Test1234567!!';
          const computedHash = await hashPassword(testPassword, salt);

          output += `Test Password: ${testPassword}\n`;
          output += `Password Length: ${testPassword.length}\n\n`;
          output += `Computed Hash: ${computedHash.substring(0, 20)}...\n`;
          output += `Stored Hash:   ${storedHash.substring(0, 20)}...\n\n`;
          output += `Match: ${computedHash === storedHash ? 'YES ✓' : 'NO ✗'}\n\n`;

          if (computedHash !== storedHash) {
            output += '❌ HASHES DO NOT MATCH!\n\n';
            output += 'Full Computed Hash:\n' + computedHash + '\n\n';
            output += 'Full Stored Hash:\n' + storedHash + '\n\n';
            
            // Character-by-character comparison
            output += 'First difference at position: ';
            for (let i = 0; i < Math.min(computedHash.length, storedHash.length); i++) {
              if (computedHash[i] !== storedHash[i]) {
                output += `${i} (computed:'${computedHash[i]}' stored:'${storedHash[i]}')\n`;
                break;
              }
            }
          } else {
            output += '✓ HASHES MATCH - Password is correct!\n';
          }
        }
      }
    } catch (error: any) {
      output += `\n\nERROR: ${error.message}\n${error.stack}`;
    }

    setDiagnostics(output);
    console.log(output);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={runDiagnostics}>
        <Text style={styles.buttonText}>Run Password Diagnostics</Text>
      </TouchableOpacity>

      <ScrollView style={styles.output}>
        <Text style={styles.outputText}>{diagnostics}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  output: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
});

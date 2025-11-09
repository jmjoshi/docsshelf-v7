/**
 * Custom Splash Screen Component
 * Shows while app initializes to prevent white screen
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export function AppSplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DocsShelf</Text>
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      <Text style={styles.subtitle}>Loading your secure workspace...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});

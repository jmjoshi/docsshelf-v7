/**
 * Documents Tab Screen
 * Document list and search (placeholder for now)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DocumentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documents</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
      <Text style={styles.description}>
        Document management features will be added in the next phase.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

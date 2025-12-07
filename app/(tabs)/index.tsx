import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { getCurrentUserProfile } from '../../src/services/database/userService';
import { UserProfile } from '../../src/types/user';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const featureCards = [
    {
      id: 'categories',
      title: '📁 Categories',
      description: 'Organize documents with folders and subfolders',
      route: '/(tabs)/categories',
      color: '#4CAF50',
    },
    {
      id: 'documents',
      title: '📄 Documents',
      description: 'Upload, scan, and manage your documents',
      route: '/(tabs)/documents',
      color: '#2196F3',
    },
    {
      id: 'search',
      title: '🔍 Search',
      description: 'Find documents quickly with full-text search',
      route: '/(tabs)/documents',
      color: '#FF9800',
    },
    {
      id: 'settings',
      title: '⚙️ Settings',
      description: 'Manage your account and app preferences',
      route: '/(tabs)/explore',
      color: '#9C27B0',
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].headerBackground }]} edges={['top']}>
      <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].headerBackground }]}>
          <Text style={styles.welcomeText}>
            Welcome{userProfile ? `, ${userProfile.firstName}` : ''}! 👋
          </Text>
          <Text style={styles.subtitleText}>DocsShelf - Your Document Manager</Text>
        </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Text style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].tint }]}>0</Text>
          <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Documents</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Text style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].tint }]}>0</Text>
          <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Categories</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Text style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].tint }]}>0</Text>
          <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].text }]}>Tags</Text>
        </View>
      </View>

      {/* Feature Cards */}
      <View style={styles.featuresContainer}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Features</Text>
        {featureCards.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={[styles.featureCard, { borderLeftColor: feature.color, backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            onPress={() => router.push(feature.route as any)}
          >
            <Text style={[styles.featureTitle, { color: Colors[colorScheme ?? 'light'].text }]}>{feature.title}</Text>
            <Text style={[styles.featureDescription, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: '#ff3b30' }]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>DocsShelf v1.0.0</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  featuresContainer: {
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  featureCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  logoutContainer: {
    padding: 16,
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
  },
});
import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* Logo/Icon */}
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>📁</Text>
        </View>
      </View>

      {/* App Name */}
      <Text style={styles.appName}>DocsShelf</Text>
      <Text style={styles.tagline}>Secure Document Management</Text>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconText: {
    fontSize: 64,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 48,
  },
  version: {
    position: 'absolute',
    bottom: 32,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

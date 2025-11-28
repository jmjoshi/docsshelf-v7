/**
 * Welcome Tutorial Component
 * First-time user onboarding with swipeable screens
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TutorialScreen {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
}

const tutorialScreens: TutorialScreen[] = [
  {
    id: '1',
    icon: 'lock.shield.fill',
    iconColor: '#10b981',
    title: 'Secure & Private',
    description: 'Your documents are encrypted with military-grade AES-256 encryption. Only you have the keys.',
  },
  {
    id: '2',
    icon: 'camera.fill',
    iconColor: '#3b82f6',
    title: 'Scan Documents',
    description: 'Use your camera to scan documents, receipts, and photos. Create multi-page PDFs easily.',
  },
  {
    id: '3',
    icon: 'folder.fill',
    iconColor: '#8b5cf6',
    title: 'Stay Organized',
    description: 'Organize documents with categories, tags, and favorites. Find anything with powerful search.',
  },
  {
    id: '4',
    icon: 'arrow.clockwise.icloud.fill',
    iconColor: '#f59e0b',
    title: 'Backup & Sync',
    description: 'Create encrypted backups to USB drives or cloud storage. Never lose your important documents.',
  },
  {
    id: '5',
    icon: 'checkmark.circle.fill',
    iconColor: '#10b981',
    title: 'Ready to Start',
    description: 'You\'re all set! Start uploading and organizing your documents securely.',
  },
];

interface WelcomeTutorialProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const WelcomeTutorial: React.FC<WelcomeTutorialProps> = ({ onComplete, onSkip }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get('window');

  const isLastScreen = currentIndex === tutorialScreens.length - 1;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (isLastScreen) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    onSkip ? onSkip() : onComplete();
  };

  const renderScreen = ({ item }: { item: TutorialScreen }) => (
    <View style={[styles.screen, { width }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '20' }]}>
        <IconSymbol name={item.icon as any} size={80} color={item.iconColor} />
      </View>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        {item.title}
      </Text>
      <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        {item.description}
      </Text>
    </View>
  );

  const renderDot = (index: number) => (
    <View
      key={index}
      style={[
        styles.dot,
        {
          backgroundColor:
            index === currentIndex
              ? Colors.primary
              : isDark
              ? '#404040'
              : '#d1d5db',
        },
      ]}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      edges={['top', 'bottom']}>
      {/* Skip Button */}
      {!isLastScreen && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={[styles.skipText, { color: Colors.primary }]}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Tutorial Screens */}
      <FlatList
        ref={flatListRef}
        data={tutorialScreens}
        renderItem={renderScreen}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {tutorialScreens.map((_, index) => renderDot(index))}
      </View>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>{isLastScreen ? 'Get Started' : 'Next'}</Text>
          {!isLastScreen && (
            <IconSymbol name="chevron.right" size={20} color="#ffffff" style={styles.buttonIcon} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

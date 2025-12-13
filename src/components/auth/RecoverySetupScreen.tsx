/**
 * Recovery Setup Screen
 * Allows users to select 1-2 password recovery methods during registration
 */

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import {
  generateRecoveryPhrase,
  getRecoveryMethodName,
  getRecoveryWarningMessage,
  hashRecoveryPhrase,
  hashRecoveryPin,
  hashSecurityAnswer,
  SECURITY_QUESTIONS,
  SecurityQuestion,
  validatePinFormat,
  type RecoveryMethod,
  type RecoverySetup,
} from '../../services/auth/recoveryService';

interface RecoverySetupScreenProps {
  visible: boolean;
  onComplete: (setup: RecoverySetup) => void;
  onSkip: () => void;
}

export default function RecoverySetupScreen({
  visible,
  onComplete,
  onSkip,
}: RecoverySetupScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Step management
  const [step, setStep] = useState<'select' | 'phrase' | 'pin' | 'questions' | 'confirm'>('select');

  // Selected methods
  const [selectedMethods, setSelectedMethods] = useState<RecoveryMethod[]>([]);

  // Recovery phrase
  const [recoveryPhrase, setRecoveryPhrase] = useState<string>('');
  const [phraseConfirmed, setPhraseConfirmed] = useState(false);

  // Recovery PIN
  const [recoveryPin, setRecoveryPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Security questions
  const [securityQuestionsData, setSecurityQuestionsData] = useState<
    Array<{ question: string; answer: string }>
  >([
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);

  const toggleMethod = (method: RecoveryMethod) => {
    if (selectedMethods.includes(method)) {
      setSelectedMethods(selectedMethods.filter((m) => m !== method));
    } else {
      if (selectedMethods.length >= 2) {
        Alert.alert('Maximum Reached', 'You can select up to 2 recovery methods.');
        return;
      }
      setSelectedMethods([...selectedMethods, method]);
    }
  };

  const handleGeneratePhrase = async () => {
    const phrase = await generateRecoveryPhrase();
    setRecoveryPhrase(phrase);
  };

  const handleCopyPhrase = async () => {
    await Clipboard.setStringAsync(recoveryPhrase);
    Alert.alert('Copied', 'Recovery phrase copied to clipboard. Please save it in a secure location.');
  };

  const handleNextFromSelect = () => {
    if (selectedMethods.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one recovery method.');
      return;
    }

    // Go to first selected method's setup
    if (selectedMethods.includes('phrase')) {
      setStep('phrase');
      handleGeneratePhrase();
    } else if (selectedMethods.includes('pin')) {
      setStep('pin');
    } else if (selectedMethods.includes('questions')) {
      setStep('questions');
    }
  };

  const handleNextFromPhrase = () => {
    if (!phraseConfirmed) {
      Alert.alert('Confirmation Required', 'Please confirm that you have saved your recovery phrase.');
      return;
    }

    // Go to next selected method or confirm
    if (selectedMethods.includes('pin')) {
      setStep('pin');
    } else if (selectedMethods.includes('questions')) {
      setStep('questions');
    } else {
      setStep('confirm');
    }
  };

  const handleNextFromPin = () => {
    const validation = validatePinFormat(recoveryPin);
    if (!validation.valid) {
      setPinError(validation.error || 'Invalid PIN');
      return;
    }

    if (recoveryPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }

    setPinError('');

    // Go to next selected method or confirm
    if (selectedMethods.includes('questions')) {
      setStep('questions');
    } else {
      setStep('confirm');
    }
  };

  const handleNextFromQuestions = () => {
    // Validate questions
    if (!securityQuestionsData[0].question || !securityQuestionsData[0].answer) {
      Alert.alert('Incomplete', 'Please answer the first security question.');
      return;
    }
    if (!securityQuestionsData[1].question || !securityQuestionsData[1].answer) {
      Alert.alert('Incomplete', 'Please answer the second security question.');
      return;
    }

    if (securityQuestionsData[0].question === securityQuestionsData[1].question) {
      Alert.alert('Duplicate Questions', 'Please select different security questions.');
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = async () => {
    try {
      const setup: RecoverySetup = {
        methods: selectedMethods,
      };

      // Hash recovery phrase
      if (selectedMethods.includes('phrase') && recoveryPhrase) {
        setup.phraseHash = await hashRecoveryPhrase(recoveryPhrase);
        setup.phrase = recoveryPhrase; // Return once for user to save
      }

      // Hash recovery PIN
      if (selectedMethods.includes('pin') && recoveryPin) {
        setup.pinHash = await hashRecoveryPin(recoveryPin);
      }

      // Hash security questions
      if (selectedMethods.includes('questions')) {
        const questions: SecurityQuestion[] = [];
        for (const q of securityQuestionsData) {
          if (q.question && q.answer) {
            questions.push({
              question: q.question,
              answerHash: await hashSecurityAnswer(q.answer),
            });
          }
        }
        setup.securityQuestions = questions;
      }

      onComplete(setup);
    } catch (error) {
      console.error('Recovery setup error:', error);
      Alert.alert('Error', 'Failed to set up recovery methods. Please try again.');
    }
  };

  const renderMethodSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: colors.text }]}>Select Recovery Methods</Text>
      <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
        Choose 1-2 methods to recover your password if you forget it
      </Text>

      <View style={styles.methodsContainer}>
        {/* Recovery Phrase */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            { backgroundColor: colors.background, borderColor: colors.border },
            selectedMethods.includes('phrase') && styles.methodCardSelected,
          ]}
          onPress={() => toggleMethod('phrase')}
        >
          <View style={styles.methodHeader}>
            <Ionicons
              name={selectedMethods.includes('phrase') ? 'checkbox' : 'square-outline'}
              size={24}
              color={selectedMethods.includes('phrase') ? colors.tint : colors.tabIconDefault}
            />
            <Text style={[styles.methodTitle, { color: colors.text }]}>Recovery Phrase</Text>
          </View>
          <Text style={[styles.methodDescription, { color: colors.tabIconDefault }]}>
            12-word phrase • Most secure • Write it down
          </Text>
          <View style={[styles.recommendedBadge, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.recommendedText}>⭐ Recommended</Text>
          </View>
        </TouchableOpacity>

        {/* Recovery PIN */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            { backgroundColor: colors.background, borderColor: colors.border },
            selectedMethods.includes('pin') && styles.methodCardSelected,
          ]}
          onPress={() => toggleMethod('pin')}
        >
          <View style={styles.methodHeader}>
            <Ionicons
              name={selectedMethods.includes('pin') ? 'checkbox' : 'square-outline'}
              size={24}
              color={selectedMethods.includes('pin') ? colors.tint : colors.tabIconDefault}
            />
            <Text style={[styles.methodTitle, { color: colors.text }]}>Recovery PIN</Text>
          </View>
          <Text style={[styles.methodDescription, { color: colors.tabIconDefault }]}>
            4-6 digit PIN • Easy to remember • Memorize it
          </Text>
        </TouchableOpacity>

        {/* Security Questions */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            { backgroundColor: colors.background, borderColor: colors.border },
            selectedMethods.includes('questions') && styles.methodCardSelected,
          ]}
          onPress={() => toggleMethod('questions')}
        >
          <View style={styles.methodHeader}>
            <Ionicons
              name={selectedMethods.includes('questions') ? 'checkbox' : 'square-outline'}
              size={24}
              color={selectedMethods.includes('questions') ? colors.tint : colors.tabIconDefault}
            />
            <Text style={[styles.methodTitle, { color: colors.text }]}>Security Questions</Text>
          </View>
          <Text style={[styles.methodDescription, { color: colors.tabIconDefault }]}>
            2 questions • Traditional method • Remember answers
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.warningBox}>
        <Ionicons name="warning" size={20} color="#FF9500" />
        <Text style={[styles.warningText, { color: colors.text }]}>
          Without recovery methods, you{' '}
          <Text style={{ fontWeight: 'bold' }}>cannot recover your password</Text>. Choose carefully!
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleNextFromSelect}>
          <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
            Next
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.skipButton]} onPress={onSkip}>
          <Text style={[styles.skipButtonText, { color: colors.tint }]}>Skip (Not Recommended)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPhraseSetup = () => (
    <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 250 }}>
      <Text style={[styles.title, { color: colors.text }]}>Your Recovery Phrase</Text>
      <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
        Write down these 12 words in order and store them safely
      </Text>

      <View style={[styles.phraseContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.phraseText, { color: colors.text }]}>{recoveryPhrase}</Text>
      </View>

      <TouchableOpacity
        style={[styles.copyButton, { backgroundColor: colors.tint }]}
        onPress={handleCopyPhrase}
      >
        <Ionicons name="copy-outline" size={20} color={colorScheme === 'dark' ? '#000' : '#fff'} />
        <Text style={[styles.copyButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
          Copy to Clipboard
        </Text>
      </TouchableOpacity>

      <View style={styles.warningBox}>
        <Ionicons name="alert-circle" size={24} color="#FF3B30" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.warningTitle, { color: '#FF3B30' }]}>CRITICAL: Save This Phrase</Text>
          <Text style={[styles.warningText, { color: colors.text }]}>
            • Write it on paper and store securely{'\n'}
            • Never share with anyone{'\n'}
            • This screen won't appear again{'\n'}
            • Without it, password recovery is impossible
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkboxRow]}
        onPress={() => setPhraseConfirmed(!phraseConfirmed)}
      >
        <Ionicons
          name={phraseConfirmed ? 'checkbox' : 'square-outline'}
          size={24}
          color={phraseConfirmed ? colors.tint : colors.tabIconDefault}
        />
        <Text style={[styles.checkboxText, { color: colors.text }]}>
          I have safely written down my recovery phrase
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: phraseConfirmed ? colors.tint : colors.tabIconDefault }]}
        onPress={handleNextFromPhrase}
        disabled={!phraseConfirmed}
      >
        <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
          Next
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPinSetup = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: colors.text }]}>Set Recovery PIN</Text>
      <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
        Enter a 4-6 digit PIN to recover your password
      </Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Enter PIN (4-6 digits)"
        placeholderTextColor={colors.tabIconDefault}
        value={recoveryPin}
        onChangeText={(text) => {
          setRecoveryPin(text);
          setPinError('');
        }}
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Confirm PIN"
        placeholderTextColor={colors.tabIconDefault}
        value={confirmPin}
        onChangeText={(text) => {
          setConfirmPin(text);
          setPinError('');
        }}
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
      />

      {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}

      <View style={styles.warningBox}>
        <Ionicons name="information-circle" size={20} color="#007AFF" />
        <Text style={[styles.warningText, { color: colors.text }]}>
          • Avoid common patterns (1234, 0000){'\n'}
          • Memorize your PIN{'\n'}
          • Do not write it where others can see
        </Text>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleNextFromPin}>
        <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuestionsSetup = () => (
    <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 250 }}>
      <Text style={[styles.title, { color: colors.text }]}>Security Questions</Text>
      <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
        Select and answer 2 security questions
      </Text>

      {securityQuestionsData.map((q, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={[styles.questionLabel, { color: colors.text }]}>Question {index + 1}</Text>

          <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                Alert.alert(
                  'Select Question',
                  '',
                  SECURITY_QUESTIONS.map((question) => ({
                    text: question,
                    onPress: () => {
                      const newData = [...securityQuestionsData];
                      newData[index].question = question;
                      setSecurityQuestionsData(newData);
                    },
                  }))
                );
              }}
            >
              <Text style={[styles.pickerText, { color: q.question ? colors.text : colors.tabIconDefault }]}>
                {q.question || 'Select a question...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Your answer"
            placeholderTextColor={colors.tabIconDefault}
            value={q.answer}
            onChangeText={(text) => {
              const newData = [...securityQuestionsData];
              newData[index].answer = text;
              setSecurityQuestionsData(newData);
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ))}

      <View style={styles.warningBox}>
        <Ionicons name="information-circle" size={20} color="#007AFF" />
        <Text style={[styles.warningText, { color: colors.text }]}>
          • Answers are case-insensitive{'\n'}
          • Remember your exact answers{'\n'}
          • Choose questions you'll remember years from now
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.tint }]}
        onPress={handleNextFromQuestions}
      >
        <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
          Next
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderConfirmation = () => (
    <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 250 }}>
      <Text style={[styles.title, { color: colors.text }]}>Confirm Recovery Setup</Text>

      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>Selected Methods:</Text>
        {selectedMethods.map((method) => (
          <View key={method} style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.summaryText, { color: colors.text }]}>
              {getRecoveryMethodName(method)}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.finalWarningBox, { backgroundColor: '#FF3B3020', borderColor: '#FF3B30' }]}>
        <Ionicons name="alert-circle" size={32} color="#FF3B30" />
        <Text style={[styles.finalWarningTitle, { color: '#FF3B30' }]}>Final Warning</Text>
        <Text style={[styles.finalWarningText, { color: colors.text }]}>
          {getRecoveryWarningMessage(selectedMethods)}
        </Text>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleConfirm}>
        <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
          I Understand - Complete Setup
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
        {step === 'select' && renderMethodSelection()}
        {step === 'phrase' && renderPhraseSetup()}
        {step === 'pin' && renderPinSetup()}
        {step === 'questions' && renderQuestionsSetup()}
        {step === 'confirm' && renderConfirmation()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  methodsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  methodCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  methodCardSelected: {
    borderColor: '#007AFF',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  methodDescription: {
    fontSize: 14,
    marginLeft: 36,
  },
  recommendedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    marginLeft: 36,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FF950020',
    gap: 12,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
  },
  phraseContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
  },
  phraseText: {
    fontSize: 16,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 16,
    flex: 1,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
  },
  finalWarningBox: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 24,
  },
  finalWarningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
  },
  finalWarningText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});

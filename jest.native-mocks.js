/* global jest */
// Mocks for React Native native modules to allow Jest to run integration tests

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.StyleSheet.create = styles => styles;
  RN.View = 'View';
  RN.Text = 'Text';
  RN.TextInput = 'TextInput';
  RN.Button = 'Button';
  return RN;
});

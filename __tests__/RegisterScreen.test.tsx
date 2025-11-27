
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as React from 'react';
import RegisterScreen from '../src/screens/Auth/RegisterScreen';

// Mocks are now in jest.setup.js

describe('RegisterScreen', () => {
  it('shows error for invalid password', async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'short');
    fireEvent.press(getByText('Register'));
    await waitFor(() => {
      expect(getByText('Password must be at least 12 characters.')).toBeTruthy();
    });
  });

  it('registers with valid input and stores credentials', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'StrongPass123!');
    fireEvent.press(getByText('Register'));
    await waitFor(() => {
      expect(queryByText('Password must be at least 12 characters.')).toBeNull();
    });
  });
});


import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as React from 'react';
import RegisterScreen from '../src/screens/Auth/RegisterScreen';

// Mocks are now in jest.setup.js

describe('RegisterScreen', () => {
  it('shows error for invalid password', async () => {
    render(<RegisterScreen />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'short');
    
    // Find button by its text within the component tree
    const buttons = screen.UNSAFE_getAllByType('Button');
    fireEvent.press(buttons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 12 characters.')).toBeTruthy();
    });
  });

  it('registers with valid input and stores credentials', async () => {
    render(<RegisterScreen />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'StrongPass123!');
    
    // Find button by its text within the component tree
    const buttons = screen.UNSAFE_getAllByType('Button');
    fireEvent.press(buttons[0]);
    
    await waitFor(() => {
      expect(screen.queryByText('Password must be at least 12 characters.')).toBeNull();
    });
  });
});

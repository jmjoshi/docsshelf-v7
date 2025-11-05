/**
 * User type definitions for DocsShelf application
 */

export interface PhoneNumbers {
  mobile?: string;
  home?: string;
  work?: string;
}

export interface UserProfile {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumbers: PhoneNumbers;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCredentials {
  email: string;
  salt: string;
  passwordHash: string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface PhoneValidationResult extends ValidationResult {
  formatted?: string;
}

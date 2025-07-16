import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  getPasswordStrength,
  validateSignUpForm,
  validateSignInForm
} from './validation';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toEqual({ isValid: true });
    expect(validateEmail('user.name@domain.co.uk')).toEqual({ isValid: true });
    expect(validateEmail('test+tag@example.org')).toEqual({ isValid: true });
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('')).toEqual({ 
      isValid: false, 
      message: 'Email is required' 
    });
    expect(validateEmail('invalid-email')).toEqual({ 
      isValid: false, 
      message: 'Please enter a valid email address' 
    });
    expect(validateEmail('test@')).toEqual({ 
      isValid: false, 
      message: 'Please enter a valid email address' 
    });
  });
});

describe('validatePassword', () => {
  it('should validate strong passwords', () => {
    expect(validatePassword('StrongPass123!')).toEqual({ isValid: true });
    expect(validatePassword('MySecure@Pass1')).toEqual({ isValid: true });
  });

  it('should reject weak passwords', () => {
    expect(validatePassword('')).toEqual({ 
      isValid: false, 
      message: 'Password is required' 
    });
    expect(validatePassword('short')).toEqual({ 
      isValid: false, 
      message: 'Password must be at least 8 characters long' 
    });
    expect(validatePassword('nouppercase123!')).toEqual({ 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter' 
    });
    expect(validatePassword('NOLOWERCASE123!')).toEqual({ 
      isValid: false, 
      message: 'Password must contain at least one lowercase letter' 
    });
    expect(validatePassword('NoNumbers!')).toEqual({ 
      isValid: false, 
      message: 'Password must contain at least one number' 
    });
    expect(validatePassword('NoSpecialChars123')).toEqual({ 
      isValid: false, 
      message: 'Password must contain at least one special character' 
    });
  });
});

describe('validatePasswordConfirmation', () => {
  it('should validate matching passwords', () => {
    expect(validatePasswordConfirmation('password123', 'password123')).toEqual({ 
      isValid: true 
    });
  });

  it('should reject non-matching passwords', () => {
    expect(validatePasswordConfirmation('password123', 'different123')).toEqual({ 
      isValid: false, 
      message: 'Passwords do not match' 
    });
    expect(validatePasswordConfirmation('password123', '')).toEqual({ 
      isValid: false, 
      message: 'Please confirm your password' 
    });
  });
});

describe('getPasswordStrength', () => {
  it('should return weak for simple passwords', () => {
    const result = getPasswordStrength('weak');
    expect(result.level).toBe('weak');
    expect(result.score).toBeLessThanOrEqual(2);
  });

  it('should return strong for complex passwords', () => {
    const result = getPasswordStrength('VeryStrong123!@#');
    expect(result.level).toBe('strong');
    expect(result.score).toBeGreaterThan(4);
  });

  it('should provide helpful feedback', () => {
    const result = getPasswordStrength('simple');
    expect(result.feedback).toContain('One uppercase letter');
    expect(result.feedback).toContain('One number');
    expect(result.feedback).toContain('One special character');
  });
});

describe('validateSignUpForm', () => {
  it('should validate correct sign-up form', () => {
    const result = validateSignUpForm('test@example.com', 'StrongPass123!', 'StrongPass123!');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should return errors for invalid form', () => {
    const result = validateSignUpForm('invalid-email', 'weak', 'different');
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
    expect(result.errors.password).toBeDefined();
    expect(result.errors.confirmPassword).toBeDefined();
  });
});

describe('validateSignInForm', () => {
  it('should validate correct sign-in form', () => {
    const result = validateSignInForm('test@example.com', 'anypassword');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should return errors for invalid form', () => {
    const result = validateSignInForm('invalid-email', '');
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
    expect(result.errors.password).toBeDefined();
  });
});
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthServiceImpl } from './auth.service';
import { AuthError, AuthErrorType } from '../errors';
import { cryptoService } from './crypto.service';
import { storageService } from './storage.service';

// Mock the dependencies
vi.mock('./crypto.service');
vi.mock('./storage.service');

const mockCryptoService = vi.mocked(cryptoService);
const mockStorageService = vi.mocked(storageService);

describe('AuthService', () => {
  let authService: AuthServiceImpl;

  beforeEach(() => {
    authService = new AuthServiceImpl();
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    const validEmail = 'test@example.com';
    const validPassword = 'password123';
    const hashedPassword = 'hashed_password_123';
    const sessionToken = 'session_token_123';

    beforeEach(() => {
      mockCryptoService.hashPassword.mockResolvedValue(hashedPassword);
      mockCryptoService.generateSessionToken.mockReturnValue(sessionToken);
      mockStorageService.userExists.mockReturnValue(false);
      mockStorageService.storeUser.mockImplementation(() => {});
      mockStorageService.storeSession.mockImplementation(() => {});
    });

    it('should successfully register a new user with valid credentials', async () => {
      const user = await authService.signUp(validEmail, validPassword);

      expect(user).toEqual({
        email: validEmail,
        sessionToken,
        createdAt: expect.any(String)
      });

      expect(mockCryptoService.hashPassword).toHaveBeenCalledWith(validPassword);
      expect(mockStorageService.userExists).toHaveBeenCalledWith(validEmail);
      expect(mockStorageService.storeUser).toHaveBeenCalledWith(validEmail, hashedPassword);
      expect(mockStorageService.storeSession).toHaveBeenCalledWith(user);
    });

    it('should throw INVALID_EMAIL error for invalid email format', async () => {
      const invalidEmails = ['invalid-email', 'test@', '@example.com', 'test.example.com'];

      for (const email of invalidEmails) {
        await expect(authService.signUp(email, validPassword))
          .rejects
          .toThrow(new AuthError(AuthErrorType.INVALID_EMAIL, 'Please enter a valid email address'));
      }
    });

    it('should throw WEAK_PASSWORD error for passwords shorter than 8 characters', async () => {
      const weakPasswords = ['', '1234567', 'short'];

      for (const password of weakPasswords) {
        await expect(authService.signUp(validEmail, password))
          .rejects
          .toThrow(new AuthError(AuthErrorType.WEAK_PASSWORD, 'Password must be at least 8 characters long'));
      }
    });

    it('should throw EMAIL_EXISTS error when user already exists', async () => {
      mockStorageService.userExists.mockReturnValue(true);

      await expect(authService.signUp(validEmail, validPassword))
        .rejects
        .toThrow(new AuthError(AuthErrorType.EMAIL_EXISTS, 'Email already registered'));
    });

    it('should throw STORAGE_ERROR when localStorage operations fail', async () => {
      const storageError = new Error('localStorage is not available');
      mockStorageService.storeUser.mockImplementation(() => {
        throw storageError;
      });

      await expect(authService.signUp(validEmail, validPassword))
        .rejects
        .toThrow(new AuthError(AuthErrorType.STORAGE_ERROR, 'Unable to save data. Please try again.'));
    });

    it('should throw CRYPTO_ERROR when password hashing fails', async () => {
      mockCryptoService.hashPassword.mockRejectedValue(new Error('Crypto operation failed'));

      await expect(authService.signUp(validEmail, validPassword))
        .rejects
        .toThrow(new AuthError(AuthErrorType.CRYPTO_ERROR, 'Security operation failed. Please try again.'));
    });
  });

  describe('signIn', () => {
    const validEmail = 'test@example.com';
    const validPassword = 'password123';
    const hashedPassword = 'hashed_password_123';
    const sessionToken = 'session_token_123';
    const createdAt = '2023-01-01T00:00:00.000Z';

    const storedUser = {
      email: validEmail,
      hashedPassword,
      createdAt
    };

    beforeEach(() => {
      mockStorageService.getUser.mockReturnValue(storedUser);
      mockCryptoService.comparePasswords.mockResolvedValue(true);
      mockCryptoService.generateSessionToken.mockReturnValue(sessionToken);
      mockStorageService.storeSession.mockImplementation(() => {});
    });

    it('should successfully authenticate user with valid credentials', async () => {
      const user = await authService.signIn(validEmail, validPassword);

      expect(user).toEqual({
        email: validEmail,
        sessionToken,
        createdAt
      });

      expect(mockStorageService.getUser).toHaveBeenCalledWith(validEmail);
      expect(mockCryptoService.comparePasswords).toHaveBeenCalledWith(validPassword, hashedPassword);
      expect(mockStorageService.storeSession).toHaveBeenCalledWith(user);
    });

    it('should throw INVALID_CREDENTIALS error for invalid email format', async () => {
      const invalidEmails = ['invalid-email', 'test@', '@example.com'];

      for (const email of invalidEmails) {
        await expect(authService.signIn(email, validPassword))
          .rejects
          .toThrow(new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password'));
      }
    });

    it('should throw INVALID_CREDENTIALS error when user does not exist', async () => {
      mockStorageService.getUser.mockReturnValue(null);

      await expect(authService.signIn(validEmail, validPassword))
        .rejects
        .toThrow(new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password'));
    });

    it('should throw INVALID_CREDENTIALS error when password is incorrect', async () => {
      mockCryptoService.comparePasswords.mockResolvedValue(false);

      await expect(authService.signIn(validEmail, validPassword))
        .rejects
        .toThrow(new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password'));
    });

    it('should throw STORAGE_ERROR when storage operations fail', async () => {
      const storageError = new Error('localStorage is not available');
      mockStorageService.getUser.mockImplementation(() => {
        throw storageError;
      });

      await expect(authService.signIn(validEmail, validPassword))
        .rejects
        .toThrow(new AuthError(AuthErrorType.STORAGE_ERROR, 'Unable to access stored data. Please try again.'));
    });

    it('should throw CRYPTO_ERROR when password comparison fails', async () => {
      mockCryptoService.comparePasswords.mockRejectedValue(new Error('Crypto operation failed'));

      await expect(authService.signIn(validEmail, validPassword))
        .rejects
        .toThrow(new AuthError(AuthErrorType.CRYPTO_ERROR, 'Security operation failed. Please try again.'));
    });
  });

  describe('signOut', () => {
    it('should clear session successfully', () => {
      mockStorageService.clearSession.mockImplementation(() => {});

      expect(() => authService.signOut()).not.toThrow();
      expect(mockStorageService.clearSession).toHaveBeenCalled();
    });

    it('should not throw error even if clearing session fails', () => {
      mockStorageService.clearSession.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => authService.signOut()).not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      email: 'test@example.com',
      sessionToken: 'token123',
      createdAt: '2023-01-01T00:00:00.000Z'
    };

    it('should return current user when session exists', () => {
      mockStorageService.getSession.mockReturnValue(mockUser);

      const result = authService.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockStorageService.getSession).toHaveBeenCalled();
    });

    it('should return null when no session exists', () => {
      mockStorageService.getSession.mockReturnValue(null);

      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null when storage operation fails', () => {
      mockStorageService.getSession.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isValidSession', () => {
    const sessionToken = 'valid_token_123';
    const mockUser = {
      email: 'test@example.com',
      sessionToken,
      createdAt: '2023-01-01T00:00:00.000Z'
    };

    it('should return true for valid session token', () => {
      mockStorageService.getSession.mockReturnValue(mockUser);

      const result = authService.isValidSession(sessionToken);

      expect(result).toBe(true);
    });

    it('should return false when no current user exists', () => {
      mockStorageService.getSession.mockReturnValue(null);

      const result = authService.isValidSession(sessionToken);

      expect(result).toBe(false);
    });

    it('should return false when session token does not match', () => {
      mockStorageService.getSession.mockReturnValue(mockUser);

      const result = authService.isValidSession('different_token');

      expect(result).toBe(false);
    });

    it('should return false when storage operation fails', () => {
      mockStorageService.getSession.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = authService.isValidSession(sessionToken);

      expect(result).toBe(false);
    });
  });

  describe('userExists', () => {
    const email = 'test@example.com';

    it('should return true when user exists', () => {
      mockStorageService.userExists.mockReturnValue(true);

      const result = authService.userExists(email);

      expect(result).toBe(true);
      expect(mockStorageService.userExists).toHaveBeenCalledWith(email);
    });

    it('should return false when user does not exist', () => {
      mockStorageService.userExists.mockReturnValue(false);

      const result = authService.userExists(email);

      expect(result).toBe(false);
    });

    it('should return false when storage operation fails', () => {
      mockStorageService.userExists.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = authService.userExists(email);

      expect(result).toBe(false);
    });
  });

  describe('email validation', () => {
    it('should validate correct email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      mockStorageService.userExists.mockReturnValue(false);
      mockCryptoService.hashPassword.mockResolvedValue('hashed');
      mockCryptoService.generateSessionToken.mockReturnValue('token');

      for (const email of validEmails) {
        await expect(authService.signUp(email, 'password123')).resolves.toBeDefined();
      }
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'missing@domain',
        'spaces @domain.com',
        'double@@domain.com'
      ];

      for (const email of invalidEmails) {
        await expect(authService.signUp(email, 'password123'))
          .rejects
          .toThrow(AuthError);
      }
    });
  });

  describe('password validation', () => {
    const validEmail = 'test@example.com';

    it('should accept passwords with 8 or more characters', async () => {
      const validPasswords = [
        'password',
        'password123',
        'verylongpassword',
        '12345678'
      ];

      mockStorageService.userExists.mockReturnValue(false);
      mockCryptoService.hashPassword.mockResolvedValue('hashed');
      mockCryptoService.generateSessionToken.mockReturnValue('token');

      for (const password of validPasswords) {
        await expect(authService.signUp(validEmail, password)).resolves.toBeDefined();
      }
    });

    it('should reject passwords shorter than 8 characters', async () => {
      const invalidPasswords = [
        '',
        '1',
        '1234567',
        'short'
      ];

      for (const password of invalidPasswords) {
        await expect(authService.signUp(validEmail, password))
          .rejects
          .toThrow(new AuthError(AuthErrorType.WEAK_PASSWORD, 'Password must be at least 8 characters long'));
      }
    });
  });
});
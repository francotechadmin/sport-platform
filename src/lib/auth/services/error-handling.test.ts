import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authService } from './auth.service';
import { AuthError, AuthErrorType } from '../errors';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Auth Service Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock to working state
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Storage Availability', () => {
    it('should throw STORAGE_ERROR when localStorage is not available during signUp', async () => {
      // Mock localStorage to throw an error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      await expect(
        authService.signUp('test@example.com', 'password123')
      ).rejects.toThrow(AuthError);

      try {
        await authService.signUp('test@example.com', 'password123');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).type).toBe(AuthErrorType.STORAGE_ERROR);
        expect((error as AuthError).message).toContain('Browser storage is not available');
      }
    });

    it('should throw STORAGE_ERROR when localStorage is not available during signIn', async () => {
      // Mock localStorage setItem to fail (this will make isStorageAvailable return false)
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      await expect(
        authService.signIn('test@example.com', 'password123')
      ).rejects.toThrow(AuthError);

      try {
        await authService.signIn('test@example.com', 'password123');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).type).toBe(AuthErrorType.STORAGE_ERROR);
        expect((error as AuthError).message).toContain('Browser storage is not available');
      }
    });
  });

  describe('Input Validation Errors', () => {
    it('should throw INVALID_EMAIL for invalid email format during signUp', async () => {
      await expect(
        authService.signUp('invalid-email', 'password123')
      ).rejects.toThrow(AuthError);

      try {
        await authService.signUp('invalid-email', 'password123');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).type).toBe(AuthErrorType.INVALID_EMAIL);
      }
    });

    it('should throw WEAK_PASSWORD for short password during signUp', async () => {
      await expect(
        authService.signUp('test@example.com', '123')
      ).rejects.toThrow(AuthError);

      try {
        await authService.signUp('test@example.com', '123');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).type).toBe(AuthErrorType.WEAK_PASSWORD);
      }
    });

    it('should throw INVALID_CREDENTIALS for invalid email during signIn', async () => {
      await expect(
        authService.signIn('invalid-email', 'password123')
      ).rejects.toThrow(AuthError);

      try {
        await authService.signIn('invalid-email', 'password123');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).type).toBe(AuthErrorType.INVALID_CREDENTIALS);
      }
    });
  });

  describe('User Existence Errors', () => {
    it('should throw EMAIL_EXISTS when user already exists during signUp', async () => {
      // Mock existing user
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          'test@example.com': {
            hashedPassword: 'hashedPassword',
            createdAt: '2023-01-01T00:00:00.000Z'
          }
        })
      );

      await expect(
        authService.signUp('test@example.com', 'password123')
      ).rejects.toThrow(AuthError);

      try {
        await authService.signUp('test@example.com', 'password123');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).type).toBe(AuthErrorType.EMAIL_EXISTS);
      }
    });

    it('should throw INVALID_CREDENTIALS when user does not exist during signIn', async () => {
      // Mock empty users storage
      localStorageMock.getItem.mockReturnValue('{}');

      await expect(
        authService.signIn('nonexistent@example.com', 'password123')
      ).rejects.toThrow(AuthError);

      try {
        await authService.signIn('nonexistent@example.com', 'password123');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).type).toBe(AuthErrorType.INVALID_CREDENTIALS);
      }
    });
  });

  describe('Session Management', () => {
    it('should handle corrupted session data gracefully', () => {
      // Mock corrupted session data
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should handle expired sessions', () => {
      // Mock expired session
      const expiredSession = {
        email: 'test@example.com',
        sessionToken: 'token123',
        createdAt: '2023-01-01T00:00:00.000Z',
        expiresAt: '2023-01-01T01:00:00.000Z' // Expired
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession));

      const result = authService.getCurrentUser();
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_session');
    });

    it('should not throw errors during signOut even if clearing fails', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Failed to clear');
      });

      expect(() => authService.signOut()).not.toThrow();
    });
  });


});
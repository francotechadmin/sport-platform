import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageServiceImpl } from './storage.service';
import { User } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('StorageService', () => {
  let storageService: StorageServiceImpl;

  beforeEach(() => {
    storageService = new StorageServiceImpl();
    vi.clearAllMocks();
  });

  describe('storeUser', () => {
    it('should store a new user in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      storageService.storeUser('test@example.com', 'hashedPassword123');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_users',
        expect.stringContaining('"test@example.com"')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_users',
        expect.stringContaining('"hashedPassword":"hashedPassword123"')
      );
    });

    it('should add user to existing users storage', () => {
      const existingUsers = {
        'existing@example.com': {
          hashedPassword: 'existingHash',
          createdAt: '2023-01-01T00:00:00.000Z'
        }
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingUsers));
      
      storageService.storeUser('new@example.com', 'newHash');
      
      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const storedData = JSON.parse(setItemCall[1]);
      
      expect(storedData).toHaveProperty('existing@example.com');
      expect(storedData).toHaveProperty('new@example.com');
      expect(storedData['new@example.com'].hashedPassword).toBe('newHash');
    });
  });

  describe('getUser', () => {
    it('should return user data when user exists', () => {
      const users = {
        'test@example.com': {
          hashedPassword: 'hashedPassword123',
          createdAt: '2023-01-01T00:00:00.000Z'
        }
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(users));
      
      const result = storageService.getUser('test@example.com');
      
      expect(result).toEqual({
        email: 'test@example.com',
        hashedPassword: 'hashedPassword123',
        createdAt: '2023-01-01T00:00:00.000Z'
      });
    });

    it('should return null when user does not exist', () => {
      localStorageMock.getItem.mockReturnValue('{}');
      
      const result = storageService.getUser('nonexistent@example.com');
      
      expect(result).toBeNull();
    });

    it('should return null when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = storageService.getUser('test@example.com');
      
      expect(result).toBeNull();
    });
  });

  describe('storeSession', () => {
    it('should store session data with expiration', () => {
      const user: User = {
        email: 'test@example.com',
        sessionToken: 'token123',
        createdAt: '2023-01-01T00:00:00.000Z'
      };
      
      storageService.storeSession(user);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_session',
        expect.stringContaining('"email":"test@example.com"')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_session',
        expect.stringContaining('"sessionToken":"token123"')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_session',
        expect.stringContaining('"expiresAt"')
      );
    });
  });

  describe('getSession', () => {
    it('should return session data when valid and not expired', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
      const sessionData = {
        email: 'test@example.com',
        sessionToken: 'token123',
        createdAt: '2023-01-01T00:00:00.000Z',
        expiresAt: futureDate
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData));
      
      const result = storageService.getSession();
      
      expect(result).toEqual({
        email: 'test@example.com',
        sessionToken: 'token123',
        createdAt: '2023-01-01T00:00:00.000Z'
      });
    });

    it('should return null and clear session when expired', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
      const sessionData = {
        email: 'test@example.com',
        sessionToken: 'token123',
        createdAt: '2023-01-01T00:00:00.000Z',
        expiresAt: pastDate
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData));
      
      const result = storageService.getSession();
      
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_session');
    });

    it('should return null when no session exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = storageService.getSession();
      
      expect(result).toBeNull();
    });

    it('should handle invalid JSON and clear session', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const result = storageService.getSession();
      
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_session');
    });
  });

  describe('clearSession', () => {
    it('should remove session from localStorage', () => {
      storageService.clearSession();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_session');
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', () => {
      const users = {
        'test@example.com': {
          hashedPassword: 'hashedPassword123',
          createdAt: '2023-01-01T00:00:00.000Z'
        }
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(users));
      
      const result = storageService.userExists('test@example.com');
      
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', () => {
      localStorageMock.getItem.mockReturnValue('{}');
      
      const result = storageService.userExists('nonexistent@example.com');
      
      expect(result).toBe(false);
    });

    it('should return false when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = storageService.userExists('test@example.com');
      
      expect(result).toBe(false);
    });
  });

  describe('getAllUsers (private method behavior)', () => {
    it('should handle invalid JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // This should not throw an error
      const result = storageService.userExists('test@example.com');
      
      expect(result).toBe(false);
    });
  });
});
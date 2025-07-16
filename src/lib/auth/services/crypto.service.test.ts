import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoServiceImpl } from './crypto.service';

describe('CryptoService', () => {
  let cryptoService: CryptoServiceImpl;

  beforeEach(() => {
    cryptoService = new CryptoServiceImpl();
  });

  describe('hashPassword', () => {
    it('should hash a password and return a base64 string', async () => {
      const password = 'testPassword123';
      const hashedPassword = await cryptoService.hashPassword(password);
      
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(0);
      // Base64 string should only contain valid base64 characters
      expect(hashedPassword).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    it('should generate different hashes for the same password (due to random salt)', async () => {
      const password = 'testPassword123';
      const hash1 = await cryptoService.hashPassword(password);
      const hash2 = await cryptoService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for different passwords', async () => {
      const password1 = 'testPassword123';
      const password2 = 'differentPassword456';
      
      const hash1 = await cryptoService.hashPassword(password1);
      const hash2 = await cryptoService.hashPassword(password2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hashedPassword = await cryptoService.hashPassword(password);
      
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should handle special characters in password', async () => {
      const password = 'test@#$%^&*()_+{}|:<>?[]\\;\'",./`~';
      const hashedPassword = await cryptoService.hashPassword(password);
      
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should handle unicode characters in password', async () => {
      const password = 'test密码🔐';
      const hashedPassword = await cryptoService.hashPassword(password);
      
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe('generateSessionToken', () => {
    it('should generate a session token as a base64 string', () => {
      const token = cryptoService.generateSessionToken();
      
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      // Base64 string should only contain valid base64 characters
      expect(token).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    it('should generate different tokens on each call', () => {
      const token1 = cryptoService.generateSessionToken();
      const token2 = cryptoService.generateSessionToken();
      
      expect(token1).not.toBe(token2);
    });

    it('should generate tokens of consistent length', () => {
      const token1 = cryptoService.generateSessionToken();
      const token2 = cryptoService.generateSessionToken();
      const token3 = cryptoService.generateSessionToken();
      
      expect(token1.length).toBe(token2.length);
      expect(token2.length).toBe(token3.length);
    });
  });

  describe('comparePasswords', () => {
    it('should return true when comparing a password with its hash', async () => {
      const password = 'testPassword123';
      const hashedPassword = await cryptoService.hashPassword(password);
      
      const isMatch = await cryptoService.comparePasswords(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false when comparing different passwords', async () => {
      const password1 = 'testPassword123';
      const password2 = 'differentPassword456';
      const hashedPassword = await cryptoService.hashPassword(password1);
      
      const isMatch = await cryptoService.comparePasswords(password2, hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const password = 'testPassword123';
      const invalidHash = 'invalidHashString';
      
      const isMatch = await cryptoService.comparePasswords(password, invalidHash);
      expect(isMatch).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const password = 'testPassword123';
      const emptyHash = '';
      
      const isMatch = await cryptoService.comparePasswords(password, emptyHash);
      expect(isMatch).toBe(false);
    });

    it('should handle empty password correctly', async () => {
      const password = '';
      const hashedPassword = await cryptoService.hashPassword(password);
      
      const isMatch = await cryptoService.comparePasswords(password, hashedPassword);
      expect(isMatch).toBe(true);
      
      const isNotMatch = await cryptoService.comparePasswords('notEmpty', hashedPassword);
      expect(isNotMatch).toBe(false);
    });

    it('should handle special characters correctly', async () => {
      const password = 'test@#$%^&*()_+{}|:<>?[]\\;\'",./`~';
      const hashedPassword = await cryptoService.hashPassword(password);
      
      const isMatch = await cryptoService.comparePasswords(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should handle unicode characters correctly', async () => {
      const password = 'test密码🔐';
      const hashedPassword = await cryptoService.hashPassword(password);
      
      const isMatch = await cryptoService.comparePasswords(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should be case sensitive', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await cryptoService.hashPassword(password);
      
      const isMatch = await cryptoService.comparePasswords('testpassword123', hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should handle corrupted hash gracefully', async () => {
      const password = 'testPassword123';
      const validHash = await cryptoService.hashPassword(password);
      
      // Corrupt the hash by changing a character
      const corruptedHash = validHash.slice(0, -1) + 'X';
      
      const isMatch = await cryptoService.comparePasswords(password, corruptedHash);
      expect(isMatch).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should maintain consistency across multiple hash/compare cycles', async () => {
      const passwords = [
        'password1',
        'password2',
        'veryLongPasswordWithSpecialCharacters@#$%^&*()',
        '密码🔐',
        '',
        '123456'
      ];

      for (const password of passwords) {
        const hash = await cryptoService.hashPassword(password);
        const isMatch = await cryptoService.comparePasswords(password, hash);
        expect(isMatch).toBe(true);
        
        // Test with wrong password
        const wrongPassword = password + 'wrong';
        const isNotMatch = await cryptoService.comparePasswords(wrongPassword, hash);
        expect(isNotMatch).toBe(false);
      }
    });

    it('should handle concurrent operations correctly', async () => {
      const password = 'concurrentTest123';
      
      // Create multiple hash operations concurrently
      const hashPromises = Array(10).fill(null).map(() => 
        cryptoService.hashPassword(password)
      );
      
      const hashes = await Promise.all(hashPromises);
      
      // All hashes should be different (due to random salt)
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);
      
      // All hashes should validate correctly
      const comparePromises = hashes.map(hash => 
        cryptoService.comparePasswords(password, hash)
      );
      
      const results = await Promise.all(comparePromises);
      expect(results.every(result => result === true)).toBe(true);
    });
  });
});
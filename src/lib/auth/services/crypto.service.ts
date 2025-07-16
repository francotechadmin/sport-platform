// CryptoService implementation using Web Crypto API with fallbacks

import { CryptoService } from '../types';

export class CryptoServiceImpl implements CryptoService {
  private readonly ITERATIONS = 100000;
  private readonly SALT_LENGTH = 16;
  private readonly HASH_LENGTH = 32;

  /**
   * Check if Web Crypto API is available
   */
  private isWebCryptoAvailable(): boolean {
    return typeof crypto !== 'undefined' &&
      typeof crypto.subtle !== 'undefined' &&
      typeof crypto.getRandomValues === 'function';
  }

  /**
   * Hash a password using PBKDF2 with a random salt (or fallback)
   */
  async hashPassword(password: string): Promise<string> {
    if (this.isWebCryptoAvailable()) {
      return this.hashPasswordWebCrypto(password);
    } else {
      return this.hashPasswordFallback(password);
    }
  }

  /**
   * Hash password using Web Crypto API
   */
  private async hashPasswordWebCrypto(password: string): Promise<string> {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));

    // Convert password to ArrayBuffer
    const passwordBuffer = new TextEncoder().encode(password);

    // Import the password as a key
    const key = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    // Derive the hash using PBKDF2
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      key,
      this.HASH_LENGTH * 8 // bits
    );

    // Combine salt and hash for storage
    const combined = new Uint8Array(salt.length + hashBuffer.byteLength);
    combined.set(salt);
    combined.set(new Uint8Array(hashBuffer), salt.length);

    // Convert to base64 for storage
    return this.arrayBufferToBase64(combined);
  }

  /**
   * Fallback password hashing using simple hash function
   * Note: This is less secure and should only be used when Web Crypto API is unavailable
   */
  private async hashPasswordFallback(password: string): Promise<string> {
    // Generate a simple salt
    const salt = this.generateRandomBytesFallback(this.SALT_LENGTH);

    // Simple hash function (not cryptographically secure, but functional)
    const hash = await this.simpleHash(password + this.arrayBufferToBase64(salt));

    // Combine salt and hash
    const combined = new Uint8Array(salt.length + hash.length);
    combined.set(salt);
    combined.set(hash, salt.length);

    return this.arrayBufferToBase64(combined);
  }

  /**
   * Generate a cryptographically secure session token (or fallback)
   */
  generateSessionToken(): string {
    if (this.isWebCryptoAvailable()) {
      const tokenArray = crypto.getRandomValues(new Uint8Array(32));
      return this.arrayBufferToBase64(tokenArray);
    } else {
      // Fallback to Math.random (less secure but functional)
      const tokenArray = this.generateRandomBytesFallback(32);
      return this.arrayBufferToBase64(tokenArray);
    }
  }

  /**
   * Compare a plain text password with a hashed password
   */
  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    try {
      if (this.isWebCryptoAvailable()) {
        return this.comparePasswordsWebCrypto(password, hashedPassword);
      } else {
        return this.comparePasswordsFallback(password, hashedPassword);
      }
    } catch {
      // If any error occurs during comparison, return false
      return false;
    }
  }

  /**
   * Compare passwords using Web Crypto API
   */
  private async comparePasswordsWebCrypto(password: string, hashedPassword: string): Promise<boolean> {
    // Decode the stored hash
    const combined = this.base64ToArrayBuffer(hashedPassword);

    // Extract salt and hash
    const salt = combined.slice(0, this.SALT_LENGTH);
    const storedHash = combined.slice(this.SALT_LENGTH);

    // Convert password to ArrayBuffer
    const passwordBuffer = new TextEncoder().encode(password);

    // Import the password as a key
    const key = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    // Derive the hash using the same salt and parameters
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      key,
      this.HASH_LENGTH * 8 // bits
    );

    // Compare the hashes using constant-time comparison
    const newHash = new Uint8Array(hashBuffer);
    return this.constantTimeEqual(newHash, storedHash);
  }

  /**
   * Compare passwords using fallback method
   */
  private async comparePasswordsFallback(password: string, hashedPassword: string): Promise<boolean> {
    // Decode the stored hash
    const combined = this.base64ToArrayBuffer(hashedPassword);

    // Extract salt and hash
    const salt = combined.slice(0, this.SALT_LENGTH);
    const storedHash = combined.slice(this.SALT_LENGTH);

    // Generate hash using the same method as hashPasswordFallback
    const newHash = await this.simpleHash(password + this.arrayBufferToBase64(salt));

    // Compare the hashes
    return this.constantTimeEqual(newHash, storedHash);
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to Uint8Array
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Generate random bytes using Math.random as fallback
   * Note: This is less secure than crypto.getRandomValues
   */
  private generateRandomBytesFallback(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }

  /**
   * Simple hash function as fallback when Web Crypto API is unavailable
   * Note: This is not cryptographically secure
   */
  private async simpleHash(input: string): Promise<Uint8Array> {
    // Simple hash using string manipulation (not secure, but functional)
    let hash = 0;
    const result = new Uint8Array(this.HASH_LENGTH);

    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Fill the result array with derived values
    for (let i = 0; i < this.HASH_LENGTH; i++) {
      result[i] = (hash + i * 7) & 0xFF;
      hash = ((hash << 3) + hash + i) & 0xFFFFFFFF;
    }

    return result;
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  private constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }

    return result === 0;
  }
}

export const cryptoService = new CryptoServiceImpl();
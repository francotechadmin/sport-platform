// CryptoService implementation using Web Crypto API with PBKDF2

import { CryptoService } from '../types';

export class CryptoServiceImpl implements CryptoService {
  private readonly ITERATIONS = 100000;
  private readonly SALT_LENGTH = 16;
  private readonly HASH_LENGTH = 32;

  /**
   * Hash a password using PBKDF2 with a random salt
   */
  async hashPassword(password: string): Promise<string> {
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
   * Generate a cryptographically secure session token
   */
  generateSessionToken(): string {
    const tokenArray = crypto.getRandomValues(new Uint8Array(32));
    return this.arrayBufferToBase64(tokenArray);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    try {
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
    } catch (error) {
      // If any error occurs during comparison, return false
      return false;
    }
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
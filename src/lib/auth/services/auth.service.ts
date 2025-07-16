import { AuthService, User } from '../types';
import { AuthError, AuthErrorType } from '../errors';
import { cryptoService } from './crypto.service';
import { storageService } from './storage.service';

export class AuthServiceImpl implements AuthService {
  /**
   * Register a new user with email and password
   */
  async signUp(email: string, password: string): Promise<User> {
    try {
      // Check if localStorage is available
      if (!this.isStorageAvailable()) {
        throw new AuthError(AuthErrorType.STORAGE_ERROR, 'Browser storage is not available. Please enable cookies and try again.');
      }

      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new AuthError(AuthErrorType.INVALID_EMAIL, 'Please enter a valid email address');
      }

      // Validate password strength
      if (!this.isValidPassword(password)) {
        throw new AuthError(AuthErrorType.WEAK_PASSWORD, 'Password must be at least 8 characters long');
      }

      // Check if user already exists
      if (storageService.userExists(email)) {
        throw new AuthError(AuthErrorType.EMAIL_EXISTS, 'Email already registered');
      }

      // Hash the password
      const hashedPassword = await cryptoService.hashPassword(password);

      // Store the user
      storageService.storeUser(email, hashedPassword);

      // Create and store session
      const user: User = {
        email,
        sessionToken: cryptoService.generateSessionToken(),
        createdAt: new Date().toISOString()
      };

      storageService.storeSession(user);

      return user;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Handle storage errors
      if (error instanceof Error && (
        error.message.includes('localStorage') || 
        error.message.includes('QuotaExceededError') ||
        error.name === 'QuotaExceededError'
      )) {
        throw new AuthError(AuthErrorType.STORAGE_ERROR, 'Unable to save data. Your browser storage may be full. Please clear some data and try again.');
      }
      
      // Handle crypto errors
      if (error instanceof Error && error.message.includes('crypto')) {
        console.error(error)
        throw new AuthError(AuthErrorType.CRYPTO_ERROR, 'Security operation failed. Please try again.');
      }
      
      // Generic error fallback
      console.error('Unexpected error during sign up:', error);
      throw new AuthError(AuthErrorType.STORAGE_ERROR, 'An unexpected error occurred. Please try again.');
    }
  }

  /**
   * Authenticate user with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      // Check if localStorage is available first
      if (!this.isStorageAvailable()) {
        throw new AuthError(AuthErrorType.STORAGE_ERROR, 'Browser storage is not available. Please enable cookies and try again.');
      }

      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password');
      }

      // Get stored user data - this might throw storage errors
      let storedUser;
      try {
        storedUser = storageService.getUser(email);
      } catch (storageError) {
        if (storageError instanceof Error && storageError.message.includes('localStorage')) {
          throw new AuthError(AuthErrorType.STORAGE_ERROR, 'Unable to access stored data. Please try again.');
        }
        throw storageError;
      }

      if (!storedUser) {
        throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password');
      }

      // Compare passwords
      const isPasswordValid = await cryptoService.comparePasswords(password, storedUser.hashedPassword);
      if (!isPasswordValid) {
        throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password');
      }

      // Create and store new session
      const user: User = {
        email,
        sessionToken: cryptoService.generateSessionToken(),
        createdAt: storedUser.createdAt
      };

      storageService.storeSession(user);

      return user;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Handle storage errors
      if (error instanceof Error && (
        error.message.includes('localStorage') || 
        error.message.includes('QuotaExceededError') ||
        error.name === 'QuotaExceededError'
      )) {
        throw new AuthError(AuthErrorType.STORAGE_ERROR, 'Unable to access stored data. Please try again.');
      }
      
      // Handle crypto errors
      if (error instanceof Error && error.message.includes('crypto')) {
        throw new AuthError(AuthErrorType.CRYPTO_ERROR, 'Security operation failed. Please try again.');
      }
      
      // Generic error fallback
      console.error('Unexpected error during sign in:', error);
      throw new AuthError(AuthErrorType.STORAGE_ERROR, 'An unexpected error occurred. Please try again.');
    }
  }

  /**
   * Sign out the current user
   */
  signOut(): void {
    try {
      storageService.clearSession();
    } catch (error) {
      // Even if clearing fails, we should not throw an error for sign out
      console.warn('Failed to clear session data:', error);
    }
  }

  /**
   * Get the currently authenticated user
   */
  getCurrentUser(): User | null {
    try {
      return storageService.getSession();
    } catch (error) {
      console.warn('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Validate if a session token is valid
   */
  isValidSession(sessionToken: string): boolean {
    try {
      const currentUser = this.getCurrentUser();
      return currentUser !== null && currentUser.sessionToken === sessionToken;
    } catch {
      return false;
    }
  }

  /**
   * Check if user exists by email
   */
  userExists(email: string): boolean {
    try {
      return storageService.userExists(email);
    } catch {
      return false;
    }
  }

  /**
   * Validate email format using regex
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Validate password strength
   */
  private isValidPassword(password: string): boolean {
    // Minimum 8 characters
    return password.length >= 8;
  }

  /**
   * Check if localStorage is available
   */
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthServiceImpl();
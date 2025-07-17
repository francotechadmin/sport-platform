import { StorageService, StoredUser, User, UsersStorage, SessionStorage } from '../types';

export class StorageServiceImpl implements StorageService {
  private readonly USERS_KEY = 'auth_users';
  private readonly SESSION_KEY = 'auth_session';

  storeUser(email: string, hashedPassword: string): void {
    try {
      const users = this.getAllUsers();
      users[email] = {
        hashedPassword,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      if (error instanceof Error && (
        error.name === 'QuotaExceededError' || 
        error.message.includes('QuotaExceededError')
      )) {
        throw new Error('localStorage quota exceeded');
      }
      throw new Error('localStorage not available');
    }
  }

  getUser(email: string): StoredUser | null {
    const users = this.getAllUsers();
    const userData = users[email];
    
    if (!userData) {
      return null;
    }

    return {
      email,
      hashedPassword: userData.hashedPassword,
      createdAt: userData.createdAt
    };
  }

  storeSession(user: User): void {
    try {
      const sessionData: SessionStorage = {
        email: user.email,
        sessionToken: user.sessionToken,
        createdAt: user.createdAt,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      if (error instanceof Error && (
        error.name === 'QuotaExceededError' || 
        error.message.includes('QuotaExceededError')
      )) {
        throw new Error('localStorage quota exceeded');
      }
      throw new Error('localStorage not available');
    }
  }

  getSession(): User | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      
      if (!sessionData) {
        return null;
      }

      const session: SessionStorage = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        this.clearSession();
        return null;
      }

      return {
        email: session.email,
        sessionToken: session.sessionToken,
        createdAt: session.createdAt
      };
    } catch {
      // Handle localStorage access errors or invalid session data
      try {
        this.clearSession();
      } catch {
        // Ignore errors when clearing session
      }
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  userExists(email: string): boolean {
    const users = this.getAllUsers();
    return email in users;
  }

  deleteUser(email: string): void {
    try {
      const users = this.getAllUsers();
      delete users[email];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      if (error instanceof Error && (
        error.name === 'QuotaExceededError' || 
        error.message.includes('QuotaExceededError')
      )) {
        throw new Error('localStorage quota exceeded');
      }
      throw new Error('localStorage not available');
    }
  }

  private getAllUsers(): UsersStorage {
    try {
      const usersData = localStorage.getItem(this.USERS_KEY);
      
      if (!usersData) {
        return {};
      }

      return JSON.parse(usersData);
    } catch (error) {
      // Handle localStorage access errors or invalid JSON data
      console.warn('Failed to access user data from localStorage:', error);
      return {};
    }
  }
}

export const storageService = new StorageServiceImpl();
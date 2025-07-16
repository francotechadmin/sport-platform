import { StorageService, StoredUser, User, UsersStorage, SessionStorage } from '../types';

export class StorageServiceImpl implements StorageService {
  private readonly USERS_KEY = 'auth_users';
  private readonly SESSION_KEY = 'auth_session';

  storeUser(email: string, hashedPassword: string): void {
    const users = this.getAllUsers();
    users[email] = {
      hashedPassword,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
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
    const sessionData: SessionStorage = {
      email: user.email,
      sessionToken: user.sessionToken,
      createdAt: user.createdAt,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
  }

  getSession(): User | null {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    
    if (!sessionData) {
      return null;
    }

    try {
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
      // Invalid session data, clear it
      this.clearSession();
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

  private getAllUsers(): UsersStorage {
    const usersData = localStorage.getItem(this.USERS_KEY);
    
    if (!usersData) {
      return {};
    }

    try {
      return JSON.parse(usersData);
    } catch {
      // Invalid data, return empty object
      return {};
    }
  }
}

export const storageService = new StorageServiceImpl();
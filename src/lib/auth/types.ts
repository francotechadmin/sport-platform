// Core authentication types and interfaces

export interface User {
  email: string;
  sessionToken: string;
  createdAt: string;
}

export interface StoredUser {
  email: string;
  hashedPassword: string;
  createdAt: string;
}

export interface UsersStorage {
  [email: string]: {
    hashedPassword: string;
    createdAt: string;
  };
}

export interface SessionStorage {
  email: string;
  sessionToken: string;
  createdAt: string;
  expiresAt: string;
}

// Authentication Context Interface
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

// Service Interfaces
export interface AuthService {
  signUp(email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): void;
  getCurrentUser(): User | null;
  isValidSession(sessionToken: string): boolean;
  userExists(email: string): boolean;
}

export interface CryptoService {
  hashPassword(password: string): Promise<string>;
  generateSessionToken(): string;
  comparePasswords(password: string, hashedPassword: string): Promise<boolean>;
}

export interface StorageService {
  storeUser(email: string, hashedPassword: string): void;
  getUser(email: string): StoredUser | null;
  storeSession(user: User): void;
  getSession(): User | null;
  clearSession(): void;
  userExists(email: string): boolean;
}
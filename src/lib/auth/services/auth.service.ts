// AuthService interface implementation placeholder
// This will be implemented in task 4

import { AuthService, User } from '../types';

export class AuthServiceImpl implements AuthService {
  async signUp(email: string, password: string): Promise<User> {
    throw new Error('AuthService not implemented yet');
  }

  async signIn(email: string, password: string): Promise<User> {
    throw new Error('AuthService not implemented yet');
  }

  signOut(): void {
    throw new Error('AuthService not implemented yet');
  }

  getCurrentUser(): User | null {
    throw new Error('AuthService not implemented yet');
  }

  isValidSession(sessionToken: string): boolean {
    throw new Error('AuthService not implemented yet');
  }
}

export const authService = new AuthServiceImpl();
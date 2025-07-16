// StorageService interface implementation placeholder
// This will be implemented in task 3

import { StorageService, StoredUser, User } from '../types';

export class StorageServiceImpl implements StorageService {
  storeUser(email: string, hashedPassword: string): void {
    throw new Error('StorageService not implemented yet');
  }

  getUser(email: string): StoredUser | null {
    throw new Error('StorageService not implemented yet');
  }

  storeSession(user: User): void {
    throw new Error('StorageService not implemented yet');
  }

  getSession(): User | null {
    throw new Error('StorageService not implemented yet');
  }

  clearSession(): void {
    throw new Error('StorageService not implemented yet');
  }

  userExists(email: string): boolean {
    throw new Error('StorageService not implemented yet');
  }
}

export const storageService = new StorageServiceImpl();
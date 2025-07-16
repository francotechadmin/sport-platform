'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, User } from '../types';
import { AuthError } from '../errors';
import { authService } from '../services/auth.service';

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.warn('Failed to initialize authentication state:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const newUser = await authService.signUp(email, password);
      setUser(newUser);
    } catch (error) {
      // Re-throw the error so components can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.signIn(email, password);
      setUser(authenticatedUser);
    } catch (error) {
      // Re-throw the error so components can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = (): void => {
    try {
      authService.signOut();
      setUser(null);
    } catch (error) {
      console.warn('Error during sign out:', error);
      // Still clear the user state even if storage clearing fails
      setUser(null);
    }
  };

  // Computed property for authentication status
  const isAuthenticated = user !== null;

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export the context for testing purposes
export { AuthContext };
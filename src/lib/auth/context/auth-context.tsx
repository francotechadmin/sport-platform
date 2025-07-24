'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { AuthContextType, User } from '../types';
import { authService } from '../services/auth.service';
import { AuthError, getAuthErrorMessage } from '../errors';

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
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.warn('Failed to initialize authentication state:', error);
        // Show toast for initialization errors that might affect user experience
        if (error instanceof AuthError) {
          toast.error(getAuthErrorMessage(error));
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string): Promise<void> => {
    setIsSigningUp(true);
    try {
      const newUser = await authService.signUp(email, password);
      setUser(newUser);
      toast.success('Account created successfully! Welcome to the platform.');
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error as AuthError);
      toast.error(errorMessage);
      console.error('Sign up error:', error);
      // Re-throw the error so components can handle it if needed
      throw error;
    } finally {
      setIsSigningUp(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<void> => {
    setIsSigningIn(true);
    try {
      const authenticatedUser = await authService.signIn(email, password);
      setUser(authenticatedUser);
      toast.success('Welcome back! You have been signed in successfully.');
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error as AuthError);
      toast.error(errorMessage);
      console.error('Sign in error:', error);
      // Re-throw the error so components can handle it if needed
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign out function
  const signOut = (): void => {
    try {
      authService.signOut();
      setUser(null);
      toast.success('You have been signed out successfully.');
    } catch (error) {
      console.warn('Error during sign out:', error);
      const errorMessage = getAuthErrorMessage(error as AuthError);
      toast.error(`Sign out error: ${errorMessage}`);
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
    isSigningIn,
    isSigningUp,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
  };

  // Don't show a loading screen during initial auth check to avoid flash
  // The route guards will handle loading states appropriately

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
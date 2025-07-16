import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from './auth-context';
import { authService } from '../services/auth.service';
import { AuthError, AuthErrorType } from '../errors';
import { User } from '../types';

// Mock the auth service
vi.mock('../services/auth.service', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
}));

// Test component that uses the auth context
function TestComponent() {
  const { user, isLoading, signIn, signUp, signOut, isAuthenticated } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  
  const handleSignIn = async () => {
    try {
      setError(null);
      await signIn('test@example.com', 'password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleSignUp = async () => {
    try {
      setError(null);
      await signUp('test@example.com', 'password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };
  
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button onClick={handleSignIn} data-testid="sign-in">
        Sign In
      </button>
      <button onClick={handleSignUp} data-testid="sign-up">
        Sign Up
      </button>
      <button onClick={signOut} data-testid="sign-out">
        Sign Out
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  const mockUser: User = {
    email: 'test@example.com',
    sessionToken: 'mock-session-token',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AuthProvider initialization', () => {
    it('should initialize with loading state and no user when no session exists', async () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });

    it('should initialize with existing user session', async () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    it('should handle initialization errors gracefully', async () => {
      vi.mocked(authService.getCurrentUser).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize authentication state:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('signUp functionality', () => {
    it('should successfully sign up a new user', async () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(null);
      vi.mocked(authService.signUp).mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      // Click sign up
      await act(async () => {
        screen.getByTestId('sign-up').click();
      });

      // Wait for sign up to complete
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(authService.signUp).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('should handle sign up errors', async () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(null);
      const signUpError = new AuthError(AuthErrorType.EMAIL_EXISTS, 'Email already registered');
      vi.mocked(authService.signUp).mockRejectedValue(signUpError);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      // Click sign up
      await act(async () => {
        screen.getByTestId('sign-up').click();
      });

      // Wait for error to be handled
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Email already registered');
      });

      // Should not be authenticated after error
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  describe('signIn functionality', () => {
    it('should successfully sign in a user', async () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(null);
      vi.mocked(authService.signIn).mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      // Click sign in
      await act(async () => {
        screen.getByTestId('sign-in').click();
      });

      // Wait for sign in to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('should handle sign in errors', async () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(null);
      const signInError = new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password');
      vi.mocked(authService.signIn).mockRejectedValue(signInError);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      // Click sign in
      await act(async () => {
        screen.getByTestId('sign-in').click();
      });

      // Wait for error to be handled
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password');
      });

      // Should not be authenticated after error
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  describe('signOut functionality', () => {
    it('should successfully sign out a user', async () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
      vi.mocked(authService.signOut).mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initialization with user
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });

      // Click sign out
      act(() => {
        screen.getByTestId('sign-out').click();
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(authService.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors gracefully', async () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
      vi.mocked(authService.signOut).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initialization with user
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });

      // Click sign out
      act(() => {
        screen.getByTestId('sign-out').click();
      });

      // Should still clear user state even if storage clearing fails
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(consoleSpy).toHaveBeenCalledWith('Error during sign out:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('authentication state persistence', () => {
    it('should maintain authentication state across re-renders', async () => {
      vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });

      // Re-render the component
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should maintain the same state after re-render
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });
  });
});
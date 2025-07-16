import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { AuthRedirect } from './auth-redirect';
import { useAuth } from '../context/auth-context';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock auth context
vi.mock('../context/auth-context', () => ({
  useAuth: vi.fn(),
}));

const mockPush = vi.fn();
const mockUseRouter = vi.mocked(useRouter);
const mockUseAuth = vi.mocked(useAuth);

describe('AuthRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  it('should show loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthRedirect>
        <div>Auth Content</div>
      </AuthRedirect>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Auth Content')).not.toBeInTheDocument();
  });

  it('should show custom fallback when loading and fallback is provided', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthRedirect fallback={<div>Custom Loading</div>}>
        <div>Auth Content</div>
      </AuthRedirect>
    );

    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
    expect(screen.queryByText('Auth Content')).not.toBeInTheDocument();
  });

  it('should redirect authenticated user to dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com', createdAt: new Date() },
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthRedirect>
        <div>Auth Content</div>
      </AuthRedirect>
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect authenticated user to custom redirect path', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com', createdAt: new Date() },
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthRedirect redirectTo="/custom-path">
        <div>Auth Content</div>
      </AuthRedirect>
    );

    expect(mockPush).toHaveBeenCalledWith('/custom-path');
  });

  it('should show fallback while redirect is happening for authenticated user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com', createdAt: new Date() },
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthRedirect>
        <div>Auth Content</div>
      </AuthRedirect>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Auth Content')).not.toBeInTheDocument();
  });

  it('should render children for unauthenticated user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthRedirect>
        <div>Auth Content</div>
      </AuthRedirect>
    );

    expect(screen.getByText('Auth Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should not redirect when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthRedirect>
        <div>Auth Content</div>
      </AuthRedirect>
    );

    expect(mockPush).not.toHaveBeenCalled();
  });
});
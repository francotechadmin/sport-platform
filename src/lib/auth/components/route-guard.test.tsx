import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouteGuard } from './route-guard';
import { useAuth } from '../context/auth-context';

// Mock the useAuth hook
vi.mock('../context/auth-context', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('RouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isSigningIn: false,
      isSigningUp: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@example.com', sessionToken: 'token', createdAt: '2023-01-01' },
      isAuthenticated: true,
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show minimal content during redirect when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    const { container } = render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    // Should show minimal div during redirect
    expect(container.firstChild).toHaveClass('min-h-screen');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to signin when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('should redirect to custom path when specified', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <RouteGuard redirectTo="/custom-signin">
        <div>Protected Content</div>
      </RouteGuard>
    );

    expect(mockPush).toHaveBeenCalledWith('/custom-signin');
  });
});
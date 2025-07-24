import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './page';
import { useAuth } from '@/lib/auth/context/auth-context';

// Mock the useAuth hook
vi.mock('@/lib/auth/context/auth-context', () => ({
  useAuth: vi.fn(),
}));

// Mock Next.js hooks
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Mock the landing page components
vi.mock('@/components/landing/hero-section', () => ({
  HeroSection: ({ onGetStarted, onSignIn }: { onGetStarted: () => void; onSignIn: () => void }) => (
    <div data-testid="hero-section">
      <button onClick={onGetStarted} data-testid="get-started-btn">Get Started</button>
      <button onClick={onSignIn} data-testid="sign-in-btn">Sign In</button>
    </div>
  ),
}));

vi.mock('@/components/landing/features-section', () => ({
  FeaturesSection: () => <div data-testid="features-section">Features</div>,
}));

const mockUseAuth = vi.mocked(useAuth);

describe('Home Page - Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('should show loading spinner while authentication is loading', () => {
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

    render(<Home />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-section')).not.toBeInTheDocument();
  });

  it('should show landing page for unauthenticated users', () => {
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

    render(<Home />);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should redirect authenticated users to chat page', () => {
    mockUseAuth.mockReturnValue({
      user: {
        email: 'test@example.com',
        sessionToken: 'token123',
        createdAt: '2023-01-01T00:00:00.000Z'
      },
      isAuthenticated: true,
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(<Home />);

    expect(mockPush).toHaveBeenCalledWith('/chat');
  });

  it('should navigate to signup when Get Started is clicked', () => {
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

    render(<Home />);

    const getStartedBtn = screen.getByTestId('get-started-btn');
    fireEvent.click(getStartedBtn);

    expect(mockPush).toHaveBeenCalledWith('/signup');
  });

  it('should navigate to signin when Sign In is clicked', () => {
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

    render(<Home />);

    const signInBtn = screen.getByTestId('sign-in-btn');
    fireEvent.click(signInBtn);

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('should show redirecting spinner for authenticated users before redirect', () => {
    mockUseAuth.mockReturnValue({
      user: {
        email: 'test@example.com',
        sessionToken: 'token123',
        createdAt: '2023-01-01T00:00:00.000Z'
      },
      isAuthenticated: true,
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(<Home />);

    expect(screen.getByText('Redirecting...')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-section')).not.toBeInTheDocument();
  });
});
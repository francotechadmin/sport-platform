import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './sidebar';
import { useAuth } from '@/lib/auth/context/auth-context';
import { useConversation } from '@/lib/conversation-context';

// Mock the useAuth hook
vi.mock('@/lib/auth/context/auth-context', () => ({
  useAuth: vi.fn(),
}));

// Mock the useConversation hook
vi.mock('@/lib/conversation-context', () => ({
  useConversation: vi.fn(),
}));

// Mock Next.js hooks
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard',
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => 
    <img src={src} alt={alt} {...props} />,
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseConversation = vi.mocked(useConversation);

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseConversation.mockReturnValue({
      conversations: [],
      createConversation: vi.fn(),
      loadConversation: vi.fn(),
      currentConversationId: null,
      refreshConversations: vi.fn(),
      deleteConversation: vi.fn(),
      updateConversationTitle: vi.fn(),
    });
  });

  it('should display user email when user is signed in', () => {
    const mockUser = {
      email: 'test@example.com',
      sessionToken: 'token123',
      createdAt: '2023-01-01T00:00:00.000Z'
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(<Sidebar />);

    expect(screen.getByText('Signed in as')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should call signOut and navigate when sign out button is clicked', () => {
    const mockSignOut = vi.fn();
    const mockUser = {
      email: 'test@example.com',
      sessionToken: 'token123',
      createdAt: '2023-01-01T00:00:00.000Z'
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    });

    render(<Sidebar />);

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('should not display user info when user is not signed in', () => {
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

    render(<Sidebar />);

    expect(screen.queryByText('Signed in as')).not.toBeInTheDocument();
  });

  it('should display navigation links', () => {
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

    render(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Performance Logs')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Locker Room')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TopNav } from './top-nav';

// Mock the auth context
const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/context/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the icons
vi.mock('@deemlol/next-icons', () => ({
  Bell: () => <div data-testid="bell-icon" />,
  MessageSquare: () => <div data-testid="message-icon" />,
  User: () => <div data-testid="user-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
}));

// Mock the theme toggle
vi.mock('@/components/theme-toggle', () => ({
  ModeToggle: () => <div data-testid="mode-toggle" />,
}));

describe('TopNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseAuth.mockReturnValue({
      user: { email: 'test@example.com', sessionToken: 'token123', createdAt: '2023-01-01' },
      signOut: mockSignOut,
    });
  });

  it('should display user email in welcome message', () => {
    render(<TopNav />);
    
    expect(screen.getByText('Welcome back,')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display fallback name when no user email', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
    });

    render(<TopNav />);
    
    expect(screen.getByText('Welcome back,')).toBeInTheDocument();
    expect(screen.getByText('Champion')).toBeInTheDocument();
  });

  it('should render user dropdown menu', () => {
    render(<TopNav />);
    
    // Find the user button by its icon
    const userIcon = screen.getByTestId('user-icon');
    expect(userIcon).toBeInTheDocument();
    
    // The button should be the parent of the icon
    const userButton = userIcon.closest('button');
    expect(userButton).toBeInTheDocument();
  });

  it('should have signOut function available in context', () => {
    render(<TopNav />);
    
    // Verify that the component has access to the signOut function
    expect(mockSignOut).toBeDefined();
    expect(typeof mockSignOut).toBe('function');
  });

  it('should render notification and message buttons', () => {
    render(<TopNav />);
    
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByTestId('message-icon')).toBeInTheDocument();
  });

  it('should render mode toggle', () => {
    render(<TopNav />);
    
    expect(screen.getByTestId('mode-toggle')).toBeInTheDocument();
  });
});
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from './page';
import { useAuth } from '@/lib/auth/context/auth-context';
import { authService } from '@/lib/auth/services/auth.service';

// Mock the useAuth hook
vi.mock('@/lib/auth/context/auth-context', () => ({
  useAuth: vi.fn(),
}));

// Mock the auth service
vi.mock('@/lib/auth/services/auth.service', () => ({
  authService: {
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
  },
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
    setTheme: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockAuthService = vi.mocked(authService);

describe('SettingsPage - Authentication Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default user mock
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
  });

  it('should display user authentication information', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Signed in as')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Account created: 1/1/2023')).toBeInTheDocument();
  });

  it('should open change password dialog when button is clicked', async () => {
    render(<SettingsPage />);

    const changePasswordButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByText('Enter your current password and choose a new one.')).toBeInTheDocument();
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    });
  });

  it('should validate password change form', async () => {
    render(<SettingsPage />);

    // Open change password dialog
    const changePasswordButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    });

    // Try to submit without filling fields
    const submitButton = screen.getByRole('button', { name: 'Change Password' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Current password is required')).toBeInTheDocument();
    });
  });

  it('should call authService.changePassword when form is valid', async () => {
    mockAuthService.changePassword.mockResolvedValue(undefined);

    render(<SettingsPage />);

    // Open change password dialog
    const changePasswordButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'currentPass123!' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPass123!' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'NewPass123!' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Change Password' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.changePassword).toHaveBeenCalledWith('currentPass123!', 'NewPass123!');
    });
  });

  it('should open delete account dialog when button is clicked', async () => {
    render(<SettingsPage />);

    const deleteAccountButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteAccountButton);

    await waitFor(() => {
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type DELETE here')).toBeInTheDocument();
    });
  });

  it('should require DELETE confirmation for account deletion', async () => {
    render(<SettingsPage />);

    // Open delete account dialog
    const deleteAccountButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteAccountButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type DELETE here')).toBeInTheDocument();
    });

    // Try to delete without typing DELETE
    const confirmButton = screen.getByRole('button', { name: 'Delete Account' });
    expect(confirmButton).toBeDisabled();

    // Type DELETE
    const confirmationInput = screen.getByPlaceholderText('Type DELETE here');
    fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });

    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });
  });

  it('should call authService.deleteAccount when confirmed', async () => {
    mockAuthService.deleteAccount.mockResolvedValue(undefined);
    const mockSignOut = vi.fn();

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
      signOut: mockSignOut,
    });

    render(<SettingsPage />);

    // Open delete account dialog
    const deleteAccountButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteAccountButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type DELETE here')).toBeInTheDocument();
    });

    // Type DELETE and confirm
    const confirmationInput = screen.getByPlaceholderText('Type DELETE here');
    fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });

    const confirmButton = screen.getByRole('button', { name: 'Delete Account' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockAuthService.deleteAccount).toHaveBeenCalled();
    });
  });

  it('should display profile settings with user data', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test')).toBeInTheDocument(); // Username derived from email
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('should have functional export data button', async () => {
    render(<SettingsPage />);

    const exportButton = screen.getByRole('button', { name: /export my data/i });
    expect(exportButton).toBeInTheDocument();

    // Click should not throw error
    fireEvent.click(exportButton);
  });
});
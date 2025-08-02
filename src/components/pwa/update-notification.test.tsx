// UpdateNotification Component Tests
// Tests for the enhanced update notification functionality

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UpdateNotification } from './update-notification';

// Mock the PWA context
const mockUsePWA = {
  updateAvailable: true,
  updateApp: vi.fn()
};

vi.mock('./pwa-manager', () => ({
  usePWA: () => mockUsePWA
}));

describe('UpdateNotification Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePWA.updateAvailable = true;
  });

  it('should render update notification when update is available', () => {
    render(<UpdateNotification />);
    
    expect(screen.getByText('Update Available')).toBeInTheDocument();
    expect(screen.getByText(/A new version of ProFormAi is ready to install/)).toBeInTheDocument();
  });

  it('should not render when no update is available', () => {
    mockUsePWA.updateAvailable = false;
    
    render(<UpdateNotification />);
    
    expect(screen.queryByText('Update Available')).not.toBeInTheDocument();
  });

  it('should call updateApp when update button is clicked', async () => {
    render(<UpdateNotification />);
    
    const updateButton = screen.getByText('Update Now');
    fireEvent.click(updateButton);
    
    // Wait for the update process to complete (1.5 seconds)
    await waitFor(() => {
      expect(mockUsePWA.updateApp).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<UpdateNotification onDismiss={onDismiss} />);
    
    // Find the dismiss button by its X icon
    const dismissButton = screen.getByRole('button', { name: '' });
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalled();
  });

  it('should show progress bar during update', async () => {
    render(<UpdateNotification showProgress={true} />);
    
    const updateButton = screen.getByText('Update Now');
    fireEvent.click(updateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument();
      expect(screen.getByText('Downloading update...')).toBeInTheDocument();
    });
  });

  it('should show auto-update countdown', async () => {
    render(<UpdateNotification autoUpdateDelay={5} />);
    
    expect(screen.getByText(/Auto-updating in \d+s/)).toBeInTheDocument();
    expect(screen.getByText(/Update \(\d+s\)/)).toBeInTheDocument();
  });

  it('should show completion state', async () => {
    render(<UpdateNotification />);
    
    const updateButton = screen.getByText('Update Now');
    fireEvent.click(updateButton);
    
    // Wait for update to complete
    await waitFor(() => {
      expect(screen.getByText('Update Complete')).toBeInTheDocument();
      expect(screen.getByText('Update complete! Restarting...')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should prevent dismissing during update', async () => {
    const onDismiss = vi.fn();
    render(<UpdateNotification onDismiss={onDismiss} />);
    
    const updateButton = screen.getByText('Update Now');
    fireEvent.click(updateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });
    
    // Dismiss button should not be present during update
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('should handle update without progress bar', () => {
    render(<UpdateNotification showProgress={false} />);
    
    const updateButton = screen.getByText('Update Now');
    fireEvent.click(updateButton);
    
    // Progress bar should not be present
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('should call onUpdate callback when update completes', async () => {
    const onUpdate = vi.fn();
    render(<UpdateNotification onUpdate={onUpdate} />);
    
    const updateButton = screen.getByText('Update Now');
    fireEvent.click(updateButton);
    
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should show appropriate icons for different states', async () => {
    render(<UpdateNotification />);
    
    // Initial state - should show refresh icon
    expect(screen.getByText('Update Available')).toBeInTheDocument();
    
    // Click update to start updating
    const updateButton = screen.getByText('Update Now');
    fireEvent.click(updateButton);
    
    // Updating state - should show download icon
    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });
    
    // Complete state - should show check icon
    await waitFor(() => {
      expect(screen.getByText('Update Complete')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle different update messages based on state', async () => {
    render(<UpdateNotification autoUpdateDelay={10} />);
    
    // Initial auto-update message
    expect(screen.getByText(/Auto-updating in \d+s/)).toBeInTheDocument();
    
    // Click update manually
    const updateButton = screen.getByText(/Update \(\d+s\)/);
    fireEvent.click(updateButton);
    
    // Updating message
    await waitFor(() => {
      expect(screen.getByText('Downloading update...')).toBeInTheDocument();
    });
    
    // Completion message
    await waitFor(() => {
      expect(screen.getByText('Update complete! Restarting...')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
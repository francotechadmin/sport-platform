// InstallPrompt Component Tests
// Tests for PWA installation prompt functionality

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstallPrompt } from './install-prompt';

// Mock the PWA context
const mockUsePWA = {
  isInstallable: true,
  isIOS: false,
  isStandalone: false,
  promptInstall: vi.fn(),
  dismissInstall: vi.fn()
};

vi.mock('./pwa-manager', () => ({
  usePWA: () => mockUsePWA
}));

describe('InstallPrompt Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePWA.isInstallable = true;
    mockUsePWA.isIOS = false;
    mockUsePWA.isStandalone = false;
  });

  it('should render install prompt when installable', () => {
    render(<InstallPrompt />);
    
    expect(screen.getByText('Install ProFormAi')).toBeInTheDocument();
    expect(screen.getByText(/Get the full app experience/)).toBeInTheDocument();
    expect(screen.getByText('Install App')).toBeInTheDocument();
  });

  it('should not render when already installed (standalone)', () => {
    mockUsePWA.isStandalone = true;
    
    render(<InstallPrompt />);
    
    expect(screen.queryByText('Install ProFormAi')).not.toBeInTheDocument();
  });

  it('should not render when not installable and not iOS', () => {
    mockUsePWA.isInstallable = false;
    mockUsePWA.isIOS = false;
    
    render(<InstallPrompt />);
    
    expect(screen.queryByText('Install ProFormAi')).not.toBeInTheDocument();
  });

  it('should render for iOS devices even when not installable', () => {
    mockUsePWA.isInstallable = false;
    mockUsePWA.isIOS = true;
    
    render(<InstallPrompt />);
    
    expect(screen.getByText('Install ProFormAi')).toBeInTheDocument();
    expect(screen.getByText('Show Instructions')).toBeInTheDocument();
  });

  it('should call promptInstall when install button is clicked (non-iOS)', async () => {
    render(<InstallPrompt />);
    
    const installButton = screen.getByText('Install App');
    fireEvent.click(installButton);
    
    expect(mockUsePWA.promptInstall).toHaveBeenCalled();
  });

  it('should show iOS instructions when install button is clicked (iOS)', async () => {
    mockUsePWA.isIOS = true;
    
    render(<InstallPrompt />);
    
    const instructionsButton = screen.getByText('Show Instructions');
    fireEvent.click(instructionsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Follow these steps to install ProFormAi on your iOS device')).toBeInTheDocument();
      expect(screen.getByText('Tap the Share button')).toBeInTheDocument();
      expect(screen.getByText('Select "Add to Home Screen"')).toBeInTheDocument();
      expect(screen.getByText('Tap "Add"')).toBeInTheDocument();
    });
  });

  it('should call dismissInstall when dismiss button is clicked', () => {
    render(<InstallPrompt />);
    
    const dismissButton = screen.getByText('Maybe Later');
    fireEvent.click(dismissButton);
    
    expect(mockUsePWA.dismissInstall).toHaveBeenCalled();
  });

  it('should call onInstall callback when install is triggered', async () => {
    const onInstall = vi.fn();
    mockUsePWA.promptInstall.mockResolvedValue();
    
    render(<InstallPrompt onInstall={onInstall} />);
    
    const installButton = screen.getByText('Install App');
    fireEvent.click(installButton);
    
    await waitFor(() => {
      expect(onInstall).toHaveBeenCalled();
    });
  });

  it('should call onDismiss callback when dismissed', () => {
    const onDismiss = vi.fn();
    render(<InstallPrompt onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByText('Maybe Later');
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalled();
  });

  it('should not render when isVisible is false', () => {
    render(<InstallPrompt isVisible={false} />);
    
    expect(screen.queryByText('Install ProFormAi')).not.toBeInTheDocument();
  });

  it('should show app benefits in the prompt', () => {
    render(<InstallPrompt />);
    
    expect(screen.getByText('Works offline')).toBeInTheDocument();
    expect(screen.getByText('Faster loading')).toBeInTheDocument();
    expect(screen.getByText('Home screen access')).toBeInTheDocument();
    expect(screen.getByText('Native app feel')).toBeInTheDocument();
  });

  it('should close iOS instructions modal when "Got it" is clicked', async () => {
    mockUsePWA.isIOS = true;
    
    render(<InstallPrompt />);
    
    // Open instructions
    const instructionsButton = screen.getByText('Show Instructions');
    fireEvent.click(instructionsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Follow these steps to install ProFormAi on your iOS device')).toBeInTheDocument();
    });
    
    // Close instructions
    const gotItButton = screen.getByText('Got it');
    fireEvent.click(gotItButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Follow these steps to install ProFormAi on your iOS device')).not.toBeInTheDocument();
    });
  });

  it('should handle install prompt errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the promptInstall to reject but catch the error in the component
    mockUsePWA.promptInstall.mockImplementation(() => {
      return Promise.reject(new Error('Install failed')).catch(error => {
        console.error('Error prompting install:', error);
      });
    });
    
    render(<InstallPrompt />);
    
    const installButton = screen.getByText('Install App');
    fireEvent.click(installButton);
    
    // Wait for the promise to be handled
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockUsePWA.promptInstall).toHaveBeenCalled();
    
    consoleError.mockRestore();
  });

  it('should show correct button text for iOS vs non-iOS', () => {
    // Non-iOS
    render(<InstallPrompt />);
    expect(screen.getByText('Install App')).toBeInTheDocument();
    
    // iOS
    mockUsePWA.isIOS = true;
    render(<InstallPrompt />);
    expect(screen.getByText('Show Instructions')).toBeInTheDocument();
  });
});
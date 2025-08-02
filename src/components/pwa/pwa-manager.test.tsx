import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PWAManager, usePWA } from './pwa-manager';

// Mock service worker
const mockServiceWorker = {
  register: vi.fn(),
  addEventListener: vi.fn(),
  getRegistration: vi.fn(),
};

Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Test component that uses the PWA context
const TestComponent = () => {
  const { isInstallable, isOnline, isIOS } = usePWA();
  return (
    <div>
      <div data-testid="installable">{isInstallable ? 'installable' : 'not-installable'}</div>
      <div data-testid="online">{isOnline ? 'online' : 'offline'}</div>
      <div data-testid="ios">{isIOS ? 'ios' : 'not-ios'}</div>
    </div>
  );
};

describe('PWAManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServiceWorker.register.mockResolvedValue({
      addEventListener: vi.fn(),
    });
  });

  it('provides PWA context to children', () => {
    render(
      <PWAManager>
        <TestComponent />
      </PWAManager>
    );

    expect(screen.getByTestId('installable')).toHaveTextContent('not-installable');
    expect(screen.getByTestId('online')).toHaveTextContent('online');
    expect(screen.getByTestId('ios')).toHaveTextContent('not-ios');
  });

  it('registers service worker on mount', () => {
    render(
      <PWAManager>
        <div>Test</div>
      </PWAManager>
    );

    expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js');
  });

  it('throws error when usePWA is used outside PWAManager', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('usePWA must be used within a PWAManager');

    consoleSpy.mockRestore();
  });
});
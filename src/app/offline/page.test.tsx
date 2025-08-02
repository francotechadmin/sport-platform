import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import OfflinePage from './page';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: false,
});

// Mock fetch
global.fetch = vi.fn();

describe('OfflinePage', () => {
  const mockPush = vi.fn();
  const mockBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as vi.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    navigator.onLine = false;
  });

  it('should render offline message and retry button when offline', () => {
    render(<OfflinePage />);
    
    expect(screen.getByText("You're offline")).toBeInTheDocument();
    expect(screen.getByText(/It looks like you've lost your internet connection/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByText('No Connection')).toBeInTheDocument();
  });

  it('should display offline capabilities list', () => {
    render(<OfflinePage />);
    
    expect(screen.getByText('While you\'re offline, you can still:')).toBeInTheDocument();
    expect(screen.getByText('• View previously loaded pages')).toBeInTheDocument();
    expect(screen.getByText('• Access cached content and conversations')).toBeInTheDocument();
    expect(screen.getByText('• Use basic app features')).toBeInTheDocument();
    expect(screen.getByText('• Your actions will sync when reconnected')).toBeInTheDocument();
  });

  it('should show navigation buttons when offline', () => {
    render(<OfflinePage />);
    
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
  });

  it('should handle retry button click and test connectivity', async () => {
    (fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    render(<OfflinePage />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(screen.getByText('Checking Connection...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/favicon.ico', {
        cache: 'no-cache',
        mode: 'no-cors'
      });
    });
  });

  it('should reload page when connectivity test succeeds', async () => {
    const reloadSpy = vi.spyOn(window.location, 'reload');
    (fetch as vi.Mock).mockResolvedValueOnce(new Response());
    
    render(<OfflinePage />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    await waitFor(() => {
      expect(reloadSpy).toHaveBeenCalledOnce();
    });
  });

  it('should navigate home when home button is clicked', () => {
    render(<OfflinePage />);
    
    const homeButton = screen.getByRole('button', { name: /home/i });
    fireEvent.click(homeButton);
    
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should navigate back when back button is clicked', () => {
    render(<OfflinePage />);
    
    const backButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(backButton);
    
    expect(mockBack).toHaveBeenCalledOnce();
  });

  it('should show online status when connection is restored', async () => {
    render(<OfflinePage />);
    
    // Simulate going online
    navigator.onLine = true;
    fireEvent(window, new Event('online'));
    
    await waitFor(() => {
      expect(screen.getByText("You're back online!")).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('✓ Connection restored')).toBeInTheDocument();
    });
  });

  it('should auto-redirect when back online', async () => {
    render(<OfflinePage />);
    
    // Simulate going online
    navigator.onLine = true;
    fireEvent(window, new Event('online'));
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    }, { timeout: 3000 });
  });

  it('should display last checked timestamp', async () => {
    render(<OfflinePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Last checked:/)).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', () => {
    render(<OfflinePage />);
    
    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent("You're offline");
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
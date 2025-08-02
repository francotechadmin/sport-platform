import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OfflineIndicator } from './offline-indicator';

describe('OfflineIndicator', () => {
  it('should not render when online and no pending sync', () => {
    const { container } = render(
      <OfflineIndicator isOnline={true} pendingSync={0} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render offline indicator when offline', () => {
    render(<OfflineIndicator isOnline={false} />);
    expect(screen.getByText("You're offline")).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show pending sync count when offline', () => {
    render(<OfflineIndicator isOnline={false} pendingSync={3} />);
    expect(screen.getByText("You're offline • 3 pending")).toBeInTheDocument();
  });

  it('should show sync status when online with pending items', () => {
    render(<OfflineIndicator isOnline={true} pendingSync={2} />);
    expect(screen.getByText('Syncing 2 items')).toBeInTheDocument();
  });

  it('should show singular form for single pending item', () => {
    render(<OfflineIndicator isOnline={true} pendingSync={1} />);
    expect(screen.getByText('Syncing 1 item')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <OfflineIndicator 
        isOnline={false} 
        className="custom-class" 
      />
    );
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    render(<OfflineIndicator isOnline={false} />);
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });
});
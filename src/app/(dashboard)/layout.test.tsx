import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardAppLayout from './layout';

// Mock the RouteGuard component
vi.mock('@/lib/auth/components/route-guard', () => ({
  RouteGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="route-guard">{children}</div>
  ),
}));

// Mock the DashboardLayout component
vi.mock('@/components/layout/dashboard-layout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

describe('DashboardAppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should wrap DashboardLayout with RouteGuard', () => {
    render(
      <DashboardAppLayout>
        <div data-testid="test-content">Test Content</div>
      </DashboardAppLayout>
    );

    // Verify RouteGuard is present
    expect(screen.getByTestId('route-guard')).toBeInTheDocument();
    
    // Verify DashboardLayout is present inside RouteGuard
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    
    // Verify children are rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should render children within the protected layout structure', () => {
    const testContent = 'Dashboard Page Content';
    
    render(
      <DashboardAppLayout>
        <div>{testContent}</div>
      </DashboardAppLayout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });
});
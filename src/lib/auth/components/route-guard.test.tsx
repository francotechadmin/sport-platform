import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { RouteGuard, withRouteGuard } from './route-guard';
import { useAuth } from '../context/auth-context';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock auth context
vi.mock('../context/auth-context', () => ({
  useAuth: vi.fn(),
}));

const mockPush = vi.fn();
const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe('RouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com', sessionToken: 'token123', createdAt: '2023-01-01' },
      });
    });

    it('should render children when user is authenticated', () => {
      render(
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not show loading fallback when authenticated', () => {
      render(
        <RouteGuard fallback={<div>Loading...</div>}>
          <div>Protected Content</div>
        </RouteGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    });

    it('should redirect to default sign-in page when not authenticated', async () => {
      render(
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/signin');
      });
    });

    it('should redirect to custom path when specified', async () => {
      render(
        <RouteGuard redirectTo="/custom-login">
          <div>Protected Content</div>
        </RouteGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/custom-login');
      });
    });

    it('should show default fallback while redirecting', () => {
      render(
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show custom fallback when provided', () => {
      render(
        <RouteGuard fallback={<div>Redirecting...</div>}>
          <div>Protected Content</div>
        </RouteGuard>
      );

      expect(screen.getByText('Redirecting...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('when authentication is loading', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });
    });

    it('should show loading fallback during authentication check', () => {
      render(
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show custom loading fallback when provided', () => {
      render(
        <RouteGuard fallback={<div>Checking authentication...</div>}>
          <div>Protected Content</div>
        </RouteGuard>
      );

      expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not redirect while loading', () => {
      render(
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      );

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});

describe('withRouteGuard HOC', () => {
  const TestComponent = ({ message }: { message: string }) => (
    <div>{message}</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
  });

  it('should wrap component with route protection', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { email: 'test@example.com', sessionToken: 'token123', createdAt: '2023-01-01' },
    });

    const GuardedComponent = withRouteGuard(TestComponent);
    
    render(<GuardedComponent message="Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should pass through props to wrapped component', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { email: 'test@example.com', sessionToken: 'token123', createdAt: '2023-01-01' },
    });

    const GuardedComponent = withRouteGuard(TestComponent);
    
    render(<GuardedComponent message="Test Message" />);

    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should redirect when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    const GuardedComponent = withRouteGuard(TestComponent);
    
    render(<GuardedComponent message="Protected Message" />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });
    expect(screen.queryByText('Protected Message')).not.toBeInTheDocument();
  });

  it('should use custom options when provided', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    const GuardedComponent = withRouteGuard(TestComponent, {
      redirectTo: '/custom-auth',
      fallback: <div>Custom Loading</div>
    });
    
    render(<GuardedComponent message="Protected Message" />);

    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-auth');
    });
  });

  it('should set correct display name', () => {
    const GuardedComponent = withRouteGuard(TestComponent);
    expect(GuardedComponent.displayName).toBe('withRouteGuard(TestComponent)');
  });

  it('should handle components without display name', () => {
    const AnonymousComponent = () => <div>Anonymous</div>;
    const GuardedComponent = withRouteGuard(AnonymousComponent);
    expect(GuardedComponent.displayName).toBe('withRouteGuard(AnonymousComponent)');
  });
});
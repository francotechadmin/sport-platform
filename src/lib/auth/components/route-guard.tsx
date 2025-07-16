'use client';

import React, { ReactNode, useEffect, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import { Spinner } from '@/components/ui/spinner';

interface RouteGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * RouteGuard component that protects routes by checking authentication status
 * and redirecting unauthenticated users to the sign-in page
 */
export function RouteGuard({ 
  children, 
  fallback = <Spinner fullScreen text="Checking authentication..." />,
  redirectTo = '/signin'
}: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while authentication is being verified
  if (isLoading) {
    return <>{fallback}</>;
  }

  // If not authenticated, show minimal loading during redirect to avoid flash
  if (!isAuthenticated) {
    return <div className="min-h-screen" />; // Empty div to prevent layout shift
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}

/**
 * Higher-order component that wraps a component with route protection
 */
export function withRouteGuard<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    redirectTo?: string;
  }
) {
  const GuardedComponent = (props: P) => {
    return (
      <RouteGuard 
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
      >
        <WrappedComponent {...props} />
      </RouteGuard>
    );
  };

  GuardedComponent.displayName = `withRouteGuard(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return GuardedComponent;
}
'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import { Spinner } from '@/components/ui/spinner';

interface AuthRedirectProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * AuthRedirect component that redirects authenticated users away from auth pages
 * to prevent them from accessing sign-in/sign-up when already logged in
 */
export function AuthRedirect({ 
  children, 
  fallback = <Spinner fullScreen text="Checking authentication..." />,
  redirectTo = '/dashboard'
}: AuthRedirectProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and user is authenticated
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while authentication is being verified
  if (isLoading) {
    return <>{fallback}</>;
  }

  // If authenticated, show minimal loading during redirect to avoid flash
  if (isAuthenticated) {
    return <div className="min-h-screen" />; // Empty div to prevent layout shift
  }

  // User is not authenticated, render the auth content
  return <>{children}</>;
}
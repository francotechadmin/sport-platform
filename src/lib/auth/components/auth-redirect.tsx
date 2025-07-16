'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context';

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
  fallback = <div>Loading...</div>,
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

  // If authenticated, show fallback while redirect is happening
  if (isAuthenticated) {
    return <>{fallback}</>;
  }

  // User is not authenticated, render the auth content
  return <>{children}</>;
}
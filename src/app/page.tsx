'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context/auth-context';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { Spinner } from '@/components/ui/spinner';


export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to chat page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while determining authentication status
  if (isLoading) {
    return <Spinner fullScreen text="Loading..." />;
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    const handleGetStarted = () => {
      router.push('/signup');
    };

    const handleSignIn = () => {
      router.push('/signin');
    };

    return (
      <main>
        <HeroSection onGetStarted={handleGetStarted} onSignIn={handleSignIn} />

        <FeaturesSection />
        <PricingSection onGetStarted={handleGetStarted} />
      </main>
    );
  }

  // This will be briefly shown before redirect for authenticated users
  return <Spinner fullScreen text="Redirecting..." />;
}

'use client';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme-toggle';
import { LandingInstallButton } from '@/components/pwa/landing-install-button';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface HeroSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function HeroSection({ onGetStarted, onSignIn }: HeroSectionProps) {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 sm:p-6 lg:px-8 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image
            src={theme === 'light' ? '/logo-black.png' : '/logo-white.png'}
            alt="ProFormAi Logo"
            width={120}
            height={40}
            className="h-6 sm:h-8 w-auto"
          />
          <span className="text-lg sm:text-xl font-bold text-foreground hidden xs:block">ProFormAi</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ModeToggle />
          <Button variant="ghost" onClick={onSignIn} className="hidden sm:flex">
            Sign In
          </Button>
          <Button onClick={onGetStarted} size="sm" className="sm:size-default">
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Start</span>
          </Button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Your AI Coach is Always{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              by Your Side
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
            Achieve your goals with <span className="text-emerald-600 dark:text-emerald-400 font-semibold">personalized AI-driven coaching</span> that adapts to your unique needs and progress
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            {/* Primary action buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={onGetStarted} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" onClick={onSignIn} className="w-full sm:w-auto border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-950/50">
                Sign In
              </Button>
            </div>
            
            {/* Install button - always visible below */}
            <div className="flex justify-center">
              <LandingInstallButton 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme-toggle';
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Your AI Coach is Always{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              by Your Side
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Achieve your goals with personalized AI-driven coaching that adapts to your unique needs and progress
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={onGetStarted} className="w-full sm:w-auto">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" onClick={onSignIn} className="w-full sm:w-auto">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
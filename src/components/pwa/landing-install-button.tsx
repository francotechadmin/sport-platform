'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePWA } from './pwa-manager';

interface LandingInstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const LandingInstallButton: React.FC<LandingInstallButtonProps> = ({
  variant = 'outline',
  size = 'lg',
  className = '',
}) => {
  const { isInstallable, isIOS, isStandalone, promptInstall, installPrompt } = usePWA();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Update visibility when PWA state changes
  useEffect(() => {
    // For PWA-capable browsers, show button initially and hide only if not installable
    const isPWACapable = 'serviceWorker' in navigator;
    const shouldShow = (isInstallable || isIOS || isPWACapable) && !isStandalone;
    setIsVisible(shouldShow);
    
    // Set loading to false after initial check
    setIsLoading(false);
  }, [isInstallable, isIOS, isStandalone, installPrompt]);



  // Show loading state while determining PWA capabilities
  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={`${className} border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/50`}
      >
        <Download className="h-4 w-4 mr-2 animate-pulse" />
        Checking...
      </Button>
    );
  }

  // Only show if visible state is true
  if (!isVisible) {
    return null;
  }

  const handleInstall = async () => {
    if (isStandalone) {
      // Already installed - could show a message or do nothing
      alert('App is already installed!');
      return;
    }
    
    // Priority order: Native prompt > iOS instructions > Generic instructions
    if (isInstallable && installPrompt) {
      // PWA-capable browser with install prompt ready - use native prompt
      try {
        await promptInstall();
      } catch {
        setShowInstructions(true);
      }
    } else if (isIOS) {
      // iOS Safari - show iOS-specific instructions
      setShowInstructions(true);
    } else {
      // Fallback: show instructions modal for any case where native prompt isn't available
      setShowInstructions(true);
    }
  };

  const InstallInstructionsModal = () => (
    <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Install ProFormAi
          </DialogTitle>
          <DialogDescription>
            {isIOS 
              ? "Follow these steps to install ProFormAi on your iOS device"
              : "Follow these steps to install ProFormAi on your device"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isIOS ? (
            // iOS Instructions
            <>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  1
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tap the Share button</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Share className="h-4 w-4" />
                    <span>Look for the share icon in Safari</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  2
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Select &quot;Add to Home Screen&quot;</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Plus className="h-4 w-4" />
                    <span>Scroll down and tap this option</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  3
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tap &quot;Add&quot;</p>
                  <p className="text-sm text-muted-foreground">
                    Confirm to add ProFormAi to your home screen
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Chrome/Desktop Instructions
            <>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  1
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Look for the install icon</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Download className="h-4 w-4" />
                    <span>Check the address bar for an install icon</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  2
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Click &quot;Install&quot;</p>
                  <p className="text-sm text-muted-foreground">
                    Or use Chrome menu → &quot;Install ProFormAi...&quot;
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  3
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Confirm installation</p>
                  <p className="text-sm text-muted-foreground">
                    The app will be added to your desktop/start menu
                  </p>
                </div>
              </div>
            </>
          )}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Benefits of installing:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Works offline without internet</li>
              <li>• Faster loading and better performance</li>
              <li>• Quick access from your {isIOS ? 'home screen' : 'desktop'}</li>
              <li>• Native app-like experience</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setShowInstructions(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Simple button text and icon since we only show for non-installed apps
  const buttonText = 'Install App';
  const ButtonIcon = Download;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleInstall}
        className={`${className} border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/50`}
      >
        <ButtonIcon className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
      <InstallInstructionsModal />
    </>
  );
};
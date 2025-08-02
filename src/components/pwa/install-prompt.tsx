'use client';

import React, { useState } from 'react';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePWA } from './pwa-manager';

interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  isVisible?: boolean;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  onInstall,
  onDismiss,
  isVisible = true,
}) => {
  const { isInstallable, isIOS, isStandalone, promptInstall, dismissInstall } = usePWA();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Don't show if already installed or not installable (unless iOS)
  if (isStandalone || (!isInstallable && !isIOS) || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      await promptInstall();
      onInstall?.();
    }
  };

  const handleDismiss = () => {
    dismissInstall();
    onDismiss?.();
  };

  const IOSInstructionsModal = () => (
    <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Install ProFormAi
          </DialogTitle>
          <DialogDescription>
            Follow these steps to install ProFormAi on your iOS device
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setShowIOSInstructions(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {/* Mobile-optimized compact design */}
      <div className="animate-in slide-in-from-bottom-2 duration-300">
        <Card className="border border-primary/30 bg-card/98 backdrop-blur-sm shadow-lg max-w-xs">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-foreground">Install App</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0 hover:bg-muted/50 -mr-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Add to home screen for offline access and faster loading
                </p>
                <div className="flex gap-1.5">
                  <Button 
                    onClick={handleInstall} 
                    size="sm" 
                    className="flex-1 h-8 text-xs font-medium"
                  >
                    {isIOS ? 'How to Install' : 'Install'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDismiss}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <IOSInstructionsModal />
    </>
  );
};
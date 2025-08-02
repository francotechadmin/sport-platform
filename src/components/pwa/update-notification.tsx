'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, X, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePWA } from './pwa-manager';

interface UpdateNotificationProps {
  onUpdate?: () => void;
  onDismiss?: () => void;
  autoUpdateDelay?: number; // Auto-update after this many seconds (0 = disabled)
  showProgress?: boolean;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  onUpdate,
  onDismiss,
  autoUpdateDelay = 0,
  showProgress = true,
}) => {
  const { updateAvailable, updateApp } = usePWA();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [autoUpdateCountdown, setAutoUpdateCountdown] = useState(autoUpdateDelay);
  const [updateComplete, setUpdateComplete] = useState(false);

  const handleUpdate = useCallback(async () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    
    try {
      // Simulate download/preparation time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUpdateProgress(100);
      setUpdateComplete(true);
      
      // Small delay to show completion state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateApp();
      onUpdate?.();
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
      setUpdateProgress(0);
    }
  }, [updateApp, onUpdate]);

  // Auto-update countdown
  useEffect(() => {
    if (!updateAvailable || autoUpdateDelay <= 0) return;

    const interval = setInterval(() => {
      setAutoUpdateCountdown(prev => {
        if (prev <= 1) {
          handleUpdate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [updateAvailable, autoUpdateDelay, handleUpdate]);

  // Simulate update progress for better UX
  useEffect(() => {
    if (!isUpdating) return;

    const progressInterval = setInterval(() => {
      setUpdateProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90; // Stop at 90% until actual update completes
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, [isUpdating]);

  if (!updateAvailable) {
    return null;
  }

  const handleDismiss = () => {
    if (isUpdating) return; // Prevent dismissing during update
    onDismiss?.();
  };

  const getUpdateMessage = () => {
    if (updateComplete) return 'Update complete! Restarting...';
    if (isUpdating) return 'Downloading update...';
    if (autoUpdateCountdown > 0) return `Auto-updating in ${autoUpdateCountdown}s`;
    return 'A new version of ProFormAi is ready to install';
  };

  const getUpdateDetails = () => {
    if (updateComplete) return 'The app will restart automatically';
    if (isUpdating) return 'Please wait while we prepare the update';
    return 'This update includes performance improvements and bug fixes';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-2">
      <Card className={`border-2 backdrop-blur-sm transition-colors duration-300 ${
        updateComplete 
          ? 'border-green-300 bg-green-50/95' 
          : isUpdating 
            ? 'border-blue-300 bg-blue-50/95'
            : 'border-orange-300 bg-orange-50/95'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {updateComplete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : isUpdating ? (
                <Download className="h-5 w-5 text-blue-600 animate-bounce" />
              ) : (
                <RefreshCw className={`h-5 w-5 text-orange-600 ${autoUpdateCountdown > 0 ? 'animate-spin' : ''}`} />
              )}
              <CardTitle className="text-lg">
                {updateComplete ? 'Update Complete' : isUpdating ? 'Updating...' : 'Update Available'}
              </CardTitle>
            </div>
            {!isUpdating && onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 hover:bg-white/50"
                disabled={isUpdating}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription className="text-sm">
            {getUpdateMessage()}
          </CardDescription>
          <CardDescription className="text-xs opacity-75">
            {getUpdateDetails()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {showProgress && isUpdating && (
            <div className="mb-3">
              <Progress value={updateProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {Math.round(updateProgress)}% complete
              </p>
            </div>
          )}
          
          {!isUpdating && !updateComplete && (
            <div className="flex gap-2">
              <Button 
                onClick={handleUpdate} 
                className="flex-1"
                disabled={isUpdating}
              >
                {autoUpdateCountdown > 0 ? `Update (${autoUpdateCountdown}s)` : 'Update Now'}
              </Button>
              {onDismiss && (
                <Button 
                  variant="outline" 
                  onClick={handleDismiss}
                  disabled={isUpdating}
                >
                  Later
                </Button>
              )}
            </div>
          )}
          
          {updateComplete && (
            <div className="text-center">
              <Button disabled className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Restarting...
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
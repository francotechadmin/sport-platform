'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Home, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const router = useRouter();

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      setLastChecked(new Date());
    };

    // Set initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Auto-redirect when back online
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000); // Give user 2 seconds to see the "back online" message

      return () => clearTimeout(timer);
    }
  }, [isOnline, router]);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Try to fetch a small resource to test connectivity
      await fetch('/favicon.ico', { 
        cache: 'no-cache',
        mode: 'no-cors'
      });
      
      // If successful, reload the page
      window.location.reload();
    } catch {
      // Still offline, update the last checked time
      setLastChecked(new Date());
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${isOnline ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              {isOnline ? (
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="h-12 w-12 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-2xl">
                {isOnline ? "You&apos;re back online!" : "You&apos;re offline"}
              </CardTitle>
              <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                {isOnline ? "Connected" : "No Connection"}
              </Badge>
            </div>
            
            <p className="text-muted-foreground">
              {isOnline 
                ? "Your internet connection has been restored. Redirecting you back to the app..."
                : "It looks like you&apos;ve lost your internet connection. Check your connection and try again."
              }
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isOnline && (
            <>
              <div className="space-y-2">
                <Button 
                  onClick={handleRetry} 
                  className="w-full" 
                  disabled={isRetrying}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Checking Connection...' : 'Try Again'}
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleGoBack} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  <Button variant="outline" onClick={handleGoHome} className="flex-1">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">While you&apos;re offline, you can still:</p>
                <ul className="space-y-1">
                  <li>• View previously loaded pages</li>
                  <li>• Access cached content and conversations</li>
                  <li>• Use basic app features</li>
                  <li>• Your actions will sync when reconnected</li>
                </ul>
              </div>
              
              {lastChecked && (
                <div className="text-xs text-muted-foreground text-center">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </div>
              )}
            </>
          )}
          
          {isOnline && (
            <div className="text-center space-y-2">
              <div className="text-sm text-green-600 dark:text-green-400">
                ✓ Connection restored
              </div>
              <div className="text-xs text-muted-foreground">
                Redirecting in 2 seconds...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
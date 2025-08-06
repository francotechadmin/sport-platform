'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UpdateNotification } from './update-notification';
import { OfflineIndicator } from './offline-indicator';
import { InstallPrompt } from './install-prompt';
import { backgroundSyncQueue, SyncQueueItem } from '@/lib/background-sync';
import { useAuth } from '@/lib/auth/context/auth-context';
import { isOnboardingComplete } from '@/lib/chat-storage';
import { CacheManager } from '@/lib/cache-management';

// Global variable to capture the beforeinstallprompt event early
let globalInstallPrompt: BeforeInstallPromptEvent | null = null;

// Set up the event listener immediately when this module loads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalInstallPrompt = e as BeforeInstallPromptEvent;
  });
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  isIOS: boolean;
  isStandalone: boolean;
}

interface PWAContextType extends PWAState {
  promptInstall: () => Promise<void>;
  dismissInstall: () => void;
  updateApp: () => void;
  showInstallPrompt: () => void;
}

export const PWAContext = createContext<PWAContextType | null>(null);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAManager');
  }
  return context;
};

interface PWAManagerProps {
  children: React.ReactNode;
}

export const PWAManager: React.FC<PWAManagerProps> = ({ children }) => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    updateAvailable: false,
    installPrompt: null,
    isIOS: false,
    isStandalone: false,
  });
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [syncQueueSize, setSyncQueueSize] = useState(0);

  // Get authentication state
  const { isAuthenticated } = useAuth();

  // Detect iOS and standalone mode
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;

    setPwaState(prev => ({
      ...prev,
      isIOS,
      isStandalone,
      isInstalled: isStandalone,
    }));
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }));
      // Process background sync queue when coming back online
      backgroundSyncQueue.process();
    };
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    // Check if we already captured the event globally
    if (globalInstallPrompt) {
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: globalInstallPrompt,
      }));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      globalInstallPrompt = installEvent;
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: installEvent,
      }));
    };

    // Add listener for future events
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle app installed event
  useEffect(() => {
    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        isStandalone: true,
        installPrompt: null,
      }));
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Setup background sync queue listener
  useEffect(() => {
    const handleQueueChange = (queue: SyncQueueItem[]) => {
      setSyncQueueSize(queue.length);
    };

    backgroundSyncQueue.addListener(handleQueueChange);
    setSyncQueueSize(backgroundSyncQueue.size());

    return () => {
      backgroundSyncQueue.removeListener(handleQueueChange);
    };
  }, []);

  // Trigger install prompt with modal conflict detection and better timing
  useEffect(() => {
    if (isAuthenticated && (pwaState.isInstallable || pwaState.isIOS) && !pwaState.isStandalone) {
      // Check if user has dismissed install prompt recently
      const installDismissedTime = localStorage.getItem('pwa-install-dismissed');
      const now = Date.now();
      const dismissCooldown = 7 * 24 * 60 * 60 * 1000; // 7 days

      // Check if onboarding is complete to avoid modal conflicts
      const onboardingComplete = isOnboardingComplete();

      if (!installDismissed && onboardingComplete &&
        (!installDismissedTime || (now - parseInt(installDismissedTime)) > dismissCooldown)) {
        // Show install prompt after user has had time to engage with the app
        // Longer delay to ensure user has interacted with the app meaningfully
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 5000); // 5 second delay to let user engage first
      }
    }
  }, [isAuthenticated, pwaState.isInstallable, pwaState.isIOS, pwaState.isStandalone, installDismissed]);

  // Register service worker and handle updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully');

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPwaState(prev => ({ ...prev, updateAvailable: true }));
                }
              });
            }
          });

          // PRODUCTION: Periodically check for updates
          if (process.env.NODE_ENV === 'production') {
            const checkForUpdates = () => {
              registration.update().catch(error => {
                console.warn('Update check failed:', error);
              });
            };

            // Check for updates every 5 minutes in production
            const updateInterval = setInterval(checkForUpdates, 5 * 60 * 1000);

            // Check for updates when the page becomes visible (user returns to tab)
            const handleVisibilityChange = () => {
              if (!document.hidden) {
                checkForUpdates();
              }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Cleanup interval on unmount
            return () => {
              clearInterval(updateInterval);
              document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
          }
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', async (event) => {
        const { data } = event;

        if (!data) return;

        switch (data.type) {
          case 'SW_UPDATE_AVAILABLE':
            setPwaState(prev => ({ ...prev, updateAvailable: true }));
            break;

          case 'ADD_TO_SYNC_QUEUE':
            // Add failed request to background sync queue
            if (data.request) {
              const request = new Request(data.request.url, {
                method: data.request.method,
                headers: data.request.headers,
                body: data.request.body,
              });
              await backgroundSyncQueue.add(request);
            }
            break;

          case 'GET_SYNC_QUEUE':
            // Service worker requesting current queue
            const queue = backgroundSyncQueue.getQueue();
            if (event.source) {
              event.source.postMessage({
                type: 'SYNC_QUEUE_RESPONSE',
                queue
              });
            }
            break;

          case 'REMOVE_SYNC_ITEM':
            // Remove successfully synced item
            if (data.id) {
              const currentQueue = backgroundSyncQueue.getQueue();
              const updatedQueue = currentQueue.filter(item => item.id !== data.id);
              backgroundSyncQueue.clear();
              for (const item of updatedQueue) {
                const request = new Request(item.url, {
                  method: item.method,
                  headers: item.headers,
                  body: item.body,
                });
                await backgroundSyncQueue.add(request);
              }
            }
            break;

          case 'SYNC_SUCCESS':
            console.log('Background sync successful:', data.url);
            break;

          case 'SYNC_FAILED':
            console.error('Background sync failed:', data.url, data.error);
            break;
        }
      });
    }
  }, []);

  const promptInstall = async () => {
    if (pwaState.installPrompt) {
      try {
        await pwaState.installPrompt.prompt();
        const choiceResult = await pwaState.installPrompt.userChoice;

        if (choiceResult.outcome === 'accepted') {
          setPwaState(prev => ({
            ...prev,
            isInstallable: false,
            installPrompt: null,
          }));
        }
      } catch (error) {
        console.error('Error prompting install:', error);
        throw error; // Re-throw so button can handle fallback
      }
    } else {
      // No install prompt available yet - throw error so button can show instructions
      throw new Error('Install prompt not available yet');
    }
  };

  const dismissInstall = () => {
    setPwaState(prev => ({
      ...prev,
      isInstallable: false,
      installPrompt: null,
    }));
  };

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          // Clear all caches to ensure fresh content
          CacheManager.clearAllCaches().then(() => {
            window.location.reload();
          });
        } else {
          // Force update check and reload
          CacheManager.updateServiceWorker().then(() => {
            window.location.reload();
          });
        }
      });
    }
  };

  const dismissUpdate = () => {
    setUpdateDismissed(true);
  };

  const handleInstallDismiss = () => {
    setInstallDismissed(true);
    setShowInstallPrompt(false);
    // Store dismiss timestamp to prevent showing again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleInstallSuccess = () => {
    setShowInstallPrompt(false);
    setInstallDismissed(true);
  };

  const showInstallPromptManually = () => {
    // Check if user has dismissed install prompt recently
    const installDismissedTime = localStorage.getItem('pwa-install-dismissed');
    const now = Date.now();
    const dismissCooldown = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (!installDismissed && !pwaState.isStandalone &&
      (!installDismissedTime || (now - parseInt(installDismissedTime)) > dismissCooldown)) {
      setShowInstallPrompt(true);
    }
  };

  const contextValue: PWAContextType = {
    ...pwaState,
    promptInstall,
    dismissInstall,
    updateApp,
    showInstallPrompt: showInstallPromptManually,
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
      <OfflineIndicator
        isOnline={pwaState.isOnline}
        pendingSync={syncQueueSize}
      />
      {pwaState.updateAvailable && !updateDismissed && (
        <UpdateNotification
          onDismiss={dismissUpdate}
          autoUpdateDelay={30} // Auto-update after 30 seconds
          showProgress={true}
        />
      )}
      {(pwaState.isInstallable || pwaState.isIOS) && showInstallPrompt && !installDismissed && !pwaState.isStandalone && (
        <div className={`fixed right-4 z-50 max-w-sm ${pwaState.updateAvailable && !updateDismissed ? 'bottom-48' : 'bottom-4'}`}>
          <InstallPrompt
            onInstall={handleInstallSuccess}
            onDismiss={handleInstallDismiss}
            isVisible={true}
          />
        </div>
      )}
    </PWAContext.Provider>
  );
};
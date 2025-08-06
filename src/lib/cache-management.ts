/**
 * Cache Management Utilities for Development and Production
 * Provides tools to manage PWA caching during development
 */

export interface CacheInfo {
  name: string;
  size: number;
  entries: number;
}

export class CacheManager {
  /**
   * Clear all PWA caches
   */
  static async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) {
      console.warn('Cache API not supported');
      return;
    }

    try {
      const cacheNames = await caches.keys();
      console.log('Clearing caches:', cacheNames);
      
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('All caches cleared successfully');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  /**
   * Clear specific cache by name pattern
   */
  static async clearCacheByPattern(pattern: string): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      const matchingCaches = cacheNames.filter(name => name.includes(pattern));
      
      await Promise.all(
        matchingCaches.map(cacheName => caches.delete(cacheName))
      );
      
      console.log(`Cleared caches matching "${pattern}":`, matchingCaches);
    } catch (error) {
      console.error('Failed to clear cache pattern:', error);
    }
  }

  /**
   * Get information about all caches
   */
  static async getCacheInfo(): Promise<CacheInfo[]> {
    if (!('caches' in window)) return [];

    try {
      const cacheNames = await caches.keys();
      const cacheInfos: CacheInfo[] = [];

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        cacheInfos.push({
          name: cacheName,
          size: 0, // Size calculation would require reading all responses
          entries: keys.length
        });
      }

      return cacheInfos;
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return [];
    }
  }

  /**
   * Force reload without cache
   */
  static forceReload(): void {
    if ('serviceWorker' in navigator) {
      // Unregister service worker temporarily
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
        
        // Clear all caches and reload
        this.clearAllCaches().then(() => {
          window.location.reload();
        });
      });
    } else {
      // Fallback: hard reload
      window.location.reload();
    }
  }



  /**
   * Update service worker and clear caches
   */
  static async updateServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        // Force update check
        await registration.update();
        
        // If there's a waiting worker, activate it
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Clear caches to ensure fresh content
        await this.clearAllCaches();
        
        console.log('Service worker updated and caches cleared');
      }
    } catch (error) {
      console.error('Failed to update service worker:', error);
    }
  }
}

// Development helper functions for console use
if (typeof window !== 'undefined') {
  // Make cache management available globally in development
  (window as { cacheManager?: typeof CacheManager }).cacheManager = CacheManager;
  
  // Add keyboard shortcut for cache clearing (Ctrl+Shift+R)
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'R') {
      event.preventDefault();
      console.log('Force reloading without cache...');
      CacheManager.forceReload();
    }
  });
}

// Auto-enable dev mode in development environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode detected');
  console.log('💡 Use cacheManager.clearAllCaches() to clear all caches');
  console.log('💡 Use cacheManager.forceReload() to reload without cache');
  console.log('💡 Use Ctrl+Shift+R to force reload without cache');
}
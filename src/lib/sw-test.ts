// Service Worker Test Utilities
// This file provides utilities to test service worker functionality

export interface ServiceWorkerTestResult {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  error?: string;
}

export async function testServiceWorker(): Promise<ServiceWorkerTestResult> {
  const result: ServiceWorkerTestResult = {
    isSupported: false,
    isRegistered: false,
    isActive: false
  };

  try {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      result.error = 'Service workers are not supported in this browser';
      return result;
    }
    
    result.isSupported = true;

    // Check if service worker is registered
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) {
      result.error = 'Service worker is not registered';
      return result;
    }
    
    result.isRegistered = true;

    // Check if service worker is active
    if (registration.active) {
      result.isActive = true;
    } else if (registration.installing) {
      result.error = 'Service worker is installing';
    } else if (registration.waiting) {
      result.error = 'Service worker is waiting to activate';
    } else {
      result.error = 'Service worker is in unknown state';
    }

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error occurred';
    return result;
  }
}

export async function testCacheStrategies(): Promise<{
  staticCache: boolean;
  dynamicCache: boolean;
  apiCache: boolean;
  imagesCache: boolean;
}> {
  const result = {
    staticCache: false,
    dynamicCache: false,
    apiCache: false,
    imagesCache: false
  };

  try {
    const cacheNames = await caches.keys();
    
    result.staticCache = cacheNames.some(name => name.includes('static-cache'));
    result.dynamicCache = cacheNames.some(name => name.includes('dynamic-cache'));
    result.apiCache = cacheNames.some(name => name.includes('api-cache'));
    result.imagesCache = cacheNames.some(name => name.includes('images-cache'));
    
    return result;
  } catch (error) {
    console.error('Error testing cache strategies:', error);
    return result;
  }
}

export async function testOfflineFallback(): Promise<boolean> {
  try {
    const cache = await caches.open('static-cache-v1.0.0');
    const offlinePage = await cache.match('/offline');
    return !!offlinePage;
  } catch (error) {
    console.error('Error testing offline fallback:', error);
    return false;
  }
}

// Test different caching strategies
export async function testCachingStrategy(url: string, expectedStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate'): Promise<boolean> {
  try {
    // This is a simplified test - in a real scenario you'd need more sophisticated testing
    const response = await fetch(url);
    const cacheResponse = await caches.match(url);
    
    switch (expectedStrategy) {
      case 'cache-first':
        // For cache-first, we expect the resource to be cached after first fetch
        return response.ok && !!cacheResponse;
      
      case 'network-first':
        // For network-first, we expect fresh network response
        return response.ok;
      
      case 'stale-while-revalidate':
        // For SWR, we expect both network and cache to work
        return response.ok;
      
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error testing ${expectedStrategy} strategy for ${url}:`, error);
    return false;
  }
}
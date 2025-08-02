// Service Worker for PWA Implementation
// Version 1.2.0 - Enhanced with development mode and better cache control

const CACHE_VERSION = 'v1.2.0';
// Use build timestamp for production cache busting
const CACHE_BUILD_ID = self.location.search.slice(1) || 'BUILD_TIMESTAMP_PLACEHOLDER';

// Development mode flag - only enabled in development
let DEV_MODE = false;

// Production cache update settings
const PRODUCTION_UPDATE_CONFIG = {
  // Force cache update check interval (in milliseconds)
  updateCheckInterval: 5 * 60 * 1000, // 5 minutes
  // Maximum age for cached resources in production (in milliseconds)
  maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours
  // Force update for critical resources
  criticalResourceMaxAge: 60 * 60 * 1000, // 1 hour
};

const CACHE_NAMES = {
  static: `static-cache-${CACHE_VERSION}-${CACHE_BUILD_ID}`,
  dynamic: `dynamic-cache-${CACHE_VERSION}`,
  images: `images-cache-${CACHE_VERSION}`,
  api: `api-cache-${CACHE_VERSION}`,
  runtime: `runtime-cache-${CACHE_VERSION}`
};

// Resources to cache during install (critical resources only)
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/site.webmanifest',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png'
];

// Performance-optimized cache sizes
const MAX_CACHE_SIZE = {
  images: 75,    // Increased for better image caching
  dynamic: 150,  // Increased for better page caching
  api: 50,       // Increased for better API response caching
  runtime: 100   // New runtime cache for dynamic resources
};

// Optimized cache duration in milliseconds
const CACHE_MAX_AGE = {
  static: 30 * 24 * 60 * 60 * 1000, // 30 days
  dynamic: 7 * 24 * 60 * 60 * 1000,  // 7 days
  images: 30 * 24 * 60 * 60 * 1000,  // 30 days
  api: 10 * 60 * 1000,               // 10 minutes (increased from 5)
  runtime: 24 * 60 * 60 * 1000       // 24 hours
};

// Cache cleanup configuration
const CACHE_CLEANUP_CONFIG = {
  maxTotalCacheSize: 100 * 1024 * 1024, // 100MB total cache limit
  cleanupInterval: 24 * 60 * 60 * 1000,  // Run cleanup every 24 hours
  lastCleanupKey: 'sw-last-cleanup'
};

// Install Event Handler
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate Event Handler
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches with enhanced versioning
      performCacheCleanup(),
      // Claim all clients
      self.clients.claim(),
      // Schedule periodic cache maintenance
      scheduleCacheMaintenance()
    ])
  );
});

// Fetch Event Handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle all requests (GET and non-GET)
  event.respondWith(handleFetch(request));
});

// Main fetch handler with development mode support
async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // DEVELOPMENT MODE: Bypass all caching if dev mode is enabled
    if (DEV_MODE) {
      console.log('[SW] Dev mode: bypassing cache for', url.pathname);
      return await fetch(request);
    }

    // Performance optimization: Skip caching for certain requests
    if (shouldSkipCache(request)) {
      return await fetch(request);
    }

    // API calls - Network First strategy with performance optimizations
    if (url.pathname.startsWith('/api/')) {
      return await networkFirstStrategy(request, CACHE_NAMES.api);
    }

    // Static assets - Cache First strategy with preloading
    if (isStaticAsset(url)) {
      return await cacheFirstStrategy(request, CACHE_NAMES.static);
    }

    // Images - Cache First strategy with compression awareness
    if (isImageRequest(request)) {
      return await optimizedImageStrategy(request, CACHE_NAMES.images);
    }

    // Runtime resources - Cache with performance optimizations
    if (isRuntimeResource(url)) {
      return await cacheFirstStrategy(request, CACHE_NAMES.runtime);
    }

    // Pages and other resources - Stale While Revalidate strategy
    return await staleWhileRevalidateStrategy(request, CACHE_NAMES.dynamic);

  } catch (error) {
    console.error('[SW] Fetch error:', error);
    return await getOfflineFallback(request);
  }
}

// Performance optimization: Skip caching for certain requests
function shouldSkipCache(request) {
  const url = new URL(request.url);

  // Skip caching for:
  // - POST/PUT/DELETE requests (except for background sync)
  // - Requests with cache-control: no-cache
  // - Very large requests
  // - Analytics/tracking requests

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false; // Let background sync handle these
  }

  if (request.headers.get('cache-control')?.includes('no-cache')) {
    return true;
  }

  // Skip analytics and tracking
  if (url.hostname.includes('analytics') ||
    url.hostname.includes('tracking') ||
    url.pathname.includes('/analytics') ||
    url.pathname.includes('/metrics')) {
    return true;
  }

  return false;
}

// Check if resource is a runtime resource (fonts, icons, etc.)
function isRuntimeResource(url) {
  return url.pathname.includes('/fonts/') ||
    url.pathname.includes('/icons/') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.eot');
}

// Optimized image caching strategy with format awareness
async function optimizedImageStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const url = new URL(request.url);

  // Check for cached version first
  const cachedResponse = await cache.match(request);
  if (cachedResponse && !isExpired(cachedResponse)) {
    return cachedResponse;
  }

  try {
    // Add performance hints for image requests
    const optimizedRequest = new Request(request.url, {
      ...request,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8'
      }
    });

    const networkResponse = await fetch(optimizedRequest);

    if (networkResponse.ok) {
      // Only cache images under a certain size to prevent cache bloat
      const contentLength = networkResponse.headers.get('content-length');
      const maxImageSize = 5 * 1024 * 1024; // 5MB limit

      if (!contentLength || parseInt(contentLength) < maxImageSize) {
        const responseClone = networkResponse.clone();
        await cache.put(request, responseClone);
        await limitCacheSize(cacheName, MAX_CACHE_SIZE.images);
      }
    }

    return networkResponse;
  } catch (error) {
    // Return cached version even if expired when network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache First Strategy - for static assets and images
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && !isExpired(cachedResponse)) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Clone response before caching
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      await limitCacheSize(cacheName, MAX_CACHE_SIZE[cacheName.split('-')[0]]);
    }
    return networkResponse;
  } catch (error) {
    // Return cached version even if expired when network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network First Strategy - for API calls
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      await limitCacheSize(cacheName, MAX_CACHE_SIZE.api);
    }
    return networkResponse;
  } catch (error) {
    // For non-GET requests that fail, add to background sync queue
    if (request.method !== 'GET') {
      await addToSyncQueue(request);
    }

    // Fallback to cache if network fails
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate Strategy - for pages
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Always try to fetch from network in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok && request.method === 'GET') {
      // Only cache GET requests
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      limitCacheSize(cacheName, MAX_CACHE_SIZE.dynamic);
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cached version
    return null;
  });

  // Return cached version immediately if available
  if (cachedResponse && !isExpired(cachedResponse)) {
    // Update cache in background
    fetchPromise;
    return cachedResponse;
  }

  // Wait for network if no cache or cache is expired
  try {
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
  } catch (error) {
    // Network failed
  }

  // Return cached version even if expired as last resort
  if (cachedResponse) {
    return cachedResponse;
  }

  throw new Error('No cached version available and network failed');
}

// Utility functions
function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.includes('/favicon');
}

function isImageRequest(request) {
  return request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(new URL(request.url).pathname);
}

function isExpired(response) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;

  const responseDate = new Date(dateHeader);
  const now = new Date();
  const age = now.getTime() - responseDate.getTime();

  // In production, use shorter cache times to ensure updates are seen
  const isProduction = CACHE_BUILD_ID !== 'BUILD_TIMESTAMP_PLACEHOLDER';

  // Determine max age based on cache type and environment
  let maxAge = CACHE_MAX_AGE.dynamic; // default

  if (response.url.includes('/_next/static/')) {
    // Static assets can be cached longer since they have hashed names
    maxAge = isProduction ? PRODUCTION_UPDATE_CONFIG.maxCacheAge : CACHE_MAX_AGE.static;
  } else if (response.url.includes('/api/')) {
    // API responses should be fresh in production
    maxAge = isProduction ? PRODUCTION_UPDATE_CONFIG.criticalResourceMaxAge : CACHE_MAX_AGE.api;
  } else if (isImageRequest({ url: response.url })) {
    maxAge = CACHE_MAX_AGE.images;
  } else {
    // Pages and other resources - shorter cache in production
    maxAge = isProduction ? PRODUCTION_UPDATE_CONFIG.criticalResourceMaxAge : CACHE_MAX_AGE.dynamic;
  }

  return age > maxAge;
}

async function limitCacheSize(cacheName, maxSize) {
  if (!maxSize) return;

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    // Remove oldest entries (LRU-style cleanup)
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    console.log(`[SW] Cleaned up ${keysToDelete.length} entries from ${cacheName}`);
  }
}

// Enhanced cache cleanup with versioning support
async function performCacheCleanup() {
  console.log('[SW] Performing cache cleanup...');

  try {
    const cacheNames = await caches.keys();
    const currentCacheNames = Object.values(CACHE_NAMES);

    // Delete old version caches
    const deletionPromises = cacheNames
      .filter(cacheName => !currentCacheNames.includes(cacheName))
      .map(cacheName => {
        console.log('[SW] Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      });

    await Promise.all(deletionPromises);

    // Perform size-based cleanup on current caches
    await Promise.all([
      limitCacheSize(CACHE_NAMES.images, MAX_CACHE_SIZE.images),
      limitCacheSize(CACHE_NAMES.dynamic, MAX_CACHE_SIZE.dynamic),
      limitCacheSize(CACHE_NAMES.api, MAX_CACHE_SIZE.api),
      limitCacheSize(CACHE_NAMES.runtime, MAX_CACHE_SIZE.runtime)
    ]);

    // Check total cache size and perform aggressive cleanup if needed
    await performTotalSizeCleanup();

    console.log('[SW] Cache cleanup completed');
  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error);
  }
}

// Monitor and cleanup total cache size
async function performTotalSizeCleanup() {
  try {
    const estimate = await navigator.storage?.estimate?.();
    if (!estimate) return;

    const totalUsage = estimate.usage || 0;
    const maxSize = CACHE_CLEANUP_CONFIG.maxTotalCacheSize;

    if (totalUsage > maxSize) {
      console.log(`[SW] Total cache size (${Math.round(totalUsage / 1024 / 1024)}MB) exceeds limit, performing aggressive cleanup`);

      // Reduce cache sizes more aggressively
      await Promise.all([
        limitCacheSize(CACHE_NAMES.images, Math.floor(MAX_CACHE_SIZE.images * 0.7)),
        limitCacheSize(CACHE_NAMES.dynamic, Math.floor(MAX_CACHE_SIZE.dynamic * 0.7)),
        limitCacheSize(CACHE_NAMES.api, Math.floor(MAX_CACHE_SIZE.api * 0.5)),
        limitCacheSize(CACHE_NAMES.runtime, Math.floor(MAX_CACHE_SIZE.runtime * 0.5))
      ]);
    }
  } catch (error) {
    console.warn('[SW] Could not check storage usage:', error);
  }
}

// Schedule periodic cache maintenance
async function scheduleCacheMaintenance() {
  const lastCleanup = await getLastCleanupTime();
  const now = Date.now();
  const timeSinceLastCleanup = now - lastCleanup;

  if (timeSinceLastCleanup > CACHE_CLEANUP_CONFIG.cleanupInterval) {
    console.log('[SW] Scheduling immediate cache maintenance');
    await performCacheCleanup();
    await setLastCleanupTime(now);
  } else {
    const nextCleanup = CACHE_CLEANUP_CONFIG.cleanupInterval - timeSinceLastCleanup;
    console.log(`[SW] Next cache cleanup in ${Math.round(nextCleanup / 1000 / 60)} minutes`);
  }
}

// Storage helpers for cleanup scheduling
async function getLastCleanupTime() {
  try {
    // Use IndexedDB or fallback to a reasonable default
    return Date.now() - CACHE_CLEANUP_CONFIG.cleanupInterval; // Force initial cleanup
  } catch (error) {
    return 0;
  }
}

async function setLastCleanupTime(timestamp) {
  try {
    // Store in IndexedDB for persistence across SW updates
    // For now, we'll rely on the cleanup interval logic
    console.log('[SW] Cache cleanup timestamp updated');
  } catch (error) {
    console.warn('[SW] Could not store cleanup timestamp:', error);
  }
}

async function getOfflineFallback(request) {
  const url = new URL(request.url);

  // For navigation requests, return offline page
  if (request.mode === 'navigate') {
    try {
      const cache = await caches.open(CACHE_NAMES.static);
      const offlinePage = await cache.match('/offline');
      if (offlinePage) {
        console.log('[SW] Serving cached offline page');
        return offlinePage;
      }

      // If offline page not found in cache, try to create a redirect response
      console.log('[SW] Offline page not in cache, creating redirect');
      return new Response('', {
        status: 302,
        headers: {
          'Location': '/offline'
        }
      });
    } catch (error) {
      console.error('[SW] Error serving offline page:', error);
    }
  }

  // For API requests, return a JSON error response
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This request failed because you are offline'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // For other requests, return a generic offline response
  return new Response(
    'You are offline. Please check your internet connection.',
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    }
  );
}

// Background Sync Queue Management
const SYNC_QUEUE_KEY = 'pwa-sync-queue';

// Background Sync Event Handler
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('[SW] Processing background sync queue');

  try {
    const queue = await getSyncQueue();
    if (queue.length === 0) {
      console.log('[SW] No items in sync queue');
      return;
    }

    console.log(`[SW] Processing ${queue.length} queued requests`);

    for (const item of queue) {
      try {
        await processSyncItem(item);
      } catch (error) {
        console.error('[SW] Failed to process sync item:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

async function processSyncItem(item) {
  const { id, url, method, headers, body, retryCount, maxRetries } = item;

  try {
    const request = new Request(url, {
      method,
      headers,
      body: body && method !== 'GET' && method !== 'HEAD' ? body : undefined,
    });

    const response = await fetch(request);

    if (response.ok) {
      // Success - remove from queue
      await removeSyncItem(id);
      console.log('[SW] Successfully synced:', url);

      // Notify clients of successful sync
      await notifyClients({
        type: 'SYNC_SUCCESS',
        url,
        id
      });
    } else {
      // HTTP error - handle retry
      await handleSyncRetry(item, `HTTP ${response.status}`);
    }
  } catch (error) {
    // Network error - handle retry
    await handleSyncRetry(item, error.message);
  }
}

async function handleSyncRetry(item, error) {
  const updatedItem = {
    ...item,
    retryCount: item.retryCount + 1
  };

  if (updatedItem.retryCount >= item.maxRetries) {
    // Max retries reached - remove from queue
    await removeSyncItem(item.id);
    console.error('[SW] Max retries reached for:', item.url, error);

    // Notify clients of sync failure
    await notifyClients({
      type: 'SYNC_FAILED',
      url: item.url,
      id: item.id,
      error
    });
  } else {
    // Update retry count in queue
    await updateSyncItem(updatedItem);
    console.log(`[SW] Will retry ${item.url} (attempt ${updatedItem.retryCount}/${item.maxRetries})`);
  }
}

async function getSyncQueue() {
  try {
    // In service worker, we need to use a different storage mechanism
    // We'll use IndexedDB or communicate with the main thread
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      // Request queue from main thread
      clients[0].postMessage({ type: 'GET_SYNC_QUEUE' });
      // For now, return empty array - this will be improved with proper IDB implementation
      return [];
    }
    return [];
  } catch (error) {
    console.error('[SW] Failed to get sync queue:', error);
    return [];
  }
}

async function removeSyncItem(id) {
  const clients = await self.clients.matchAll();
  if (clients.length > 0) {
    clients[0].postMessage({
      type: 'REMOVE_SYNC_ITEM',
      id
    });
  }
}

async function updateSyncItem(item) {
  const clients = await self.clients.matchAll();
  if (clients.length > 0) {
    clients[0].postMessage({
      type: 'UPDATE_SYNC_ITEM',
      item
    });
  }
}

async function addToSyncQueue(request) {
  try {
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      // Send request details to main thread for queuing
      const requestData = {
        url: request.url,
        method: request.method,
        headers: {},
        body: null
      };

      // Serialize headers
      request.headers.forEach((value, key) => {
        requestData.headers[key] = value;
      });

      // Serialize body for non-GET requests
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
          const clonedRequest = request.clone();
          requestData.body = await clonedRequest.text();
        } catch (error) {
          console.warn('[SW] Failed to serialize request body:', error);
        }
      }

      clients[0].postMessage({
        type: 'ADD_TO_SYNC_QUEUE',
        request: requestData
      });

      // Register background sync
      if ('serviceWorker' in self && 'sync' in self.registration) {
        await self.registration.sync.register('background-sync');
      }
    }
  } catch (error) {
    console.error('[SW] Failed to add request to sync queue:', error);
  }
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(message);
  });
}

// Push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  // This will be implemented in a future task
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting and taking control');
    self.skipWaiting();

    // Notify all clients that update is available
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATE_AVAILABLE',
          message: 'New version available'
        });
      });
    });
  }

  // Handle development mode toggle
  if (event.data && event.data.type === 'ENABLE_DEV_MODE') {
    console.log('[SW] Enabling development mode - caching disabled');
    DEV_MODE = true;
  }

  if (event.data && event.data.type === 'DISABLE_DEV_MODE') {
    console.log('[SW] Disabling development mode - caching enabled');
    DEV_MODE = false;
  }

  // Handle cache clearing requests
  if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
    console.log('[SW] Clearing all caches...');
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('[SW] All caches cleared');
      // Notify client that caches are cleared
      event.source.postMessage({
        type: 'CACHES_CLEARED',
        message: 'All caches have been cleared'
      });
    });
  }
});

console.log('[SW] Service worker script loaded');
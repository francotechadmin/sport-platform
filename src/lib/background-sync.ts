// Background Sync Queue Implementation
// Handles queuing and syncing of failed requests during offline periods

export interface SyncQueueItem {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncQueueOptions {
  maxRetries?: number;
  retryDelay?: number;
  maxRetryDelay?: number;
  backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<SyncQueueOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  maxRetryDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
};

export class BackgroundSyncQueue {
  private queue: SyncQueueItem[] = [];
  private isProcessing = false;
  private options: Required<SyncQueueOptions>;
  private listeners: Array<(queue: SyncQueueItem[]) => void> = [];

  constructor(options: SyncQueueOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.loadQueue();
  }

  // Add a failed request to the sync queue
  async add(request: Request): Promise<void> {
    try {
      const item: SyncQueueItem = {
        id: this.generateId(),
        url: request.url,
        method: request.method,
        headers: this.serializeHeaders(request.headers),
        body: await this.serializeBody(request),
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: this.options.maxRetries,
      };

      this.queue.push(item);
      await this.saveQueue();
      this.notifyListeners();

      console.log('[BackgroundSync] Added request to queue:', item.url);
    } catch (error) {
      console.error('[BackgroundSync] Failed to add request to queue:', error);
    }
  }

  // Process all items in the queue
  async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log('[BackgroundSync] Processing queue with', this.queue.length, 'items');

    const itemsToProcess = [...this.queue];
    
    for (const item of itemsToProcess) {
      try {
        await this.processItem(item);
      } catch (error) {
        console.error('[BackgroundSync] Failed to process item:', error);
      }
    }

    this.isProcessing = false;
    await this.saveQueue();
    this.notifyListeners();
  }

  // Process a single queue item
  private async processItem(item: SyncQueueItem): Promise<void> {
    try {
      const request = this.reconstructRequest(item);
      const response = await fetch(request);

      if (response.ok) {
        // Success - remove from queue
        this.removeItem(item.id);
        console.log('[BackgroundSync] Successfully synced:', item.url);
      } else {
        // HTTP error - retry with backoff
        await this.handleRetry(item, `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Network error - retry with backoff
      await this.handleRetry(item, error instanceof Error ? error.message : 'Network error');
    }
  }

  // Handle retry logic with exponential backoff
  private async handleRetry(item: SyncQueueItem, error: string): Promise<void> {
    item.retryCount++;

    if (item.retryCount >= item.maxRetries) {
      // Max retries reached - remove from queue
      this.removeItem(item.id);
      console.error('[BackgroundSync] Max retries reached for:', item.url, error);
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.options.retryDelay * Math.pow(this.options.backoffMultiplier, item.retryCount - 1),
      this.options.maxRetryDelay
    );

    console.log(`[BackgroundSync] Retrying ${item.url} in ${delay}ms (attempt ${item.retryCount}/${item.maxRetries})`);

    // Schedule retry
    setTimeout(() => {
      this.processItem(item);
    }, delay);
  }

  // Remove item from queue
  private removeItem(id: string): void {
    const index = this.queue.findIndex(item => item.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  // Reconstruct Request object from queue item
  private reconstructRequest(item: SyncQueueItem): Request {
    const init: RequestInit = {
      method: item.method,
      headers: item.headers,
    };

    if (item.body && item.method !== 'GET' && item.method !== 'HEAD') {
      init.body = item.body;
    }

    return new Request(item.url, init);
  }

  // Serialize request headers
  private serializeHeaders(headers: Headers): Record<string, string> {
    const serialized: Record<string, string> = {};
    headers.forEach((value, key) => {
      serialized[key] = value;
    });
    return serialized;
  }

  // Serialize request body
  private async serializeBody(request: Request): Promise<string | undefined> {
    if (!request.body) return undefined;

    try {
      const clonedRequest = request.clone();
      return await clonedRequest.text();
    } catch (error) {
      console.warn('[BackgroundSync] Failed to serialize request body:', error);
      return undefined;
    }
  }

  // Generate unique ID for queue items
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save queue to localStorage
  private async saveQueue(): Promise<void> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      
      localStorage.setItem('pwa-sync-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('[BackgroundSync] Failed to save queue:', error);
    }
  }

  // Load queue from localStorage
  private loadQueue(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        this.queue = [];
        return;
      }
      
      const saved = localStorage.getItem('pwa-sync-queue');
      if (saved) {
        this.queue = JSON.parse(saved);
        console.log('[BackgroundSync] Loaded', this.queue.length, 'items from storage');
      }
    } catch (error) {
      console.error('[BackgroundSync] Failed to load queue:', error);
      this.queue = [];
    }
  }

  // Add listener for queue changes
  addListener(listener: (queue: SyncQueueItem[]) => void): void {
    this.listeners.push(listener);
  }

  // Remove listener
  removeListener(listener: (queue: SyncQueueItem[]) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notify all listeners of queue changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.queue]);
      } catch (error) {
        console.error('[BackgroundSync] Listener error:', error);
      }
    });
  }

  // Get current queue state
  getQueue(): SyncQueueItem[] {
    return [...this.queue];
  }

  // Clear all items from queue
  clear(): void {
    this.queue = [];
    this.saveQueue();
    this.notifyListeners();
  }

  // Get queue size
  size(): number {
    return this.queue.length;
  }
}

// Singleton instance
export const backgroundSyncQueue = new BackgroundSyncQueue();

// Auto-process queue when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[BackgroundSync] Connection restored, processing queue');
    backgroundSyncQueue.process();
  });
}
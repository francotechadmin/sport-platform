import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BackgroundSyncQueue } from './background-sync';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

describe('BackgroundSyncQueue', () => {
  let syncQueue: BackgroundSyncQueue;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    syncQueue = new BackgroundSyncQueue();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('add', () => {
    it('should add request to queue', async () => {
      const request = new Request('https://example.com/api/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'Content-Type': 'application/json' },
      });

      await syncQueue.add(request);

      const queue = syncQueue.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].url).toBe('https://example.com/api/test');
      expect(queue[0].method).toBe('POST');
      expect(queue[0].retryCount).toBe(0);
    });

    it('should save queue to localStorage', async () => {
      const request = new Request('https://example.com/api/test');
      await syncQueue.add(request);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pwa-sync-queue',
        expect.any(String)
      );
    });
  });

  describe('process', () => {
    it('should process successful requests', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(new Response('OK', { status: 200 }));

      const request = new Request('https://example.com/api/test');
      await syncQueue.add(request);

      await syncQueue.process();

      expect(mockFetch).toHaveBeenCalledWith(expect.any(Request));
      expect(syncQueue.getQueue()).toHaveLength(0);
    });

    it('should retry failed requests', async () => {
      vi.useFakeTimers();
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = new Request('https://example.com/api/test');
      await syncQueue.add(request);

      await syncQueue.process();

      // Should still be in queue for retry
      expect(syncQueue.getQueue()).toHaveLength(1);
      expect(syncQueue.getQueue()[0].retryCount).toBe(1);

      vi.useRealTimers();
    });

    it('should remove items after max retries', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const syncQueueWithLowRetries = new BackgroundSyncQueue({ maxRetries: 1 });
      const request = new Request('https://example.com/api/test');
      await syncQueueWithLowRetries.add(request);

      await syncQueueWithLowRetries.process();

      // Should be removed after max retries
      expect(syncQueueWithLowRetries.getQueue()).toHaveLength(0);
    });
  });

  describe('listeners', () => {
    it('should notify listeners on queue changes', async () => {
      const listener = vi.fn();
      syncQueue.addListener(listener);

      const request = new Request('https://example.com/api/test');
      await syncQueue.add(request);

      expect(listener).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should remove listeners', () => {
      const listener = vi.fn();
      syncQueue.addListener(listener);
      syncQueue.removeListener(listener);

      syncQueue.clear();
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('queue management', () => {
    it('should clear queue', async () => {
      const request = new Request('https://example.com/api/test');
      await syncQueue.add(request);

      syncQueue.clear();

      expect(syncQueue.getQueue()).toHaveLength(0);
      expect(syncQueue.size()).toBe(0);
    });

    it('should load queue from localStorage', () => {
      const savedQueue = JSON.stringify([
        {
          id: 'test-id',
          url: 'https://example.com/api/test',
          method: 'GET',
          headers: {},
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
        },
      ]);

      localStorageMock.getItem.mockReturnValue(savedQueue);

      const newSyncQueue = new BackgroundSyncQueue();
      expect(newSyncQueue.size()).toBe(1);
    });
  });
});
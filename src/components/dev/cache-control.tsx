'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, Settings, AlertTriangle } from 'lucide-react';
import { CacheManager, CacheInfo } from '@/lib/cache-management';

/**
 * Development Cache Control Component
 * Only shows in development environment
 */
export const CacheControl: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCacheInfo = useCallback(async () => {
    const info = await CacheManager.getCacheInfo();
    setCacheInfo(info);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      loadCacheInfo();
    }
  }, [loadCacheInfo]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleClearAllCaches = async () => {
    setIsLoading(true);
    await CacheManager.clearAllCaches();
    await loadCacheInfo();
    setIsLoading(false);
  };

  const handleForceReload = () => {
    CacheManager.forceReload();
  };



  const handleUpdateServiceWorker = async () => {
    setIsLoading(true);
    await CacheManager.updateServiceWorker();
    await loadCacheInfo();
    setIsLoading(false);
  };

  const totalEntries = cacheInfo.reduce((sum, cache) => sum + cache.entries, 0);

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="border-orange-200 bg-orange-50/95 backdrop-blur-sm shadow-lg dark:border-orange-800 dark:bg-orange-950/95">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Dev Cache Control
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">
            <div>Caches: {cacheInfo.length}</div>
            <div>Total entries: {totalEntries}</div>
          </div>

          <div className="flex flex-col gap-2">


            <Button
              size="sm"
              variant="outline"
              onClick={handleClearAllCaches}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All Caches
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleUpdateServiceWorker}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Update SW
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={handleForceReload}
              className="h-8 text-xs"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Force Reload
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <div>💡 Ctrl+Shift+R for force reload</div>
            <div>💡 Use console: cacheManager.*</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
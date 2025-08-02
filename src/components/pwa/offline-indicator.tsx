'use client';

import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingSync?: number;
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  pendingSync = 0,
  className
}) => {
  if (isOnline && pendingSync === 0) {
    return null; // Don't show indicator when online and no pending sync
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300",
        isOnline 
          ? "bg-blue-500 text-white" 
          : "bg-red-500 text-white",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          {pendingSync > 0 && (
            <>
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Syncing {pendingSync} item{pendingSync !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            You&apos;re offline
            {pendingSync > 0 && ` • ${pendingSync} pending`}
          </span>
        </>
      )}
    </div>
  );
};
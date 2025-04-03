"use client";

import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function TopNav() {
  const { theme } = useTheme();

  return (
    <div className="h-16 border-b border-slate-200/10 dark:border-slate-700/30 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">Champion</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              2
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 
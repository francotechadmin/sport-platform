"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, User } from "@deemlol/next-icons";
import { ModeToggle } from "@/components/theme-toggle";

export function TopNav() {
  const [isVisible, setIsVisible] = useState(true);
  const prevScrollPos = useRef(0);

  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const handleScroll = () => {
      const currentScrollPos = mainElement.scrollTop;
      setIsVisible(
        prevScrollPos.current > currentScrollPos || currentScrollPos < 10
      );
      prevScrollPos.current = currentScrollPos;
    };

    mainElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{ transform: isVisible ? "translateY(0)" : "translateY(-100%)" }}
      className="hidden md:block fixed top-0 right-0 h-16 border-b border-slate-200/10 dark:border-slate-700/30 bg-background/95 backdrop-blur-sm z-35 transition-transform duration-300 ml-[255px] w-[calc(100%-255px)]"
    >
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground">
            Welcome back,{" "}
            <span className="font-medium text-foreground">Champion</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
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

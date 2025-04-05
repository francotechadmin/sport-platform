"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Image from "next/image";
import { LogOut, Bell, MessageSquare } from "@deemlol/next-icons";

interface SidebarProps {
  title?: string;
}

export function Sidebar({ title = "ProFormAi" }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Check if the theme is dark
  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkTheme(isDark);
  }, [theme]);

  // Close sidebar when pathname changes (navigation occurs)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close sidebar when escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  // Mock conversation history
  const conversations = [
    { id: 1, title: "Running Training Plan", date: "2 hours ago" },
    { id: 2, title: "Swimming Technique Tips", date: "Yesterday" },
    { id: 3, title: "Nutrition Advice", date: "3 days ago" },
    { id: 4, title: "Recovery Strategies", date: "1 week ago" },
    { id: 5, title: "Race Day Preparation", date: "2 weeks ago" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 border-b border-slate-200/10 dark:border-slate-700/30 shadow-sm bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4">
            <Link
              href="/dashboard"
              className="font-bold text-xl flex items-center gap-2"
            >
              {!isDarkTheme ? (
                <Image
                  src="/logo-black.png"
                  alt="ProFormAi Logo"
                  width={32}
                  height={32}
                  priority
                />
              ) : (
                <Image
                  src="/logo-white.png"
                  alt="ProFormAi Logo"
                  width={32}
                  height={32}
                  priority
                />
              )}
              {title}
            </Link>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  {isMobileOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </>
                  )}
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-40 h-full w-64 border-r border-slate-200/10 dark:border-slate-700/30 shadow-sm flex flex-col transform transition-transform duration-200 ease-in-out
          md:translate-x-0 bg-background/95 backdrop-blur-sm
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:z-0
        `}
      >
        {/* Desktop header - hidden on mobile */}
        <div className="p-4 border-b border-slate-200/10 dark:border-slate-700/30 hidden md:block">
          <Link
            href="/dashboard"
            className="font-bold text-xl flex items-center gap-2"
          >
            {!isDarkTheme ? (
              <Image
                src="/logo-black.png"
                alt="ProFormAi Logo"
                width={32}
                height={32}
                priority
              />
            ) : (
              <Image
                src="/logo-white.png"
                alt="ProFormAi Logo"
                width={32}
                height={32}
                priority
              />
            )}

            {title}
          </Link>
        </div>

        {/* Mobile close button - only visible on mobile */}
        <div className="p-4 border-b border-slate-200/10 dark:border-slate-700/30 flex justify-between items-center md:hidden">
          <div className="flex items-center gap-2">
            {/* logos */}
            {!isDarkTheme ? (
              <Image
                src="/logo-black.png"
                alt="ProFormAi Logo"
                width={32}
                height={32}
                priority
              />
            ) : (
              <Image
                src="/logo-white.png"
                alt="ProFormAi Logo"
                width={32}
                height={32}
                priority
              />
            )}
            <span className="font-bold text-xl">{title}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <Link
            href="/dashboard"
            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive("/dashboard")
                ? "bg-primary/90 text-primary-foreground shadow-sm"
                : "hover:bg-muted/70"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Dashboard
          </Link>

          <Link
            href="/chat"
            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive("/chat")
                ? "bg-primary/90 text-primary-foreground shadow-sm"
                : "hover:bg-muted/70"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Chat
          </Link>

          {/* performance logs */}
          <Link
            href="/performance"
            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive("/performance")
                ? "bg-primary/90 text-primary-foreground shadow-sm"
                : "hover:bg-muted/70"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Performance Logs
          </Link>

          {/*  Analytics */}
          <Link
            href="/analytics"
            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive("/analytics")
                ? "bg-primary/90 text-primary-foreground shadow-sm"
                : "hover:bg-muted/70"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            Analytics
          </Link>

          {/* Legacy - coming soon */}
          <Link
            href="/legacy"
            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive("/legacy")
                ? "bg-primary/90 text-primary-foreground shadow-sm"
                : "hover:bg-muted/70"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Locker Room
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive("/settings")
                ? "bg-primary/90 text-primary-foreground shadow-sm"
                : "hover:bg-muted/70"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </Link>

          {/* Chat History Section - Only shown when on chat page */}
          {isActive("/chat") && (
            <div className="mt-6">
              <div className="flex items-center justify-between px-2 py-2">
                <h2 className="text-sm font-medium">Recent Chats</h2>
                <Button variant="ghost" size="sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span className="ml-1 text-xs">New</span>
                </Button>
              </div>
              <ul className="space-y-1">
                {conversations.map((convo) => (
                  <li key={convo.id}>
                    <Link
                      href={`/chat?id=${convo.id}`}
                      className="flex flex-col rounded-lg p-2 text-sm hover:bg-muted/70 transition-colors duration-200"
                    >
                      <span className="font-medium">{convo.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {convo.date}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200/10 dark:border-slate-700/30 flex flex-col gap-2">
          <Button
            variant="outline"
            asChild
            className="w-full text-sm flex items-center gap-2 border-slate-200/10 dark:border-slate-700/30"
          >
            <Link href="/signin" className="flex items-center gap-2">
              Sign Out
              <LogOut className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

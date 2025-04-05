"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "ProFormAi Chat" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b w-full">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between h-16 px-4">
        <Link href="/dashboard" className="font-bold text-lg">
          {title}
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/chat">Chat</Link>
          <ModeToggle />
          <Button variant="outline" asChild>
            <Link href="/signin">Sign Out</Link>
          </Button>
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t max-w-7xl mx-auto w-full">
          <nav className="flex flex-col py-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Chat
            </Link>
            <Link
              href="/signin"
              className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-red-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign Out
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

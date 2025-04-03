"use client";

import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 md:overflow-y-auto w-full">
        <div className="ios-scroll-container h-full pt-[60px] md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
} 
"use client";

import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1 w-full overflow-y-auto">
        <div className="ios-scroll-container">
          {children}
        </div>
      </main>
    </div>
  );
}

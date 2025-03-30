"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 absolute top-0 right-0">
        <ThemeToggle />
      </header>
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}

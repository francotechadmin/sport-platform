"use client";

import { ModeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 absolute top-0 right-0">
        <ModeToggle />
      </header>
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}

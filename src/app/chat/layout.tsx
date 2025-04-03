"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function ChatAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

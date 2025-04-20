"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ConversationProvider } from "@/lib/conversation-context";

export default function ChatAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConversationProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ConversationProvider>
  );
}

"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ConversationProvider } from "@/lib/conversation-context";
import { RouteGuard } from "@/lib/auth/components/route-guard";
import { Suspense } from "react";

export default function ChatAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <Suspense fallback={<div>Loading...</div>}>
        <ConversationProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </ConversationProvider>
      </Suspense>
    </RouteGuard>
  );
}

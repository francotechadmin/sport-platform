"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteGuard } from "@/lib/auth/components/route-guard";

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </RouteGuard>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { DashboardNav } from "@/components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardNav />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type DashboardAutoRefreshProps = {
  intervalMs?: number;
};

export function DashboardAutoRefresh({
  intervalMs = 30000
}: DashboardAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, router]);

  return null;
}

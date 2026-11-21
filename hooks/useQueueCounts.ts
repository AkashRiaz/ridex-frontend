"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getQueueCountsAction } from "@/app/(dashboardGroup)/_actions/dashboardActions";
import { IQueueCounts, Role } from "@/types";

const STAFF_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "MODERATOR"];

const POLL_INTERVAL_MS = 60_000;

/*
 * Pending listings / open reports / pending verifications for the staff sidebar.
 * Polls every minute while the tab is visible, and refreshes after each
 * navigation (so a badge drops right after approving something).
 * Returns null for non-staff roles or while loading.
 */
export function useQueueCounts(role: Role | null | undefined) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<IQueueCounts | null>(null);

  const isStaff = Boolean(role && STAFF_ROLES.includes(role));

  useEffect(() => {
    if (!isStaff) return;

    let cancelled = false;

    const refresh = () => {
      if (document.visibilityState !== "visible") return;

      getQueueCountsAction()
        .then((result) => {
          if (!cancelled && result) setCounts(result);
        })
        .catch(() => undefined);
    };

    refresh();

    const interval = window.setInterval(refresh, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [isStaff, pathname]);

  return isStaff ? counts : null;
}

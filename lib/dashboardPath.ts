import { Role } from "@/types";

/*
 * One map for every role → dashboard.
 * Used by proxy.ts, the sidebar, the navbar and auth actions.
 * Kept free of React/icon imports so proxy.ts can use it.
 */
export const ROLE_DASHBOARD_PATH: Record<Role, string> = {
  SUPER_ADMIN: "/super-admin-dashboard",
  ADMIN: "/admin-dashboard",
  MODERATOR: "/moderator-dashboard",
  DEALER: "/dealer-dashboard",
  DEALER_STAFF: "/dealer-staff-dashboard",
  SELLER: "/seller-dashboard",
  INSPECTOR: "/inspector-dashboard",
  BUYER: "/buyer-dashboard",
};

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && value in ROLE_DASHBOARD_PATH;

export const getDashboardPath = (role: string | null | undefined) =>
  isRole(role) ? ROLE_DASHBOARD_PATH[role] : null;

/*
 * Returns the role that owns a dashboard path, e.g.
 * "/dealer-staff-dashboard/leads" → "DEALER_STAFF".
 * Longest prefix first so "/dealer-dashboard" never matches "/dealer-staff-dashboard".
 */
export const getRoleForDashboardPath = (pathname: string): Role | null => {
  const entries = Object.entries(ROLE_DASHBOARD_PATH) as [Role, string][];

  const match = entries
    .sort((first, second) => second[1].length - first[1].length)
    .find(
      ([, path]) => pathname === path || pathname.startsWith(`${path}/`),
    );

  return match ? match[0] : null;
};

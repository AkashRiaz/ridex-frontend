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

export const getProfilePath = (role: string | null | undefined) => {
  const dashboardPath = getDashboardPath(role);

  return dashboardPath ? `${dashboardPath}/profile` : "/";
};

/*
 * Where to send a user after login / verification.
 * - must change password → profile security tab
 * - safe `redirectTo` (same-site path the role may open) → there
 * - otherwise → the role's dashboard
 */
export const resolvePostLoginPath = ({
  role,
  redirectTo,
  needPasswordChange,
}: {
  role: string | null | undefined;
  redirectTo?: string | null;
  needPasswordChange?: boolean;
}) => {
  if (needPasswordChange) {
    return `${getProfilePath(role)}?tab=security&required=1`;
  }

  const isSafePath =
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//") &&
    !redirectTo.startsWith("/\\");

  if (isSafePath) {
    const ownerRole = getRoleForDashboardPath(redirectTo.split("?")[0]);

    if (!ownerRole || ownerRole === role) {
      return redirectTo;
    }
  }

  return getDashboardPath(role) ?? "/";
};

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

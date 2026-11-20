import { Role } from "@/types";
import { CREATABLE_ROLES } from "./enum";

/*
 * UI-only mirror of ridex-backend/src/app/module/user/user.utils.ts.
 * Used to hide actions the API would reject; the API is the real guard.
 */

export const USER_MANAGER_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];
export const USER_VIEWER_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "MODERATOR"];

export const canCreateRole = (actorRole: Role, targetRole: Role) =>
  CREATABLE_ROLES[actorRole]?.includes(targetRole) ?? false;

export const canManageUser = (
  actor: { id: string; role: Role },
  target: { id: string; role: Role },
) => {
  if (!USER_MANAGER_ROLES.includes(actor.role)) return false;
  if (actor.id === target.id) return false;
  if (target.role === "SUPER_ADMIN") return false;
  if (target.role === "ADMIN" && actor.role !== "SUPER_ADMIN") return false;
  return true;
};

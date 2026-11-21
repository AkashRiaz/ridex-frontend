"use server";

import { baseApi } from "@/service/baseApi";
import { IAuditLog, IAuditLogEntity, TSearchParams } from "@/types";

/*
 * Read-only. Admins and super admins only; the backend hides
 * super admin entries from admins.
 */

const AUDIT_QUERY_KEYS = ["page", "limit", "searchTerm", "action", "entity", "entityId", "userId", "from", "to", "sortOrder"];

const pickQuery = (query: TSearchParams | undefined) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => AUDIT_QUERY_KEYS.includes(key)));

export const getAllAuditLogsAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<IAuditLog[]>("/audit-logs", { query: { limit: "20", ...pickQuery(query) }, cache: "no-store" });

export const getAuditLogByIdAction = async (id: string) =>
  baseApi<IAuditLog>(`/audit-logs/${encodeURIComponent(id)}`, { cache: "no-store" });

export const getAuditLogEntitiesAction = async () =>
  baseApi<IAuditLogEntity[]>("/audit-logs/entities", { cache: "no-store" });

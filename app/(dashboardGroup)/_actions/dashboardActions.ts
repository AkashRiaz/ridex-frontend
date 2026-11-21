"use server";

import { baseApi } from "@/service/baseApi";
import {
  IAdminOverview,
  IBuyerOverview,
  IModeratorOverview,
  IQueueCounts,
  ISellerOverview,
  TDashboardRange,
} from "@/types";

/*
 * Overviews are personal or live counts, so they are never cached by Next.
 * The backend caches the admin and moderator overviews for a short time.
 */

const RANGES: TDashboardRange[] = ["7d", "30d", "90d"];

const toRange = (range?: string): TDashboardRange =>
  RANGES.includes(range as TDashboardRange) ? (range as TDashboardRange) : "30d";

export const getAdminOverviewAction = async (range?: string) =>
  baseApi<IAdminOverview>("/dashboard/admin/overview", { query: { range: toRange(range) }, cache: "no-store" });

export const getModeratorOverviewAction = async (range?: string) =>
  baseApi<IModeratorOverview>("/dashboard/moderator/overview", {
    query: { range: toRange(range) },
    cache: "no-store",
  });

export const getSellerOverviewAction = async (range?: string) =>
  baseApi<ISellerOverview>("/dashboard/seller/overview", { query: { range: toRange(range) }, cache: "no-store" });

export const getBuyerOverviewAction = async (range?: string) =>
  baseApi<IBuyerOverview>("/dashboard/buyer/overview", { query: { range: toRange(range) }, cache: "no-store" });

// sidebar badges; null when the request fails so the badges simply hide
export const getQueueCountsAction = async (): Promise<IQueueCounts | null> => {
  const result = await baseApi<IQueueCounts>("/dashboard/staff/queue-counts", { cache: "no-store" });

  return result.success ? result.data : null;
};

"use server";

import { baseApi } from "@/service/baseApi";
import { IRecentlyViewedItem, TActionState } from "@/types";

export const getMyRecentlyViewedAction = async () =>
  baseApi<IRecentlyViewedItem[]>("/recently-viewed", { query: { limit: "50" } });

export const removeRecentlyViewedAction = async (listingId: string): Promise<TActionState> => {
  const result = await baseApi(`/recently-viewed/${encodeURIComponent(listingId)}`, { method: "DELETE" });

  return {
    success: result.success,
    message: result.success ? "Removed from history" : result.message,
    statusCode: result.statusCode,
  };
};

export const clearRecentlyViewedAction = async (): Promise<TActionState> => {
  const result = await baseApi("/recently-viewed", { method: "DELETE" });

  return {
    success: result.success,
    message: result.success ? "History cleared" : result.message,
    statusCode: result.statusCode,
  };
};

"use server";

import { baseApi } from "@/service/baseApi";
import { IWishlistItem, TActionState, TSearchParams } from "@/types";

const pickQuery = (query: TSearchParams | undefined) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => ["page", "limit"].includes(key)));

export const getMyWishlistAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<IWishlistItem[]>("/wishlist", { query: { limit: "24", ...pickQuery(query) } });

/*
 * Saved listing ids for heart icons. Signed-out visitors get an empty list.
 */
export const getMyWishlistIdsAction = async (): Promise<string[]> => {
  const result = await baseApi<string[]>("/wishlist/ids");

  return result.success ? (result.data ?? []) : [];
};

export const toggleWishlistAction = async (
  listingId: string,
  save: boolean,
): Promise<TActionState<{ listingId: string; saved: boolean }>> => {
  const result = await baseApi<{ listingId: string; saved: boolean }>(
    `/wishlist/${encodeURIComponent(listingId)}`,
    { method: save ? "POST" : "DELETE" },
  );

  return {
    success: result.success,
    message: result.success ? (save ? "Saved to your wishlist" : "Removed from your wishlist") : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

"use server";

import { baseApi } from "@/service/baseApi";
import { IBlockedUser, TActionState, TSearchParams } from "@/types";

export const getMyBlockedUsersAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<IBlockedUser[]>("/blocks", {
    query: { limit: "20", page: Array.isArray(query?.page) ? query.page[0] : query?.page },
  });

export const setUserBlockedAction = async (userId: string, blocked: boolean): Promise<TActionState> => {
  const result = await baseApi(`/blocks/${encodeURIComponent(userId)}`, { method: blocked ? "POST" : "DELETE" });

  return {
    success: result.success,
    message: result.success ? (blocked ? "User blocked" : "User unblocked") : result.message,
    statusCode: result.statusCode,
  };
};

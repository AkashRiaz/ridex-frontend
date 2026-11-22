"use server";

import { baseApi } from "@/service/baseApi";
import {
  ISavedSearch,
  ISavedSearchDetail,
  ISavedSearchLookup,
  TActionState,
  TApiResponse,
  TSavedSearchAlertFrequency,
  TSearchParams,
} from "@/types";

/*
 * Saved searches are personal and their match counts change with every
 * new listing: every read is fresh (no-store).
 */

const toActionState = <T>(result: TApiResponse<T>, successMessage: string): TActionState<T> => ({
  success: result.success,
  message: result.success ? successMessage : result.message,
  statusCode: result.statusCode,
  data: result.data,
});

const savedSearchPath = (id: string, action = "") => `/saved-searches/${encodeURIComponent(id)}${action}`;

// first value of every URL param (the backend keeps only search filters)
const flattenParams = (params: TSearchParams | undefined) =>
  Object.fromEntries(
    Object.entries(params ?? {})
      .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value] as const)
      .filter((entry): entry is readonly [string, string] => typeof entry[1] === "string" && entry[1] !== ""),
  );

// ============================================
// Reads
// ============================================

export const getMySavedSearchesAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<ISavedSearch[]>("/saved-searches", {
    cache: "no-store",
    query: { limit: "20", ...Object.fromEntries(Object.entries(flattenParams(query)).filter(([key]) => ["page", "searchTerm"].includes(key))) },
  });

export const getSavedSearchByIdAction = async (id: string) =>
  baseApi<ISavedSearchDetail>(savedSearchPath(id), { cache: "no-store" });

// is the search in these URL params already saved?
export const lookupSavedSearchAction = async (params: TSearchParams) =>
  baseApi<ISavedSearchLookup>("/saved-searches/lookup", {
    cache: "no-store",
    query: flattenParams(params),
  });

// ============================================
// Changes
// ============================================

export const createSavedSearchAction = async (payload: {
  query: TSearchParams;
  name?: string;
  alertFrequency: TSavedSearchAlertFrequency;
  notifyPriceDrops: boolean;
}) =>
  toActionState(
    await baseApi<ISavedSearch>("/saved-searches", {
      method: "POST",
      body: { ...payload, query: flattenParams(payload.query) },
    }),
    "Search saved. We'll let you know about new matches.",
  );

export const updateSavedSearchAction = async (
  id: string,
  payload: { name?: string; alertFrequency?: TSavedSearchAlertFrequency; notifyPriceDrops?: boolean },
) => toActionState(await baseApi<ISavedSearch>(savedSearchPath(id), { method: "PATCH", body: payload }), "Saved search updated");

export const markSavedSearchSeenAction = async (id: string) =>
  toActionState(await baseApi<{ id: string }>(savedSearchPath(id, "/seen"), { method: "PATCH" }), "Marked as seen");

export const deleteSavedSearchAction = async (id: string) =>
  toActionState(await baseApi<null>(savedSearchPath(id), { method: "DELETE" }), "Saved search deleted");

"use server";

import { baseApi } from "@/service/baseApi";
import { IOffer, IOfferDetail, TActionState, TApiResponse, TSearchParams } from "@/types";

/*
 * Offers are personal and change often: every read is fresh (no-store),
 * and cards in chat update live through the "offer:updated" socket event.
 */

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

const toActionState = <T>(result: TApiResponse<T>, successMessage: string): TActionState<T> => ({
  success: result.success,
  message: result.success ? successMessage : result.message,
  statusCode: result.statusCode,
  data: result.data,
});

const offerPath = (offerId: string, action = "") => `/offers/${encodeURIComponent(offerId)}${action}`;

// ============================================
// Reads
// ============================================

export const getMyOffersAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<IOffer[]>("/offers", {
    query: { limit: "10", ...pickQuery(query, ["page", "as", "status", "listingId", "searchTerm", "sortBy", "sortOrder"]) },
  });

export const getOfferByIdAction = async (offerId: string) => baseApi<IOfferDetail>(offerPath(offerId));

// ============================================
// Changes
// ============================================

export const makeOfferAction = async (payload: { listingId: string; amount: number; message?: string }) =>
  toActionState(await baseApi<IOffer>("/offers", { method: "POST", body: payload }), "Offer sent");

export const counterOfferAction = async (offerId: string, payload: { amount: number; message?: string }) =>
  toActionState(
    await baseApi<IOffer>(offerPath(offerId, "/counter"), { method: "POST", body: payload }),
    "Counter offer sent",
  );

export const acceptOfferAction = async (offerId: string) =>
  toActionState(await baseApi<IOffer>(offerPath(offerId, "/accept"), { method: "PATCH" }), "Offer accepted");

export const declineOfferAction = async (offerId: string, reason?: string) =>
  toActionState(
    await baseApi<IOffer>(offerPath(offerId, "/decline"), {
      method: "PATCH",
      body: reason ? { reason } : {},
    }),
    "Offer declined",
  );

export const withdrawOfferAction = async (offerId: string) =>
  toActionState(await baseApi<IOffer>(offerPath(offerId, "/withdraw"), { method: "PATCH" }), "Offer withdrawn");

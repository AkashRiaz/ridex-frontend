"use server";

import { updateTag } from "next/cache";
import { baseApi } from "@/service/baseApi";
import {
  IRatingSummary,
  IReview,
  IReviewEligibility,
  TActionState,
  TApiResponse,
  TSearchParams,
} from "@/types";

export type ReviewListResponse = TApiResponse<IReview[]> & {
  meta?: TApiResponse<IReview[]>["meta"] & { summary?: IRatingSummary };
};

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

const toState = (result: TApiResponse<IReview>, successMessage: string): TActionState<IReview> => {
  if (result.success) {
    // ratings appear on seller profiles, cards and listing detail
    updateTag("reviews");
    updateTag("listings");
  }

  return {
    success: result.success,
    message: result.success ? result.message || successMessage : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

// ============================================
// Reads
// ============================================

export const getSellerReviewsAction = async (sellerId: string, query?: TSearchParams) =>
  baseApi<IReview[]>("/reviews", {
    auth: false,
    query: { seller: sellerId, limit: "10", ...pickQuery(query, ["page", "rating"]) },
    revalidate: 60,
    tags: ["reviews"],
  }) as Promise<ReviewListResponse>;

export const getReviewEligibilityAction = async (listingId: string) =>
  baseApi<IReviewEligibility>(`/reviews/eligibility/${encodeURIComponent(listingId)}`);

export const getGivenReviewsAction = async (query?: TSearchParams) =>
  baseApi<IReview[]>("/reviews/given", { query: { limit: "10", ...pickQuery(query, ["page"]) } });

export const getReceivedReviewsAction = async (query?: TSearchParams) =>
  baseApi<IReview[]>("/reviews/received", {
    query: { limit: "10", ...pickQuery(query, ["page", "replied"]) },
  });

// ============================================
// Changes
// ============================================

export const createReviewAction = async (payload: { listingId: string; rating: number; comment: string }) =>
  toState(await baseApi<IReview>("/reviews", { method: "POST", body: payload }), "Review posted");

export const updateReviewAction = async (reviewId: string, payload: { rating: number; comment: string }) =>
  toState(
    await baseApi<IReview>(`/reviews/${encodeURIComponent(reviewId)}`, { method: "PATCH", body: payload }),
    "Review updated",
  );

export const deleteReviewAction = async (reviewId: string) =>
  toState(
    await baseApi<IReview>(`/reviews/${encodeURIComponent(reviewId)}`, { method: "DELETE" }),
    "Review deleted",
  );

export const replyToReviewAction = async (reviewId: string, reply: string) =>
  toState(
    await baseApi<IReview>(`/reviews/${encodeURIComponent(reviewId)}/reply`, {
      method: "POST",
      body: { reply },
    }),
    "Reply posted",
  );

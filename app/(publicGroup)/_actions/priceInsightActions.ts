"use server";

import { baseApi } from "@/service/baseApi";
import { IPriceInsight } from "@/types";

/*
 * Not cached here: the backend caches each rating in Redis per listing + price,
 * and owners/staff (token sent when signed in) may rate unpublished listings.
 */
export const getListingPriceInsightAction = async (idOrSlug: string) =>
  baseApi<IPriceInsight>(`/price-insights/listings/${encodeURIComponent(idOrSlug)}`, {
    auth: "optional",
    cache: "no-store",
  });

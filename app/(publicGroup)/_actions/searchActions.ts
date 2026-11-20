"use server";

import { baseApi } from "@/service/baseApi";
import {
  IListingCard,
  IListingDetail,
  ISearchFilters,
  TApiResponse,
  TSearchParams,
} from "@/types";

export type SearchListingsResponse = TApiResponse<IListingCard[]>;

// search results change whenever a listing is approved — keep the cache short
const SEARCH_REVALIDATE_SECONDS = 60;

/*
 * Forwards every search-related URL param (including dynamic spec.* filters).
 */
const SEARCH_KEYS = [
  "searchTerm",
  "vehicleType",
  "brand",
  "model",
  "minPrice",
  "maxPrice",
  "minYear",
  "maxYear",
  "maxMileage",
  "condition",
  "negotiable",
  "division",
  "district",
  "lat",
  "lng",
  "radius",
  "sortBy",
  "page",
  "limit",
];

export const searchListingsAction = async ({
  query,
}: { query?: TSearchParams } = {}): Promise<SearchListingsResponse> => {
  const filtered = Object.fromEntries(
    Object.entries(query ?? {}).filter(
      ([key]) => SEARCH_KEYS.includes(key) || key.startsWith("spec."),
    ),
  );

  const isNearSearch = Boolean(filtered.lat && filtered.lng);

  return baseApi<IListingCard[]>("/search/listings", {
    auth: false,
    query: { limit: "24", ...filtered },
    // "near me" results are personal — never cache them
    ...(isNearSearch
      ? { cache: "no-store" as const }
      : { revalidate: SEARCH_REVALIDATE_SECONDS, tags: ["listings"] }),
  });
};

export const getSearchFiltersAction = async (vehicleType?: string) =>
  baseApi<ISearchFilters>("/search/filters", {
    auth: false,
    query: vehicleType ? { vehicleType } : undefined,
    revalidate: SEARCH_REVALIDATE_SECONDS,
    tags: ["listings"],
  });

/*
 * Detail is never cached: every visit counts a view, and owners/staff
 * (token sent when signed in) may preview unapproved listings.
 */
export const getListingBySlugAction = async (slug: string) =>
  baseApi<IListingDetail>(`/listings/${encodeURIComponent(slug)}`, {
    auth: "optional",
    cache: "no-store",
  });

export const getSimilarListingsAction = async (slug: string) =>
  baseApi<IListingCard[]>(`/listings/${encodeURIComponent(slug)}/similar`, {
    auth: false,
    revalidate: 300,
    tags: ["listings"],
  });

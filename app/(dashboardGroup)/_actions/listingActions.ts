"use server";

import { updateTag } from "next/cache";
import { baseApi } from "@/service/baseApi";
import { validateImageFile } from "@/lib/toMultipart";
import {
  IListingCard,
  IListingDetail,
  TActionState,
  TApiResponse,
  TListingStatusCounts,
  TSearchParams,
} from "@/types";

export type ListingListResponse = TApiResponse<IListingCard[]> & {
  meta?: TApiResponse<IListingCard[]>["meta"] & { statusCounts?: TListingStatusCounts };
};

export type ListingActionState = TActionState<IListingDetail>;

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

const toState = (
  result: TApiResponse<IListingDetail>,
  successMessage: string,
): ListingActionState => {
  if (result.success) {
    // search, cards and detail pages must show the change immediately
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

export const getMyListingsAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<IListingCard[]>("/listings/my-listings", {
    query: { limit: "12", ...pickQuery(query, ["status", "searchTerm", "page", "limit"]) },
  }) as Promise<ListingListResponse>;

export const getManagedListingsAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<IListingCard[]>("/listings/manage", {
    query: {
      limit: "20",
      ...pickQuery(query, ["status", "searchTerm", "vehicleType", "brand", "sellerId", "page", "limit"]),
    },
  }) as Promise<ListingListResponse>;

// owner / staff view of any status (same endpoint, token required)
export const getListingForManageAction = async (listingId: string) =>
  baseApi<IListingDetail>(`/listings/${encodeURIComponent(listingId)}`);

// ============================================
// Wizard (owner)
// ============================================

export const createListingDraftAction = async (payload: {
  vehicleTypeId: string;
  brandId: string;
  vehicleModelId?: string;
  year: number;
}) =>
  toState(
    await baseApi<IListingDetail>("/listings", { method: "POST", body: payload }),
    "Draft created",
  );

export const updateListingAction = async (listingId: string, payload: Record<string, unknown>) =>
  toState(
    await baseApi<IListingDetail>(`/listings/${listingId}`, { method: "PATCH", body: payload }),
    "Saved",
  );

/*
 * One photo per call keeps every request under the 5MB server-action limit.
 */
export const uploadListingImageAction = async (
  listingId: string,
  formData: FormData,
): Promise<ListingActionState> => {
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Choose a photo", statusCode: 400 };
  }

  const error = validateImageFile(file);

  if (error) {
    return { success: false, message: `${file.name}: ${error}`, statusCode: 400 };
  }

  const upload = new FormData();
  upload.append("images", file);

  return toState(
    await baseApi<IListingDetail>(`/listings/${listingId}/images`, {
      method: "POST",
      formData: upload,
    }),
    "Photo added",
  );
};

export const reorderListingImagesAction = async (
  listingId: string,
  order: string[],
  coverImageId?: string,
) =>
  toState(
    await baseApi<IListingDetail>(`/listings/${listingId}/images`, {
      method: "PATCH",
      body: { order, ...(coverImageId && { coverImageId }) },
    }),
    "Photo order saved",
  );

export const deleteListingImageAction = async (listingId: string, imageId: string) =>
  toState(
    await baseApi<IListingDetail>(`/listings/${listingId}/images/${imageId}`, {
      method: "DELETE",
    }),
    "Photo removed",
  );

// ============================================
// Status (owner)
// ============================================

export const submitListingAction = async (listingId: string) =>
  toState(
    await baseApi<IListingDetail>(`/listings/${listingId}/submit`, { method: "POST" }),
    "Submitted for review",
  );

export const markListingSoldAction = async (listingId: string) =>
  toState(
    await baseApi<IListingDetail>(`/listings/${listingId}/mark-sold`, { method: "POST" }),
    "Marked as sold",
  );

export const renewListingAction = async (listingId: string) =>
  toState(
    await baseApi<IListingDetail>(`/listings/${listingId}/renew`, { method: "POST" }),
    "Listing renewed",
  );

export const deleteListingAction = async (listingId: string): Promise<TActionState> => {
  const result = await baseApi(`/listings/${listingId}`, { method: "DELETE" });

  if (result.success) updateTag("listings");

  return {
    success: result.success,
    message: result.success ? "Listing deleted" : result.message,
    statusCode: result.statusCode,
  };
};

// ============================================
// Moderation (staff)
// ============================================

export const updateListingStatusAction = async (
  listingId: string,
  status: "APPROVED" | "REJECTED",
  reason?: string,
) =>
  toState(
    await baseApi<IListingDetail>(`/listings/${listingId}/status`, {
      method: "PATCH",
      body: { status, ...(reason && { reason }) },
    }),
    status === "APPROVED" ? "Listing approved" : "Listing rejected",
  );

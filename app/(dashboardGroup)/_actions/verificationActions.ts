"use server";

import { updateTag } from "next/cache";
import { baseApi } from "@/service/baseApi";
import { MAX_IMAGE_SIZE } from "@/lib/toMultipart";
import {
  IMyVerification,
  IVerificationRequest,
  IVerificationRequestDetail,
  TActionState,
  TApiResponse,
  TSearchParams,
  TVerificationStatus,
} from "@/types";

export type VerificationListResponse = TApiResponse<IVerificationRequest[]> & {
  meta?: TApiResponse<IVerificationRequest[]>["meta"] & {
    statusCounts?: Partial<Record<TVerificationStatus, number>>;
  };
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"];

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

export const getMyVerificationAction = async () => baseApi<IMyVerification>("/verifications/me");

/*
 * formData: "data" (JSON incl. documentKinds) + one "documents" file per kind, same order.
 */
export const submitVerificationAction = async (formData: FormData): Promise<TActionState<IVerificationRequest>> => {
  const data = formData.get("data");
  const files = formData.getAll("documents").filter((file): file is File => file instanceof File && file.size > 0);

  if (typeof data !== "string" || files.length === 0) {
    return { success: false, message: "Add your documents", statusCode: 400 };
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, message: `${file.name}: use a JPG, PNG, WebP or PDF file`, statusCode: 400 };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { success: false, message: `${file.name}: files must be 5MB or smaller`, statusCode: 400 };
    }
  }

  const upload = new FormData();
  upload.append("data", data);
  for (const file of files) upload.append("documents", file);

  const result = await baseApi<IVerificationRequest>("/verifications", { method: "POST", formData: upload });

  return {
    success: result.success,
    message: result.success ? "Submitted — we usually review within 1–2 working days" : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

// ============================================
// Admin
// ============================================

export const getVerificationRequestsAction = async (query?: TSearchParams) =>
  baseApi<IVerificationRequest[]>("/verifications", {
    query: { limit: "20", ...pickQuery(query, ["status", "type", "searchTerm", "page", "limit"]) },
  }) as Promise<VerificationListResponse>;

export const getVerificationRequestByIdAction = async (requestId: string) =>
  baseApi<IVerificationRequestDetail>(`/verifications/${encodeURIComponent(requestId)}`);

export const reviewVerificationAction = async (
  requestId: string,
  payload: { status: "APPROVED" | "REJECTED"; reason?: string },
): Promise<TActionState<IVerificationRequestDetail>> => {
  const result = await baseApi<IVerificationRequestDetail>(`/verifications/${encodeURIComponent(requestId)}`, {
    method: "PATCH",
    body: payload,
  });

  if (result.success && payload.status === "APPROVED") {
    // new badges show on cards, listing detail and seller profiles
    updateTag("listings");
    updateTag("reviews");
  }

  return {
    success: result.success,
    message: result.success
      ? payload.status === "APPROVED"
        ? "Approved — the badge is now visible"
        : "Request rejected"
      : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

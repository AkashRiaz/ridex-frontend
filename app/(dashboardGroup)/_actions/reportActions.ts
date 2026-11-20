"use server";

import { updateTag } from "next/cache";
import { baseApi } from "@/service/baseApi";
import {
  IMyReport,
  IReport,
  IReportDetail,
  TActionState,
  TReportAction,
  TReportReason,
  TReportTargetType,
  TSearchParams,
} from "@/types";

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

export const createReportAction = async (payload: {
  targetType: TReportTargetType;
  targetId: string;
  reason: TReportReason;
  details?: string;
}): Promise<TActionState> => {
  const result = await baseApi("/reports", { method: "POST", body: payload });

  return {
    success: result.success,
    message: result.success ? "Thanks — our team will review your report" : result.message,
    statusCode: result.statusCode,
  };
};

export const getMyReportsAction = async (query?: TSearchParams) =>
  baseApi<IMyReport[]>("/reports/my", { query: { limit: "10", ...pickQuery(query, ["page"]) } });

// ============================================
// Staff
// ============================================

export const getReportsAction = async (query?: TSearchParams) =>
  baseApi<IReport[]>("/reports", {
    query: {
      limit: "20",
      ...pickQuery(query, ["status", "targetType", "reason", "sortBy", "page", "limit"]),
    },
  });

export const getReportByIdAction = async (reportId: string) =>
  baseApi<IReportDetail>(`/reports/${encodeURIComponent(reportId)}`);

export const updateReportAction = async (
  reportId: string,
  payload: { status: "IN_REVIEW" | "RESOLVED" | "DISMISSED"; resolutionNote?: string; action?: TReportAction },
): Promise<TActionState<IReportDetail>> => {
  const result = await baseApi<IReportDetail>(`/reports/${encodeURIComponent(reportId)}`, {
    method: "PATCH",
    body: payload,
  });

  if (result.success && payload.action && payload.action !== "NONE") {
    // a take-down or hidden review changes public pages
    updateTag("listings");
    updateTag("reviews");
  }

  return {
    success: result.success,
    message: result.success ? result.message || "Report updated" : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

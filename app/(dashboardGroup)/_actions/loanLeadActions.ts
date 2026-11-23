"use server";

import { baseApi } from "@/service/baseApi";
import {
  ILoanLead,
  ILoanLeadAdmin,
  TActionState,
  TApiResponse,
  TEmploymentType,
  TLoanLeadStatus,
  TLoanLeadStatusCounts,
  TSearchParams,
} from "@/types";

/*
 * Financing requests hold personal data and change status often:
 * every read is fresh (no-store).
 */

export type LoanLeadListResponse = TApiResponse<ILoanLeadAdmin[]> & {
  meta?: TApiResponse<ILoanLeadAdmin[]>["meta"] & { statusCounts?: TLoanLeadStatusCounts };
};

export type TAdminLoanLeadStatus = Exclude<TLoanLeadStatus, "NEW" | "SENT_TO_PARTNER" | "WITHDRAWN">;

const toActionState = <T>(result: TApiResponse<T>, successMessage: string): TActionState<T> => ({
  success: result.success,
  message: result.success ? successMessage : result.message,
  statusCode: result.statusCode,
  data: result.data,
});

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

const loanLeadPath = (id: string, action = "") => `/loan-leads/${encodeURIComponent(id)}${action}`;

// ============================================
// Buyer
// ============================================

export const getMyLoanLeadsAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<ILoanLead[]>("/loan-leads/my", {
    cache: "no-store",
    query: { limit: "10", ...pickQuery(query, ["page", "status"]) },
  });

// the viewer's open request for one listing, if any (listing page)
export const getMyOpenLoanLeadForListingAction = async (listingId: string) => {
  const result = await baseApi<ILoanLead[]>("/loan-leads/my", {
    cache: "no-store",
    query: { listingId, status: "OPEN", limit: "1" },
  });

  return result.success ? (result.data?.[0] ?? null) : null;
};

// buyers get ILoanLead; admins get the admin fields too
export const getLoanLeadByIdAction = async (id: string) =>
  baseApi<ILoanLeadAdmin>(loanLeadPath(id), { cache: "no-store" });

export const createLoanLeadAction = async (payload: {
  listingId: string;
  preferredPartnerId?: string;
  downPayment: number;
  tenureMonths: number;
  interestRate: number;
  fullName: string;
  phone: string;
  email?: string;
  district?: string;
  monthlyIncome?: number;
  employmentType: TEmploymentType;
  note?: string;
  consent: true;
}) =>
  toActionState(
    await baseApi<ILoanLead>("/loan-leads", { method: "POST", body: payload }),
    "Financing request sent. We will pass it to a finance partner and keep you posted.",
  );

export const withdrawLoanLeadAction = async (id: string, reason?: string) =>
  toActionState(
    await baseApi<ILoanLead>(loanLeadPath(id, "/withdraw"), { method: "PATCH", body: reason ? { reason } : {} }),
    "Financing request withdrawn",
  );

// ============================================
// Admin
// ============================================

export const getLoanLeadsAction = async (query?: TSearchParams) =>
  baseApi<ILoanLeadAdmin[]>("/loan-leads", {
    cache: "no-store",
    query: {
      limit: "20",
      ...pickQuery(query, ["page", "searchTerm", "partnerId", "listingId", "fromDate", "toDate", "sortBy", "sortOrder"]),
      // default tab: requests waiting for an admin; "ALL" = no status filter
      status: ((pickQuery(query, ["status"]).status as string | undefined) ?? "NEW").replace(/^ALL$/, ""),
    },
  }) as Promise<LoanLeadListResponse>;

export const assignLoanLeadAction = async (id: string, payload: { partnerId: string; note?: string }) =>
  toActionState(
    await baseApi<ILoanLeadAdmin>(loanLeadPath(id, "/assign"), { method: "PATCH", body: payload }),
    "Sent to the finance partner. They will get the lead by email.",
  );

export const updateLoanLeadStatusAction = async (
  id: string,
  payload: { status: TAdminLoanLeadStatus; note?: string; partnerReference?: string },
) =>
  toActionState(
    await baseApi<ILoanLeadAdmin>(loanLeadPath(id, "/status"), { method: "PATCH", body: payload }),
    "Status updated. The buyer has been notified.",
  );

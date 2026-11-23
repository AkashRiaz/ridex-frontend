"use server";

import { updateTag } from "next/cache";
import { FinancePartnerZodSchema } from "@/components/validations/finance-partner.validation";
import { getImageFromFormData, toMultipart, validateImageFile } from "@/lib/toMultipart";
import { baseApi } from "@/service/baseApi";
import { IFinancePartner, TActionState, TApiResponse, TSearchParams } from "@/types";

export type FinancePartnerResponse = TApiResponse<IFinancePartner[]>;

export type FinancePartnerActionState = TActionState<IFinancePartner>;

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

/*
 * Admin reads are fresh: open-lead counts change all the time.
 */
export const getAllFinancePartnersAction = async ({
  query,
}: { query?: TSearchParams } = {}): Promise<FinancePartnerResponse> =>
  baseApi<IFinancePartner[]>("/finance-partners", {
    cache: "no-store",
    query: { limit: "20", ...pickQuery(query, ["searchTerm", "page", "limit", "sortBy", "sortOrder", "isActive"]) },
  });

export const getFinancePartnerByIdAction = async (id: string) =>
  baseApi<IFinancePartner>(`/finance-partners/${encodeURIComponent(id)}`, { cache: "no-store" });

const saveFinancePartner = async (formData: FormData, method: "POST" | "PATCH"): Promise<FinancePartnerActionState> => {
  const partnerId = String(formData.get("id") ?? "");

  const validation = FinancePartnerZodSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? ""),
    website: String(formData.get("website") ?? ""),
    interestRateMin: String(formData.get("interestRateMin") ?? ""),
    interestRateMax: String(formData.get("interestRateMax") ?? ""),
    minDownPaymentPercent: String(formData.get("minDownPaymentPercent") ?? ""),
    maxTenureMonths: String(formData.get("maxTenureMonths") ?? ""),
    isActive: formData.get("isActive") === "true",
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid partner information",
      statusCode: 400,
      data: null,
    };
  }

  const logo = getImageFromFormData(formData, "logo");
  const logoError = validateImageFile(logo);

  if (logoError) {
    return { success: false, message: logoError, statusCode: 400, data: null };
  }

  const value = validation.data;
  const emptyValue = method === "PATCH" ? null : undefined;

  const payload = {
    name: value.name,
    ...(value.slug && { slug: value.slug }),
    description: value.description || emptyValue,
    contactEmail: value.contactEmail.toLowerCase(),
    contactPhone: value.contactPhone || emptyValue,
    website: value.website || emptyValue,
    interestRateMin: Number(value.interestRateMin),
    interestRateMax: Number(value.interestRateMax),
    minDownPaymentPercent: Number(value.minDownPaymentPercent),
    maxTenureMonths: Number(value.maxTenureMonths),
    isActive: value.isActive,
  };

  const result = await baseApi<IFinancePartner>(
    method === "POST" ? "/finance-partners" : `/finance-partners/${encodeURIComponent(partnerId)}`,
    { method, formData: toMultipart(payload, { logo }) },
  );

  if (!result.success) {
    return {
      success: false,
      message: result.message || `Failed to ${method === "POST" ? "create" : "update"} finance partner`,
      statusCode: result.statusCode,
      data: null,
    };
  }

  updateTag("finance-partners");

  return {
    success: true,
    message: `Finance partner ${method === "POST" ? "created" : "updated"} successfully`,
    statusCode: result.statusCode,
    data: result.data,
  };
};

export const createFinancePartnerAction = async (
  _previousState: FinancePartnerActionState | null,
  formData: FormData,
) => saveFinancePartner(formData, "POST");

export const updateFinancePartnerAction = async (
  _previousState: FinancePartnerActionState | null,
  formData: FormData,
) => saveFinancePartner(formData, "PATCH");

export const deleteFinancePartnerAction = async (id: string): Promise<TActionState> => {
  const result = await baseApi(`/finance-partners/${encodeURIComponent(id)}`, { method: "DELETE" });

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Failed to delete finance partner",
      statusCode: result.statusCode,
    };
  }

  updateTag("finance-partners");

  return { success: true, message: "Finance partner deleted successfully", statusCode: result.statusCode };
};

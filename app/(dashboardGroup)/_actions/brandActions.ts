"use server";

import { updateTag } from "next/cache";
import { BrandZodSchema } from "@/components/validations/brand.validation";
import {
  getImageFromFormData,
  toMultipart,
  validateImageFile,
} from "@/lib/toMultipart";
import { baseApi } from "@/service/baseApi";
import { IBrand, TActionState, TApiResponse, TSearchParams } from "@/types";

export type BrandResponse = TApiResponse<IBrand[]>;

export type BrandActionState = TActionState<IBrand>;

const CATALOG_REVALIDATE_SECONDS = 60 * 60;

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

export const getAllBrandsAction = async ({
  query,
  admin = false,
}: { query?: TSearchParams; admin?: boolean } = {}): Promise<BrandResponse> =>
  baseApi<IBrand[]>("/brands", {
    auth: false,
    query: {
      limit: "20",
      ...pickQuery(query, [
        "searchTerm",
        "page",
        "limit",
        "sortBy",
        "sortOrder",
        "vehicleType",
        "isPopular",
      ]),
      isActive: admin ? (pickQuery(query, ["isActive"]).isActive as string) || "all" : "true",
    },
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: ["brands"],
  });

export const getBrandByIdAction = async (idOrSlug: string) =>
  baseApi<IBrand>(`/brands/${encodeURIComponent(idOrSlug)}`, {
    auth: false,
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: ["brands"],
  });

const saveBrand = async (
  formData: FormData,
  method: "POST" | "PATCH",
): Promise<BrandActionState> => {
  const brandId = String(formData.get("id") ?? "");

  const validation = BrandZodSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    country: String(formData.get("country") ?? ""),
    description: String(formData.get("description") ?? ""),
    vehicleTypeIds: formData.getAll("vehicleTypeIds").map(String),
    isPopular: formData.get("isPopular") === "true",
    isActive: formData.get("isActive") === "true",
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid brand information",
      statusCode: 400,
      data: null,
    };
  }

  const logo = getImageFromFormData(formData, "logo");
  const logoError = validateImageFile(logo);

  if (logoError) {
    return { success: false, message: logoError, statusCode: 400, data: null };
  }

  const { name, slug, country, description, vehicleTypeIds, isPopular, isActive } =
    validation.data;

  const emptyValue = method === "PATCH" ? null : undefined;

  const payload = {
    name,
    ...(slug && { slug }),
    country: country || emptyValue,
    description: description || emptyValue,
    vehicleTypeIds,
    isPopular,
    isActive,
  };

  const result = await baseApi<IBrand>(
    method === "POST" ? "/brands" : `/brands/${brandId}`,
    {
      method,
      formData: toMultipart(payload, { logo }),
    },
  );

  if (!result.success) {
    return {
      success: false,
      message:
        result.message || `Failed to ${method === "POST" ? "create" : "update"} brand`,
      statusCode: result.statusCode,
      data: null,
    };
  }

  updateTag("brands");
  updateTag("vehicle-types");
  updateTag("vehicle-models");

  return {
    success: true,
    message: `Brand ${method === "POST" ? "created" : "updated"} successfully`,
    statusCode: result.statusCode,
    data: result.data,
  };
};

export const createBrandAction = async (
  _previousState: BrandActionState | null,
  formData: FormData,
) => saveBrand(formData, "POST");

export const updateBrandAction = async (
  _previousState: BrandActionState | null,
  formData: FormData,
) => saveBrand(formData, "PATCH");

export const deleteBrandAction = async (brandId: string): Promise<TActionState> => {
  const result = await baseApi(`/brands/${brandId}`, { method: "DELETE" });

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Failed to delete brand",
      statusCode: result.statusCode,
    };
  }

  updateTag("brands");
  updateTag("vehicle-types");

  return {
    success: true,
    message: "Brand deleted successfully",
    statusCode: result.statusCode,
  };
};

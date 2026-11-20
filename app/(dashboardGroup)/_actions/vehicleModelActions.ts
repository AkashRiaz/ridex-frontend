"use server";

import { updateTag } from "next/cache";
import { VehicleModelZodSchema } from "@/components/validations/vehicle-model.validation";
import {
  getImageFromFormData,
  toMultipart,
  validateImageFile,
} from "@/lib/toMultipart";
import { baseApi } from "@/service/baseApi";
import {
  IVehicleModel,
  TActionState,
  TApiResponse,
  TSearchParams,
  TSpecs,
} from "@/types";

export type VehicleModelResponse = TApiResponse<IVehicleModel[]>;

export type VehicleModelActionState = TActionState<IVehicleModel>;

const CATALOG_REVALIDATE_SECONDS = 60 * 60;

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

export const getAllVehicleModelsAction = async ({
  query,
  admin = false,
}: { query?: TSearchParams; admin?: boolean } = {}): Promise<VehicleModelResponse> =>
  baseApi<IVehicleModel[]>("/vehicle-models", {
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
        "brand",
        "year",
      ]),
      isActive: admin ? (pickQuery(query, ["isActive"]).isActive as string) || "all" : "true",
    },
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: ["vehicle-models"],
  });

export const getVehicleModelByIdAction = async (idOrSlug: string, brand?: string) =>
  baseApi<IVehicleModel>(`/vehicle-models/${encodeURIComponent(idOrSlug)}`, {
    auth: false,
    query: brand ? { brand } : undefined,
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: ["vehicle-models"],
  });

const saveVehicleModel = async (
  formData: FormData,
  method: "POST" | "PATCH",
): Promise<VehicleModelActionState> => {
  const vehicleModelId = String(formData.get("id") ?? "");

  const validation = VehicleModelZodSchema.safeParse({
    vehicleTypeId: String(formData.get("vehicleTypeId") ?? ""),
    brandId: String(formData.get("brandId") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    yearFrom: String(formData.get("yearFrom") ?? ""),
    yearTo: String(formData.get("yearTo") ?? ""),
    isActive: formData.get("isActive") === "true",
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid model information",
      statusCode: 400,
      data: null,
    };
  }

  let defaultSpecs: TSpecs = {};

  try {
    defaultSpecs = JSON.parse(String(formData.get("defaultSpecs") ?? "{}"));
  } catch {
    return { success: false, message: "Invalid default specs", statusCode: 400, data: null };
  }

  const image = getImageFromFormData(formData, "image");
  const imageError = validateImageFile(image);

  if (imageError) {
    return { success: false, message: imageError, statusCode: 400, data: null };
  }

  const { vehicleTypeId, brandId, name, slug, yearFrom, yearTo, isActive } =
    validation.data;

  const emptyYear = method === "PATCH" ? null : undefined;

  const payload = {
    vehicleTypeId,
    brandId,
    name,
    ...(slug && { slug }),
    yearFrom: yearFrom ? Number(yearFrom) : emptyYear,
    yearTo: yearTo ? Number(yearTo) : emptyYear,
    // specs are re-validated by the API against the vehicle type's schema
    defaultSpecs,
    isActive,
  };

  const result = await baseApi<IVehicleModel>(
    method === "POST" ? "/vehicle-models" : `/vehicle-models/${vehicleModelId}`,
    {
      method,
      formData: toMultipart(payload, { image }),
    },
  );

  if (!result.success) {
    return {
      success: false,
      message:
        result.message || `Failed to ${method === "POST" ? "create" : "update"} model`,
      statusCode: result.statusCode,
      data: null,
    };
  }

  updateTag("vehicle-models");
  updateTag("brands");
  updateTag("vehicle-types");

  return {
    success: true,
    message: `Model ${method === "POST" ? "created" : "updated"} successfully`,
    statusCode: result.statusCode,
    data: result.data,
  };
};

export const createVehicleModelAction = async (
  _previousState: VehicleModelActionState | null,
  formData: FormData,
) => saveVehicleModel(formData, "POST");

export const updateVehicleModelAction = async (
  _previousState: VehicleModelActionState | null,
  formData: FormData,
) => saveVehicleModel(formData, "PATCH");

export const deleteVehicleModelAction = async (
  vehicleModelId: string,
): Promise<TActionState> => {
  const result = await baseApi(`/vehicle-models/${vehicleModelId}`, {
    method: "DELETE",
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Failed to delete model",
      statusCode: result.statusCode,
    };
  }

  updateTag("vehicle-models");
  updateTag("brands");
  updateTag("vehicle-types");

  return {
    success: true,
    message: "Model deleted successfully",
    statusCode: result.statusCode,
  };
};

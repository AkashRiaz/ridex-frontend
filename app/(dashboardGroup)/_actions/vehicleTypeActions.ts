"use server";

import { updateTag } from "next/cache";
import { VehicleTypeZodSchema } from "@/components/validations/vehicle-type.validation";
import {
  getImageFromFormData,
  toMultipart,
  validateImageFile,
} from "@/lib/toMultipart";
import { baseApi } from "@/service/baseApi";
import {
  IVehicleAttribute,
  IVehicleType,
  TActionState,
  TApiResponse,
  TSearchParams,
} from "@/types";

export type VehicleTypeResponse = TApiResponse<IVehicleType[]>;

export type VehicleTypeActionState = TActionState<IVehicleType>;

const CATALOG_REVALIDATE_SECONDS = 60 * 60;

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

/*
 * Public data (also used by listing forms/filters later) → cached + tagged.
 * Admin pages pass { admin: true } to include inactive types.
 */
export const getAllVehicleTypesAction = async ({
  query,
  admin = false,
}: { query?: TSearchParams; admin?: boolean } = {}): Promise<VehicleTypeResponse> =>
  baseApi<IVehicleType[]>("/vehicle-types", {
    auth: false,
    query: {
      limit: "50",
      ...pickQuery(query, ["searchTerm", "page", "limit", "sortBy", "sortOrder"]),
      isActive: admin ? (pickQuery(query, ["isActive"]).isActive as string) || "all" : "true",
    },
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: ["vehicle-types"],
  });

export const getVehicleTypeByIdAction = async (idOrSlug: string) =>
  baseApi<IVehicleType>(`/vehicle-types/${encodeURIComponent(idOrSlug)}`, {
    auth: false,
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: ["vehicle-types"],
  });

const refreshCatalogCache = () => {
  // brand and model lists embed vehicle type names
  updateTag("vehicle-types");
  updateTag("brands");
  updateTag("vehicle-models");
};

const saveVehicleType = async (
  formData: FormData,
  method: "POST" | "PATCH",
): Promise<VehicleTypeActionState> => {
  const vehicleTypeId = String(formData.get("id") ?? "");

  const validation = VehicleTypeZodSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    icon: String(formData.get("icon") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "true",
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid vehicle type information",
      statusCode: 400,
      data: null,
    };
  }

  const image = getImageFromFormData(formData, "image");
  const imageError = validateImageFile(image);

  if (imageError) {
    return { success: false, message: imageError, statusCode: 400, data: null };
  }

  const { name, slug, description, icon, sortOrder, isActive } = validation.data;

  const payload = {
    name,
    ...(slug && { slug }),
    description: description || (method === "PATCH" ? null : undefined),
    icon: icon || (method === "PATCH" ? null : undefined),
    sortOrder: Number(sortOrder),
    isActive,
  };

  const result = await baseApi<IVehicleType>(
    method === "POST" ? "/vehicle-types" : `/vehicle-types/${vehicleTypeId}`,
    {
      method,
      formData: toMultipart(payload, { image }),
    },
  );

  if (!result.success) {
    return {
      success: false,
      message:
        result.message ||
        `Failed to ${method === "POST" ? "create" : "update"} vehicle type`,
      statusCode: result.statusCode,
      data: null,
    };
  }

  refreshCatalogCache();

  return {
    success: true,
    message: `Vehicle type ${method === "POST" ? "created" : "updated"} successfully`,
    statusCode: result.statusCode,
    data: result.data,
  };
};

export const createVehicleTypeAction = async (
  _previousState: VehicleTypeActionState | null,
  formData: FormData,
) => saveVehicleType(formData, "POST");

export const updateVehicleTypeAction = async (
  _previousState: VehicleTypeActionState | null,
  formData: FormData,
) => saveVehicleType(formData, "PATCH");

export const updateVehicleTypeAttributesAction = async (
  vehicleTypeId: string,
  attributes: IVehicleAttribute[],
): Promise<VehicleTypeActionState> => {
  const result = await baseApi<IVehicleType>(
    `/vehicle-types/${vehicleTypeId}/attributes`,
    {
      method: "PUT",
      body: { attributes },
    },
  );

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Failed to save attributes",
      statusCode: result.statusCode,
      data: null,
    };
  }

  refreshCatalogCache();

  return {
    success: true,
    message: "Attribute schema saved",
    statusCode: result.statusCode,
    data: result.data,
  };
};

export const deleteVehicleTypeAction = async (
  vehicleTypeId: string,
): Promise<TActionState> => {
  const result = await baseApi(`/vehicle-types/${vehicleTypeId}`, {
    method: "DELETE",
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Failed to delete vehicle type",
      statusCode: result.statusCode,
    };
  }

  refreshCatalogCache();

  return {
    success: true,
    message: "Vehicle type deleted successfully",
    statusCode: result.statusCode,
  };
};

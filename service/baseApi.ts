"use server";

import { isAccessTokenExist } from "@/service/refreshToken";
import { TApiResponse } from "@/types";

/*
 * RideX "baseApi": the one place that talks to the backend.
 * Same normalized shape the reference actions return by hand:
 * { success, message, statusCode, data, meta } — never throws.
 *
 * Entity actions (<entity>Actions.ts) stay the public API and call this.
 */

type BaseApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  formData?: FormData;
  query?: Record<string, string | string[] | undefined>;
  auth?: boolean;
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
};

const buildQueryString = (query?: BaseApiOptions["query"]) => {
  if (!query) return "";

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    const resolved = Array.isArray(value) ? value[0] : value;

    if (resolved !== undefined && resolved !== "") {
      params.set(key, resolved);
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
};

export const baseApi = async <T>(
  path: string,
  options: BaseApiOptions = {},
): Promise<TApiResponse<T>> => {
  const {
    method = "GET",
    body,
    formData,
    query,
    auth = true,
    cache,
    revalidate,
    tags,
  } = options;

  try {
    const headers: Record<string, string> = {};

    if (auth) {
      const accessToken = await isAccessTokenExist();

      if (!accessToken) {
        return {
          success: false,
          message: "Access token not found",
          statusCode: 401,
          data: null,
        };
      }

      headers.Authorization = `Bearer ${accessToken}`;
    }

    if (body !== undefined && !formData) {
      headers["Content-Type"] = "application/json";
    }

    const isCacheable = method === "GET" && (revalidate || tags?.length);

    const response = await fetch(
      `${process.env.BACKEND_API_URL}${path}${buildQueryString(query)}`,
      {
        method,
        headers,
        body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
        ...(isCacheable
          ? {
              cache: cache ?? "force-cache",
              next: { revalidate, tags },
            }
          : { cache: cache ?? "no-store" }),
      },
    );

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      return {
        success: false,
        message: result?.message || "Request failed",
        statusCode: response.status,
        data: null,
      };
    }

    return {
      success: true,
      message: result.message,
      statusCode: response.status,
      data: (result.data ?? null) as T | null,
      meta: result.meta ?? null,
    };
  } catch (error) {
    console.error(`baseApi ${method} ${path} failed:`, error);

    return {
      success: false,
      message: "Something went wrong. Please try again.",
      statusCode: 500,
      data: null,
    };
  }
};

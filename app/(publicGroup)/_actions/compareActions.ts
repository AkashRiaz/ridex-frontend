"use server";

import { baseApi } from "@/service/baseApi";
import { ICompareResult } from "@/types";

export const getCompareListingsAction = async (ids: string[]) =>
  baseApi<ICompareResult>("/compare", {
    auth: false,
    query: { ids: ids.join(",") },
    // same short window as search results
    revalidate: 60,
    tags: ["listings"],
  });

"use server";

import { baseApi } from "@/service/baseApi";
import { IHomeData } from "@/types";

// the backend caches this for 5 minutes; a short page cache keeps the homepage fast
const HOME_REVALIDATE_SECONDS = 60;

export const getHomeDataAction = async () =>
  baseApi<IHomeData>("/search/home", {
    auth: false,
    revalidate: HOME_REVALIDATE_SECONDS,
    tags: ["listings"],
  });

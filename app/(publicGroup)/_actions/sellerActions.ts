"use server";

import { baseApi } from "@/service/baseApi";
import { IPublicSellerProfile } from "@/types";

// rating, badges and listings change rarely — short cache, busted by mutations
export const getPublicSellerProfileAction = async (sellerId: string) =>
  baseApi<IPublicSellerProfile>(`/users/${encodeURIComponent(sellerId)}/public`, {
    auth: false,
    revalidate: 60,
    tags: ["listings", "reviews"],
  });

"use server";

import { cookies } from "next/headers";
import { getMyWishlistIdsAction } from "@/app/(dashboardGroup)/_actions/wishlistActions";

/*
 * Heart-icon state for server-rendered card grids.
 * Signed-out visitors: no request, nothing saved.
 */
export const getWishlistState = async (): Promise<{ isSignedIn: boolean; savedIds: string[] }> => {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get("accessToken")?.value || cookieStore.get("refreshToken")?.value);

  if (!hasSession) return { isSignedIn: false, savedIds: [] };

  return { isSignedIn: true, savedIds: await getMyWishlistIdsAction() };
};

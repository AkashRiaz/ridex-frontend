"use server";

import { cookies } from "next/headers";

/*
 * Login / register / OTP actions are added with the auth module (Phase 1).
 */

export const logout = async (): Promise<void> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    await fetch(`${process.env.BACKEND_API_URL}/auth/logout`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    }).catch(() => null);
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
};

import { cookies } from "next/headers";
import { TAuthTokens } from "@/types";

/*
 * Server-only helpers used by auth/profile server actions.
 * Same cookie names + lifetimes as the backend (accessToken 1d, refreshToken 7d).
 */

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const setAuthCookies = async (tokens: TAuthTokens) => {
  const cookieStore = await cookies();

  cookieStore.set("accessToken", tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24,
  });

  cookieStore.set("refreshToken", tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
};

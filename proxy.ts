import { NextRequest, NextResponse } from "next/server";
import { JwtPayload } from "jsonwebtoken";
import { jwtUtils } from "./utils/jwt";
import {
  getDashboardPath,
  getRoleForDashboardPath,
} from "./lib/dashboardPath";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/verify-email",
  "/verify-phone",
  "/forgot-password",
  "/reset-password",
];

/*
 * Every route that is NOT an auth route and NOT a dashboard is public.
 * (Marketplace pages — listings, dealers, community — must be crawlable.)
 * Dashboards are detected from ROLE_DASHBOARD_PATH.
 */

type RefreshTokenResponse = {
  success?: boolean;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  message?: string;
};

const isMatchingRoute = (pathname: string, routes: string[]) => {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const refreshTokens = async (refreshToken: string) => {
  try {
    const backendApiUrl = process.env.BACKEND_API_URL;

    if (!backendApiUrl) {
      console.error("BACKEND_API_URL is not configured");
      return null;
    }

    const response = await fetch(`${backendApiUrl}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
      cache: "no-store",
    });

    const result = (await response
      .json()
      .catch(() => null)) as RefreshTokenResponse | null;

    const newAccessToken = result?.data?.accessToken;

    if (
      !response.ok ||
      !result?.success ||
      typeof newAccessToken !== "string" ||
      !newAccessToken.trim()
    ) {
      return null;
    }

    return {
      accessToken: newAccessToken,
      // the backend rotates refresh tokens, so the new one must be stored too
      refreshToken: result.data?.refreshToken,
    };
  } catch (error) {
    console.error("Proxy token refresh error:", error);

    return null;
  }
};

const setTokenCookies = (
  response: NextResponse,
  tokens: { accessToken: string; refreshToken?: string },
) => {
  response.cookies.set("accessToken", tokens.accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24,
  });

  if (tokens.refreshToken) {
    response.cookies.set("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });
  }
};

const clearAuthenticationCookies = (response: NextResponse) => {
  response.cookies.set("accessToken", "", {
    ...cookieOptions,
    expires: new Date(0),
  });

  response.cookies.set("refreshToken", "", {
    ...cookieOptions,
    expires: new Date(0),
  });
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let accessToken = request.cookies.get("accessToken")?.value;

  const refreshToken = request.cookies.get("refreshToken")?.value;

  const accessSecret = process.env.JWT_ACCESS_SECRET;

  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  let decodedAccessToken =
    accessToken && accessSecret
      ? jwtUtils.verifyToken(accessToken, accessSecret)
      : null;

  const decodedRefreshToken =
    refreshToken && refreshSecret
      ? jwtUtils.verifyToken(refreshToken, refreshSecret)
      : null;

  let refreshedTokens: Awaited<ReturnType<typeof refreshTokens>> = null;

  let shouldClearCookies = false;

  /*
   * Access token expired or invalid,
   * but refresh token is still valid.
   */
  if (
    !decodedAccessToken?.success &&
    decodedRefreshToken?.success &&
    refreshToken
  ) {
    refreshedTokens = await refreshTokens(refreshToken);
  }

  if (refreshedTokens && accessSecret) {
    decodedAccessToken = jwtUtils.verifyToken(
      refreshedTokens.accessToken,
      accessSecret,
    );
    accessToken = refreshedTokens.accessToken;
    /*
     * Make the refreshed token available
     * to the current request.
     */
    request.cookies.set("accessToken", refreshedTokens.accessToken);
  } else if (!decodedAccessToken?.success) {
    shouldClearCookies = Boolean(accessToken || refreshToken);
    accessToken = undefined;
    decodedAccessToken = null;
  }

  let userRole: string | null = null;

  if (decodedAccessToken?.success && decodedAccessToken.data) {
    userRole = (decodedAccessToken.data as JwtPayload).role || null;
  }

  const isAuthRoute = isMatchingRoute(pathname, AUTH_ROUTES);

  const dashboardOwnerRole = getRoleForDashboardPath(pathname);

  const withCookies = (response: NextResponse) => {
    if (refreshedTokens) {
      setTokenCookies(response, refreshedTokens);
    }

    if (shouldClearCookies) {
      clearAuthenticationCookies(response);
    }

    return response;
  };

  /*
   * Logged-in users should not revisit
   * login or registration pages.
   */
  if (accessToken && isAuthRoute) {
    const dashboardPath = getDashboardPath(userRole);

    if (dashboardPath) {
      return withCookies(
        NextResponse.redirect(new URL(dashboardPath, request.url)),
      );
    }
  }

  /*
   * Unauthenticated users attempting to
   * access a dashboard.
   */
  if (!accessToken && dashboardOwnerRole) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "redirectTo",
      `${pathname}${request.nextUrl.search}`,
    );

    return withCookies(NextResponse.redirect(loginUrl));
  }

  /*
   * Role-based dashboard protection:
   * each role may only open its own dashboard.
   */
  if (dashboardOwnerRole && userRole !== dashboardOwnerRole) {
    return withCookies(
      NextResponse.redirect(new URL("/not-found", request.url)),
    );
  }

  return withCookies(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};

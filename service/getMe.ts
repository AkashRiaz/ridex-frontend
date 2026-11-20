"use server";

import { cookies } from "next/headers";
import { IUserResponse } from "@/types";

export const getMe = async (): Promise<IUserResponse> => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "User not logged in",
    };
  }

  try {
    /*
     * no-store: role/status changes must show immediately
     * (the reference cached this for 1 day).
     */
    const res = await fetch(`${process.env.BACKEND_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    });

    const result = await res.json().catch(() => null);

    return (
      result ?? { success: false, message: "Failed to load the current user" }
    );
  } catch {
    return {
      success: false,
      message: "Failed to load the current user",
    };
  }
};

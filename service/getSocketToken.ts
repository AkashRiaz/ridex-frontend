"use server";

import { baseApi } from "@/service/baseApi";

/*
 * The browser never sees the httpOnly access token. Instead this server
 * action trades it for a short-lived socket token (POST /auth/socket-token),
 * which only the Socket.io handshake accepts. Called on every (re)connect.
 */
export const getSocketToken = async (): Promise<string | null> => {
  const result = await baseApi<{ token: string; expiresIn: string }>("/auth/socket-token", { method: "POST" });

  return result.success ? (result.data?.token ?? null) : null;
};

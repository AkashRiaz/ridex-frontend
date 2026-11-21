"use server";

import { baseApi } from "@/service/baseApi";
import { INotification, INotificationPreference, TActionState, TNotificationCategory, TSearchParams } from "@/types";

/*
 * Notifications are per-user and live (socket), so reads are never cached.
 */

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

export const getMyNotificationsAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<INotification[]>("/notifications", {
    query: { limit: "20", ...pickQuery(query, ["page", "limit", "status", "category"]) },
  });

export const getNotificationUnreadCountAction = async (): Promise<number> => {
  const result = await baseApi<{ total: number }>("/notifications/unread-count");

  return result.success ? (result.data?.total ?? 0) : 0;
};

export const markNotificationReadAction = async (id: string): Promise<TActionState> => {
  const result = await baseApi(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });

  return { success: result.success, message: result.message, statusCode: result.statusCode };
};

export const markAllNotificationsReadAction = async (): Promise<TActionState> => {
  const result = await baseApi("/notifications/read-all", { method: "PATCH" });

  return {
    success: result.success,
    message: result.success ? "All notifications marked as read" : result.message,
    statusCode: result.statusCode,
  };
};

export const deleteNotificationAction = async (id: string): Promise<TActionState> => {
  const result = await baseApi(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });

  return {
    success: result.success,
    message: result.success ? "Notification removed" : result.message,
    statusCode: result.statusCode,
  };
};

export const getNotificationPreferencesAction = async () =>
  baseApi<INotificationPreference[]>("/notifications/preferences");

export const updateNotificationPreferenceAction = async (change: {
  category: TNotificationCategory;
  inApp?: boolean;
  email?: boolean;
}): Promise<TActionState<INotificationPreference[]>> => {
  const result = await baseApi<INotificationPreference[]>("/notifications/preferences", {
    method: "PUT",
    body: { preferences: [change] },
  });

  return {
    success: result.success,
    message: result.success ? "Preferences saved" : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

// public: the /unsubscribe page posts the token from the email footer
export const unsubscribeEmailAction = async (token: string): Promise<TActionState<{ category: TNotificationCategory }>> => {
  const result = await baseApi<{ category: TNotificationCategory }>("/notifications/unsubscribe", {
    method: "POST",
    body: { token },
    auth: false,
  });

  return {
    success: result.success,
    message: result.success ? "You have been unsubscribed" : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

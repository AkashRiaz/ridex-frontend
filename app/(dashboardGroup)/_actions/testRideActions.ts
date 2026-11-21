"use server";

import { baseApi } from "@/service/baseApi";
import {
  IAvailabilityRule,
  IBlockedDate,
  IMyAvailability,
  ITestRide,
  ITestRideSlots,
  TActionState,
  TApiResponse,
  TSearchParams,
} from "@/types";

/*
 * Test rides: bookings and slots are always fresh (no-store); a slot list
 * cached for even a minute would offer times that are already taken.
 */

const pickQuery = (query: TSearchParams | undefined, keys: string[]) =>
  Object.fromEntries(Object.entries(query ?? {}).filter(([key]) => keys.includes(key)));

const toActionState = <T>(result: TApiResponse<T>, successMessage: string): TActionState<T> => ({
  success: result.success,
  message: result.success ? successMessage : result.message,
  statusCode: result.statusCode,
  data: result.data,
});

const ridePath = (testRideId: string, action = "") => `/test-rides/${encodeURIComponent(testRideId)}${action}`;

// ============================================
// Slots & bookings
// ============================================

export const getTestRideSlotsAction = async (listingId: string, range?: { from?: string; to?: string }) =>
  baseApi<ITestRideSlots>("/test-rides/slots", {
    auth: false,
    query: { listingId, from: range?.from, to: range?.to },
  });

export const getMyTestRidesAction = async ({ query }: { query?: TSearchParams } = {}) =>
  baseApi<ITestRide[]>("/test-rides", {
    query: { limit: "10", ...pickQuery(query, ["page", "as", "status", "upcoming", "listingId", "searchTerm"]) },
  });

export const bookTestRideAction = async (payload: { listingId: string; startsAt: string; note?: string }) =>
  toActionState(await baseApi<ITestRide>("/test-rides", { method: "POST", body: payload }), "Test ride requested");

export const confirmTestRideAction = async (testRideId: string, note?: string) =>
  toActionState(
    await baseApi<ITestRide>(ridePath(testRideId, "/confirm"), { method: "PATCH", body: note ? { note } : {} }),
    "Test ride confirmed",
  );

export const declineTestRideAction = async (testRideId: string, reason: string) =>
  toActionState(
    await baseApi<ITestRide>(ridePath(testRideId, "/decline"), { method: "PATCH", body: { reason } }),
    "Test ride declined",
  );

export const cancelTestRideAction = async (testRideId: string, reason: string) =>
  toActionState(
    await baseApi<ITestRide>(ridePath(testRideId, "/cancel"), { method: "PATCH", body: { reason } }),
    "Test ride cancelled",
  );

export const completeTestRideAction = async (testRideId: string) =>
  toActionState(
    await baseApi<ITestRide>(ridePath(testRideId, "/complete"), { method: "PATCH" }),
    "Marked as completed",
  );

export const markTestRideNoShowAction = async (testRideId: string) =>
  toActionState(
    await baseApi<ITestRide>(ridePath(testRideId, "/no-show"), { method: "PATCH" }),
    "Marked as a no-show",
  );

// ============================================
// Availability (sellers and dealers)
// ============================================

export const getMyAvailabilityAction = async () => baseApi<IMyAvailability>("/test-rides/availability/me");

export const saveAvailabilityAction = async (rules: Omit<IAvailabilityRule, "id" | "listing">[]) =>
  toActionState(
    await baseApi<IMyAvailability>("/test-rides/availability/me", { method: "PUT", body: { rules } }),
    "Test ride hours saved",
  );

export const addBlockedDateAction = async (payload: { date: string; reason?: string }) => {
  const result = await baseApi<IBlockedDate & { affectedBookings: number }>("/test-rides/blocked-dates", {
    method: "POST",
    body: payload,
  });

  return toActionState(
    result,
    result.data?.affectedBookings
      ? `Date blocked. ${result.data.affectedBookings} booking(s) on that day are still active.`
      : "Date blocked",
  );
};

export const removeBlockedDateAction = async (blockedDateId: string) =>
  toActionState(
    await baseApi<null>(`/test-rides/blocked-dates/${encodeURIComponent(blockedDateId)}`, { method: "DELETE" }),
    "Date unblocked",
  );

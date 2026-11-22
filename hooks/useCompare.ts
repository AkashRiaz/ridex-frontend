"use client";

import { useCallback, useSyncExternalStore } from "react";
import { COMPARE_STORAGE_KEY, MAX_COMPARE_LISTINGS, TCompareItem } from "@/lib/compare";

/*
 * The compare list lives in localStorage (per browser, survives reloads)
 * and stays in sync across tabs and components. Storage can be blocked
 * (private mode), so every access is guarded and falls back to an empty list.
 */

const CHANGE_EVENT = "compare:change";
const EMPTY: TCompareItem[] = [];

let cachedRaw: string | null = null;
let cachedItems: TCompareItem[] = EMPTY;

const readRaw = () => {
  try {
    return window.localStorage.getItem(COMPARE_STORAGE_KEY);
  } catch {
    return null;
  }
};

const isCompareItem = (value: unknown): value is TCompareItem =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as TCompareItem).id === "string" &&
  typeof (value as TCompareItem).vehicleTypeId === "string";

// same array reference until the stored value changes (useSyncExternalStore needs it)
const getSnapshot = () => {
  const raw = readRaw();

  if (raw === cachedRaw) return cachedItems;

  cachedRaw = raw;

  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedItems = Array.isArray(parsed) ? parsed.filter(isCompareItem).slice(0, MAX_COMPARE_LISTINGS) : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }

  return cachedItems;
};

const getServerSnapshot = () => EMPTY;

const subscribe = (onChange: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === COMPARE_STORAGE_KEY) onChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
};

const write = (items: TCompareItem[]) => {
  try {
    if (items.length === 0) {
      window.localStorage.removeItem(COMPARE_STORAGE_KEY);
    } else {
      window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    // storage blocked: the list just won't persist
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export type TCompareAddResult = { ok: true } | { ok: false; reason: "FULL" | "OTHER_TYPE"; message: string };

export const useCompare = () => {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const has = useCallback((id: string) => items.some((item) => item.id === id), [items]);

  const add = useCallback((item: TCompareItem): TCompareAddResult => {
    const current = getSnapshot();

    if (current.some((entry) => entry.id === item.id)) return { ok: true };

    const otherType = current.find((entry) => entry.vehicleTypeId !== item.vehicleTypeId);

    if (otherType) {
      return {
        ok: false,
        reason: "OTHER_TYPE",
        message: `Your compare list has ${otherType.vehicleTypeName} listings. Clear it to compare ${item.vehicleTypeName} listings.`,
      };
    }

    if (current.length >= MAX_COMPARE_LISTINGS) {
      return {
        ok: false,
        reason: "FULL",
        message: `You can compare up to ${MAX_COMPARE_LISTINGS} listings. Remove one first.`,
      };
    }

    write([...current, item]);
    return { ok: true };
  }, []);

  const remove = useCallback((id: string) => {
    write(getSnapshot().filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { items, has, add, remove, clear };
};

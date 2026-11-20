"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/*
 * Read / patch URL search params (same pattern as SearchBar + CustomPagination).
 * Any change except an explicit page change resets ?page.
 */
export const useUrlParams = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = (key: string) => searchParams.get(key) ?? "";

  const getList = (key: string) =>
    (searchParams.get(key) ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const update = (
    patch: Record<string, string | string[] | null | undefined>,
    options: { removePrefix?: string; keepPage?: boolean } = {},
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (options.removePrefix) {
      for (const key of Array.from(params.keys())) {
        if (key.startsWith(options.removePrefix)) params.delete(key);
      }
    }

    for (const [key, value] of Object.entries(patch)) {
      const normalized = Array.isArray(value) ? value.join(",") : value;

      if (normalized === null || normalized === undefined || normalized === "") {
        params.delete(key);
      } else {
        params.set(key, normalized);
      }
    }

    if (!options.keepPage && !("page" in patch)) params.delete("page");

    const queryString = params.toString();

    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  const toggleInList = (key: string, value: string) => {
    const list = getList(key);

    update({
      [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
    });
  };

  return { searchParams, get, getList, update, toggleInList, isPending };
};

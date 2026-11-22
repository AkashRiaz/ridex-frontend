import { siteConfig } from "./siteConfig";

// matches MAX_COMPARE_LISTINGS in ridex-backend/src/app/module/compare/compare.utils.ts
export const MAX_COMPARE_LISTINGS = 4;

export const COMPARE_STORAGE_KEY = `${siteConfig.name.toLowerCase()}:compare`;

/*
 * What the compare tray needs to show a listing without fetching it.
 */
export type TCompareItem = {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  // only one vehicle type can be compared at a time
  vehicleTypeId: string;
  vehicleTypeName: string;
};

export const compareHref = (ids: string[]) => (ids.length ? `/compare?ids=${ids.join(",")}` : "/compare");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/*
 * Keeps valid, unique ids in order (max 4), so a hand-edited URL never 400s.
 */
export const parseCompareIds = (value?: string | string[]) => {
  const raw = Array.isArray(value) ? value[0] : value;

  return Array.from(
    new Set(
      (raw ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter((id) => UUID_PATTERN.test(id)),
    ),
  ).slice(0, MAX_COMPARE_LISTINGS);
};

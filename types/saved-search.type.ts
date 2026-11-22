import { IListingCard } from "./listing.type";

// Keep in sync with ridex-backend/src/app/module/savedSearch
export type TSavedSearchAlertFrequency = "INSTANT" | "DAILY" | "OFF";

export type TSavedSearchMatchKind = "NEW_LISTING" | "PRICE_DROP";

export type ISavedSearchChip = { key: string; label: string };

export type ISavedSearch = {
  id: string;
  name: string;
  // canonical search params, e.g. { brand: "honda,yamaha", maxPrice: "300000" }
  query: Record<string, string>;
  summary: ISavedSearchChip[];
  // frontend results page, newest first
  searchUrl: string;
  alertFrequency: TSavedSearchAlertFrequency;
  notifyPriceDrops: boolean;
  lastViewedAt: string;
  lastAlertedAt: string | null;
  createdAt: string;
  updatedAt: string;
  newMatchesCount: number;
  totalMatchesCount: number;
};

export type ISavedSearchMatch = {
  id: string;
  kind: TSavedSearchMatchKind;
  oldPrice: number | null;
  newPrice: number | null;
  matchedAt: string;
  isNew: boolean;
  listing: IListingCard;
};

export type ISavedSearchDetail = ISavedSearch & { matches: ISavedSearchMatch[] };

export type ISavedSearchLookup = {
  savedSearch: Pick<ISavedSearch, "id" | "name" | "alertFrequency" | "notifyPriceDrops"> | null;
};

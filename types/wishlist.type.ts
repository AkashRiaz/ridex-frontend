import { IListingCard } from "./listing.type";

export type IWishlistItem = IListingCard & { savedAt: string; isAvailable: boolean };

export type IRecentlyViewedItem = IListingCard & { viewedAt: string };

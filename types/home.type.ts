import { IListingCard } from "./listing.type";

/*
 * GET /search/home — everything the public homepage needs in one call.
 */

export interface IHomeCategory {
  value: string;
  label: string;
  count: number;
}

export interface IHomeBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isPopular: boolean;
  count: number;
}

export interface IHomeVehicleType {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  count: number;
}

export interface IHomeStats {
  liveListings: number;
  verifiedSellers: number;
  districts: number;
  soldLast30Days: number;
}

export interface IHomeData {
  featured: IListingCard[];
  categories: {
    // slug + spec key used to build the search link (null when not configured)
    vehicleType: string | null;
    attribute: string | null;
    items: IHomeCategory[];
  };
  brands: IHomeBrand[];
  vehicleTypes: IHomeVehicleType[];
  stats: IHomeStats;
  generatedAt: string;
}

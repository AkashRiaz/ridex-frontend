import { IBrandSummary } from "./brand.type";
import { Role } from "./common.type";
import { IVehicleAttribute, IVehicleTypeSummary, TSpecs } from "./vehicle-type.type";

export type TListingStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "SOLD" | "EXPIRED";

export type TListingCondition = "NEW" | "USED" | "RECONDITIONED";

export type TSearchSort =
  | "relevance"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "year_desc"
  | "mileage_asc"
  | "nearest";

export type TCardSpec = { key: string; label: string; value: string };

/*
 * Card shape returned by search, my-listings, manage and similar.
 */
export type IListingCard = {
  id: string;
  slug: string;
  title: string;
  price: number;
  isNegotiable: boolean;
  condition: TListingCondition;
  year: number;
  mileage: number;
  status: TListingStatus;
  division: string;
  district: string;
  area: string | null;
  coverImageUrl: string | null;
  imageCount: number;
  brand: IBrandSummary;
  vehicleModel: { id: string; name: string; slug: string } | null;
  vehicleType: IVehicleTypeSummary;
  cardSpecs: TCardSpec[];
  viewsCount: number;
  approvedAt: string | null;
  submittedAt: string | null;
  rejectionReason: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  distanceKm: number | null;
  // manage endpoint only
  seller?: { id: string; name: string; email: string | null; role: Role };
};

export type IListingImage = {
  id: string;
  url: string;
  sortOrder: number;
  isCover: boolean;
};

export type IListingSeller = {
  id: string;
  name: string;
  imageUrl: string | null;
  role: Role;
  emailVerified: boolean;
  phoneVerified: boolean;
  division: string | null;
  district: string | null;
  createdAt: string;
};

export type IListingDetail = {
  id: string;
  slug: string;
  sellerId: string;
  vehicleTypeId: string;
  brandId: string;
  vehicleModelId: string | null;
  title: string;
  description: string;
  price: number;
  isNegotiable: boolean;
  condition: TListingCondition;
  year: number;
  mileage: number;
  color: string | null;
  specs: TSpecs;
  videoUrl: string | null;
  division: string;
  district: string;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  status: TListingStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  soldAt: string | null;
  expiresAt: string | null;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  images: IListingImage[];
  seller: IListingSeller;
  brand: IBrandSummary;
  vehicleModel: { id: string; name: string; slug: string } | null;
  vehicleType: IVehicleTypeSummary & { attributes: IVehicleAttribute[] };
  isOwner?: boolean;
  sentBackToReview?: boolean;
};

export type TListingStatusCounts = Partial<Record<TListingStatus, number>>;

export type ISearchFilters = {
  vehicleTypes: (IVehicleTypeSummary & { count: number })[];
  vehicleType: (IVehicleTypeSummary & { filterableAttributes: IVehicleAttribute[] }) | null;
  brands: (IBrandSummary & { isPopular: boolean; count: number })[];
  priceRange: { min: number | null; max: number | null };
  yearRange: { min: number | null; max: number | null };
  maxMileage: number | null;
  conditions: { value: TListingCondition; count: number }[];
  locations: {
    division: string;
    count: number;
    districts: { name: string; count: number }[];
  }[];
};

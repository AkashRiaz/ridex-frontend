import {
  Gender,
  Role,
  TListingCondition,
  TListingStatus,
  TSearchSort,
  UserStatus,
} from "@/types";

export enum GENDER {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  DEALER: "Dealer",
  DEALER_STAFF: "Dealer Staff",
  SELLER: "Seller",
  INSPECTOR: "Inspector",
  BUYER: "Buyer",
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
  PENDING: "Pending",
};

// Roles a visitor can pick on the register page
export const SELF_REGISTER_ROLES = [
  {
    value: "BUYER",
    label: "Buyer",
    description: "Find and buy a vehicle",
  },
  {
    value: "SELLER",
    label: "Seller",
    description: "Sell your own vehicle",
  },
  {
    value: "DEALER",
    label: "Dealer",
    description: "Showroom — approved after verification",
  },
] as const;

// Roles an admin can create / assign (mirrors backend CREATABLE_ROLES)
export const CREATABLE_ROLES: Partial<Record<Role, Role[]>> = {
  SUPER_ADMIN: ["ADMIN", "MODERATOR", "INSPECTOR", "DEALER", "SELLER", "BUYER"],
  ADMIN: ["MODERATOR", "INSPECTOR", "DEALER", "SELLER", "BUYER"],
};

export const LISTING_STATUS_LABEL: Record<TListingStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending review",
  APPROVED: "Live",
  REJECTED: "Rejected",
  SOLD: "Sold",
  EXPIRED: "Expired",
};

export const LISTING_CONDITION_LABEL: Record<TListingCondition, string> = {
  NEW: "Brand new",
  USED: "Used",
  RECONDITIONED: "Reconditioned",
};

export const SEARCH_SORT_LABEL: Record<TSearchSort, string> = {
  relevance: "Best match",
  newest: "Newest first",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  year_desc: "Year: newest model",
  mileage_asc: "Mileage: lowest",
  nearest: "Nearest to me",
};

export const LISTING_LIMITS = {
  titleMin: 10,
  titleMax: 100,
  descriptionMax: 5000,
  priceMin: 1000,
  priceMax: 100_000_000,
  mileageMax: 1_000_000,
  maxImages: 15,
};

// Bangladesh divisions for profile location
export const BD_DIVISIONS = [
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Mymensingh",
  "Rajshahi",
  "Rangpur",
  "Sylhet",
] as const;

import { Gender, Role, UserStatus } from "@/types";

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

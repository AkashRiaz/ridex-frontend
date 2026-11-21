import {
  Gender,
  Role,
  TAuditAction,
  TDocumentKind,
  TNotificationCategory,
  TReportAction,
  TReportReason,
  TReportStatus,
  TReportTargetType,
  TVerificationStatus,
  TVerificationType,
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

// ============================================
// Reports
// ============================================

export const REPORT_REASON_LABEL: Record<TReportReason, string> = {
  SCAM: "Scam or fraud",
  FAKE_LISTING: "Fake listing",
  WRONG_INFO: "Wrong information",
  DUPLICATE: "Duplicate listing",
  ALREADY_SOLD: "Already sold",
  OFFENSIVE: "Offensive content",
  HARASSMENT: "Harassment",
  SPAM: "Spam",
  OTHER: "Something else",
};

// reasons that make sense for each target
export const REPORT_REASONS_BY_TARGET: Record<TReportTargetType, TReportReason[]> = {
  LISTING: ["SCAM", "FAKE_LISTING", "WRONG_INFO", "DUPLICATE", "ALREADY_SOLD", "OFFENSIVE", "OTHER"],
  USER: ["SCAM", "HARASSMENT", "SPAM", "OFFENSIVE", "OTHER"],
  REVIEW: ["OFFENSIVE", "HARASSMENT", "SPAM", "FAKE_LISTING", "OTHER"],
  MESSAGE: ["SCAM", "HARASSMENT", "SPAM", "OFFENSIVE", "OTHER"],
};

export const REPORT_TARGET_LABEL: Record<TReportTargetType, string> = {
  LISTING: "Listing",
  USER: "User",
  REVIEW: "Review",
  MESSAGE: "Message",
};

export const REPORT_STATUS_LABEL: Record<TReportStatus, string> = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export const REPORT_ACTION_LABEL: Record<TReportAction, string> = {
  NONE: "No action",
  TAKE_DOWN_LISTING: "Take down listing",
  BLOCK_USER: "Block user",
  HIDE_REVIEW: "Hide review",
};

// ============================================
// Verification
// ============================================

export const VERIFICATION_TYPE_LABEL: Record<TVerificationType, string> = {
  ID: "ID verification",
  DEALER: "Dealer verification",
};

export const VERIFICATION_STATUS_LABEL: Record<TVerificationStatus, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const DOCUMENT_KIND_LABEL: Record<TDocumentKind, string> = {
  NID_FRONT: "NID front",
  NID_BACK: "NID back",
  SELFIE: "Selfie holding your NID",
  TRADE_LICENSE: "Trade license",
  TIN_CERTIFICATE: "TIN certificate",
  SHOWROOM_PHOTO: "Showroom photo",
};

// ============================================
// Chat & notifications (Phase 1 · Part 5)
// ============================================

// marketplace roles that can chat; mirrors backend CHAT_ROLES
export const CHAT_ROLES: Role[] = ["BUYER", "SELLER", "DEALER", "DEALER_STAFF", "INSPECTOR"];

export const isChatRole = (role: Role | null | undefined): role is Role =>
  Boolean(role && CHAT_ROLES.includes(role));

export const NOTIFICATION_CATEGORY_LABEL: Record<TNotificationCategory, string> = {
  MESSAGES: "Messages",
  LISTINGS: "My listings",
  PRICE_ALERTS: "Saved listings",
  REVIEWS: "Reviews",
  ACCOUNT: "Account & safety",
};

export const NOTIFICATION_CATEGORY_DESCRIPTION: Record<TNotificationCategory, string> = {
  MESSAGES: "An email when a message stays unread while you are away. The chat badge is always on.",
  LISTINGS: "When your listing is approved, needs changes or expires.",
  PRICE_ALERTS: "Price drops and sales on listings you saved.",
  REVIEWS: "New reviews of you, and replies to reviews you wrote.",
  ACCOUNT: "Verification decisions and report outcomes. These are always on.",
};

// ============================================
// Audit log (Phase 1 · Part 6)
// ============================================

export const AUDIT_ACTION_LABEL: Record<TAuditAction, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  LOGIN: "Signed in",
  LOGOUT: "Signed out",
  APPROVE: "Approved",
  REJECT: "Rejected",
  PUBLISH: "Published",
  CANCEL: "Cancelled",
  PAYMENT: "Payment",
};

// entity names as the backend writes them → readable labels
export const AUDIT_ENTITY_LABEL: Record<string, string> = {
  User: "User",
  Listing: "Listing",
  Review: "Review",
  Report: "Report",
  VerificationRequest: "Verification",
  Brand: "Brand",
  VehicleType: "Vehicle type",
  VehicleModel: "Vehicle model",
};

export const auditEntityLabel = (entity: string) =>
  AUDIT_ENTITY_LABEL[entity] ?? entity.replace(/([a-z])([A-Z])/g, "$1 $2");

import { IAuditLog } from "./audit-log.type";
import { Role, UserStatus } from "./common.type";
import { TListingStatus } from "./listing.type";
import { TReportReason, TReportStatus, TReportTargetType } from "./report.type";
import { TVerificationStatus, TVerificationType } from "./verification.type";

// Keep in sync with ridex-backend/src/app/module/dashboard

export type TDashboardRange = "7d" | "30d" | "90d";

export type IDashboardRangeInfo = {
  key: TDashboardRange;
  days: number;
  // local "YYYY-MM-DD"
  from: string;
  to: string;
};

export type TSeriesPoint<TKey extends string> = { date: string } & Record<TKey, number>;

export type ILabelCount = {
  id?: string | null;
  label: string;
  count: number;
};

export type IQueueCounts = {
  listings: number;
  reports: number;
  // null for moderators
  verifications: number | null;
};

export type IListingSummary = {
  id: string;
  title: string;
  slug: string;
  price: number;
  coverImage: string | null;
};

type IOverviewBase = {
  range: IDashboardRangeInfo;
  generatedAt: string;
};

// ============================================
// Admin / super admin
// ============================================

export type IAdminOverview = IOverviewBase & {
  users: {
    total: number;
    staff: number;
    newInRange: number;
    change: number | null;
    byRole: Record<Role, number>;
    byStatus: Record<UserStatus, number>;
  };
  listings: {
    total: number;
    live: number;
    submittedInRange: number;
    change: number | null;
    byStatus: Record<TListingStatus, number>;
    averageReviewHours: number | null;
  };
  reports: {
    open: number;
    inRange: number;
    change: number | null;
    byReason: Record<TReportReason, number>;
  };
  verifications: {
    pending: number;
    byType: Record<TVerificationType, number>;
  };
  chats: {
    conversations: number;
    newInRange: number;
    change: number | null;
    messagesInRange: number;
  };
  queues: IQueueCounts;
  series: TSeriesPoint<"users" | "submitted" | "approved" | "reports" | "conversations">[];
  topBrands: ILabelCount[];
  listingsByDivision: ILabelCount[];
  recentActivity: IAuditLog[];
};

// ============================================
// Moderator
// ============================================

export type IModeratorOverview = IOverviewBase & {
  queues: IQueueCounts;
  mine: {
    approved: number;
    rejected: number;
    approvalRate: number;
    reportsResolved: number;
    reportsDismissed: number;
  };
  averageReviewHours: number | null;
  openReportsByReason: Record<TReportReason, number>;
  openReportsByTarget: Record<TReportTargetType, number>;
  series: TSeriesPoint<"approved" | "rejected" | "reports">[];
  oldest: {
    listings: (IListingSummary & { submittedAt: string | null; seller: { id: string; name: string } })[];
    reports: {
      id: string;
      targetType: TReportTargetType;
      reason: TReportReason;
      status: TReportStatus;
      createdAt: string;
    }[];
    verifications:
      | { id: string; type: TVerificationType; createdAt: string; user: { id: string; name: string } }[]
      | null;
  };
};

// ============================================
// Seller / dealer
// ============================================

export type ILatestVerification = {
  type: TVerificationType;
  status: TVerificationStatus;
  rejectionReason: string | null;
  createdAt: string;
} | null;

export type ISellerOverview = IOverviewBase & {
  listings: {
    total: number;
    live: number;
    byStatus: Record<TListingStatus, number>;
    soldInRange: number;
  };
  engagement: {
    views: number;
    saves: number;
    savesInRange: number;
    savesChange: number | null;
    chats: number;
    chatsInRange: number;
    chatsChange: number | null;
    unreadMessages: number;
  };
  conversion: {
    listingsWithChats: number;
    soldWithChats: number;
    rate: number;
  };
  trust: {
    ratingAverage: number;
    ratingCount: number;
    phoneVerified: boolean;
    emailVerified: boolean;
    idVerified: boolean;
    dealerVerified: boolean;
    accountStatus: UserStatus | null;
    verifications: Record<TVerificationType, ILatestVerification>;
  };
  series: TSeriesPoint<"chats" | "saves" | "sold">[];
  topListings: (IListingSummary & { status: TListingStatus; viewsCount: number; saves: number; chats: number })[];
  expiringSoon: (IListingSummary & { expiresAt: string | null })[];
  recentReviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    sellerReply: string | null;
    reviewer: { id: string; name: string; imageUrl: string | null };
    listing: { id: string; title: string; slug: string };
  }[];
};

// ============================================
// Buyer (also dealer staff and inspector)
// ============================================

export type IBuyerOverview = IOverviewBase & {
  saved: { total: number; unavailable: number; available: number };
  recentlyViewed: number;
  chats: { active: number; unreadMessages: number };
  reports: { total: number; open: number; byStatus: Record<TReportStatus, number> };
  reviewsGiven: number;
  trust: {
    phoneVerified: boolean;
    emailVerified: boolean;
    idVerified: boolean;
    verifications: Record<TVerificationType, ILatestVerification>;
  };
  series: TSeriesPoint<"saves" | "viewed" | "messages">[];
  recentSaved: (IListingSummary & {
    savedAt: string;
    status: TListingStatus;
    isDeleted: boolean;
    isAvailable: boolean;
  })[];
  savedByBrand: ILabelCount[];
};

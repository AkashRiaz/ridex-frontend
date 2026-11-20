import { Role, UserStatus } from "./common.type";

export type TReportTargetType = "LISTING" | "USER" | "REVIEW" | "MESSAGE";

export type TReportReason =
  | "SCAM"
  | "FAKE_LISTING"
  | "WRONG_INFO"
  | "DUPLICATE"
  | "ALREADY_SOLD"
  | "OFFENSIVE"
  | "HARASSMENT"
  | "SPAM"
  | "OTHER";

export type TReportStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";

export type TReportAction = "NONE" | "TAKE_DOWN_LISTING" | "BLOCK_USER" | "HIDE_REVIEW";

export type IMyReport = {
  id: string;
  targetType: TReportTargetType;
  reason: TReportReason;
  details: string | null;
  status: TReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  listing: { id: string; title: string; slug: string } | null;
  reportedUser: { id: string; name: string } | null;
  review: { id: string; rating: number } | null;
};

export type IReport = {
  id: string;
  reporterId: string;
  targetType: TReportTargetType;
  targetId: string;
  reason: TReportReason;
  details: string | null;
  status: TReportStatus;
  actionTaken: TReportAction | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  openReportsOnTarget?: number;
  reporter: { id: string; name: string; email: string | null };
  listing: {
    id: string;
    title: string;
    slug: string;
    status: string;
    isDeleted: boolean;
    sellerId: string;
    seller: { id: string; name: string; status: UserStatus };
    images: { url: string }[];
  } | null;
  reportedUser: {
    id: string;
    name: string;
    email: string | null;
    role: Role;
    status: UserStatus;
    isDeleted: boolean;
    createdAt: string;
  } | null;
  review: {
    id: string;
    rating: number;
    comment: string;
    isHidden: boolean;
    reviewer: { id: string; name: string };
    seller: { id: string; name: string };
  } | null;
};

export type IReportDetail = IReport & {
  otherReports: {
    id: string;
    reason: TReportReason;
    details: string | null;
    status: TReportStatus;
    createdAt: string;
    reporter: { id: string; name: string };
  }[];
};

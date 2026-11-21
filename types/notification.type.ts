// Keep in sync with ridex-backend/prisma/schema/enums.prisma

export type TNotificationCategory =
  | "MESSAGES"
  | "LISTINGS"
  | "PRICE_ALERTS"
  | "REVIEWS"
  | "ACCOUNT"
  | "OFFERS"
  | "TEST_RIDES";

export type TNotificationType =
  | "UNREAD_MESSAGES"
  | "LISTING_APPROVED"
  | "LISTING_REJECTED"
  | "LISTING_EXPIRED"
  | "WISHLIST_PRICE_DROP"
  | "WISHLIST_SOLD"
  | "REVIEW_RECEIVED"
  | "REVIEW_REPLY"
  | "REPORT_RESOLVED"
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_REJECTED"
  | "OFFER_RECEIVED"
  | "OFFER_COUNTERED"
  | "OFFER_ACCEPTED"
  | "OFFER_DECLINED"
  | "OFFER_WITHDRAWN"
  | "OFFER_EXPIRED"
  | "OFFER_CANCELLED"
  | "OFFER_OTHER_ACCEPTED"
  | "TEST_RIDE_REQUESTED"
  | "TEST_RIDE_CONFIRMED"
  | "TEST_RIDE_DECLINED"
  | "TEST_RIDE_CANCELLED"
  | "TEST_RIDE_EXPIRED"
  | "TEST_RIDE_REMINDER"
  | "SYSTEM";

export type INotification = {
  id: string;
  type: TNotificationType;
  category: TNotificationCategory;
  title: string;
  body: string;
  link: string | null;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type INotificationPreference = {
  category: TNotificationCategory;
  inApp: boolean;
  email: boolean;
  lockedInApp: boolean;
  lockedEmail: boolean;
};

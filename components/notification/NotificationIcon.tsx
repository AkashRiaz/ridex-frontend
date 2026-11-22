import { BadgeCheck, Bell, BellRing, CalendarClock, Flag, HandCoins, MessageCircle, Star, Tag, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TNotificationType } from "@/types";

const ICONS: Partial<Record<TNotificationType, typeof Bell>> = {
  UNREAD_MESSAGES: MessageCircle,
  LISTING_APPROVED: BadgeCheck,
  LISTING_REJECTED: Tag,
  LISTING_EXPIRED: Tag,
  WISHLIST_PRICE_DROP: TrendingDown,
  WISHLIST_SOLD: Tag,
  REVIEW_RECEIVED: Star,
  REVIEW_REPLY: Star,
  REPORT_RESOLVED: Flag,
  VERIFICATION_APPROVED: BadgeCheck,
  VERIFICATION_REJECTED: BadgeCheck,
  OFFER_RECEIVED: HandCoins,
  OFFER_COUNTERED: HandCoins,
  OFFER_ACCEPTED: HandCoins,
  OFFER_DECLINED: HandCoins,
  OFFER_WITHDRAWN: HandCoins,
  OFFER_EXPIRED: HandCoins,
  OFFER_CANCELLED: HandCoins,
  OFFER_OTHER_ACCEPTED: HandCoins,
  TEST_RIDE_REQUESTED: CalendarClock,
  TEST_RIDE_CONFIRMED: CalendarClock,
  TEST_RIDE_DECLINED: CalendarClock,
  TEST_RIDE_CANCELLED: CalendarClock,
  TEST_RIDE_EXPIRED: CalendarClock,
  TEST_RIDE_REMINDER: CalendarClock,
  SAVED_SEARCH_MATCH: BellRing,
  SAVED_SEARCH_PRICE_DROP: TrendingDown,
};

const TONE: Partial<Record<TNotificationType, string>> = {
  LISTING_APPROVED: "bg-success/15 text-success",
  VERIFICATION_APPROVED: "bg-success/15 text-success",
  WISHLIST_PRICE_DROP: "bg-primary/15 text-primary",
  LISTING_REJECTED: "bg-destructive/10 text-destructive",
  VERIFICATION_REJECTED: "bg-destructive/10 text-destructive",
  OFFER_ACCEPTED: "bg-success/15 text-success",
  OFFER_RECEIVED: "bg-primary/15 text-primary",
  OFFER_COUNTERED: "bg-primary/15 text-primary",
  OFFER_DECLINED: "bg-destructive/10 text-destructive",
  TEST_RIDE_CONFIRMED: "bg-success/15 text-success",
  TEST_RIDE_REQUESTED: "bg-primary/15 text-primary",
  TEST_RIDE_REMINDER: "bg-primary/15 text-primary",
  TEST_RIDE_DECLINED: "bg-destructive/10 text-destructive",
  TEST_RIDE_CANCELLED: "bg-destructive/10 text-destructive",
  SAVED_SEARCH_MATCH: "bg-primary/15 text-primary",
  SAVED_SEARCH_PRICE_DROP: "bg-primary/15 text-primary",
};

export function NotificationIcon({ type, className }: { type: TNotificationType; className?: string }) {
  const Icon = ICONS[type] ?? Bell;

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
        TONE[type],
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}

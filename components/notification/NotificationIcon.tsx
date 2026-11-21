import { BadgeCheck, Bell, Flag, MessageCircle, Star, Tag, TrendingDown } from "lucide-react";
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
};

const TONE: Partial<Record<TNotificationType, string>> = {
  LISTING_APPROVED: "bg-success/15 text-success",
  VERIFICATION_APPROVED: "bg-success/15 text-success",
  WISHLIST_PRICE_DROP: "bg-primary/15 text-primary",
  LISTING_REJECTED: "bg-destructive/10 text-destructive",
  VERIFICATION_REJECTED: "bg-destructive/10 text-destructive",
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

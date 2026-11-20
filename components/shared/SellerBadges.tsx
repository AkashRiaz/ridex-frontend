import { BadgeCheck, IdCard, Phone, Star, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { ISellerBadges } from "@/types";

const BADGES = [
  { key: "dealerVerified", label: "Verified dealer", icon: Store },
  { key: "idVerified", label: "ID verified", icon: IdCard },
  { key: "phoneVerified", label: "Phone verified", icon: Phone },
] as const;

/*
 * Trust badges shown on seller cards, profiles and listing cards.
 */
export function SellerBadges({
  badges,
  size = "md",
  className,
}: {
  badges: ISellerBadges;
  size?: "sm" | "md";
  className?: string;
}) {
  const earned = BADGES.filter((badge) => badges[badge.key]);

  if (earned.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Verification badges">
      {earned.map((badge) => (
        <li
          key={badge.key}
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-success/10 font-medium text-success",
            size === "sm" ? "px-1.5 py-0.5 text-[0.7rem]" : "px-2.5 py-1 text-xs",
          )}
        >
          <badge.icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden="true" />
          {badge.label}
        </li>
      ))}
    </ul>
  );
}

// the single strongest badge, for tight spots (listing cards)
export function TopSellerBadge({ badges }: { badges: ISellerBadges }) {
  const top = BADGES.find((badge) => badges[badge.key]);

  if (!top) return null;

  return (
    <span className="inline-flex items-center gap-1 text-success" title={top.label}>
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">{top.label}</span>
    </span>
  );
}

/*
 * Read-only stars (supports halves via a clipped overlay).
 */
export function RatingStars({
  rating,
  size = 16,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, rating - (star - 1)));

        return (
          <span key={star} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-muted-foreground/30" style={{ width: size, height: size }} aria-hidden="true" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star
                className="fill-warning text-warning"
                style={{ width: size, height: size }}
                aria-hidden="true"
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function RatingInline({ average, count }: { average: number; count: number }) {
  if (count === 0) {
    return <span className="text-xs text-muted-foreground">No reviews yet</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Star className="size-4 fill-warning text-warning" aria-hidden="true" />
      <span className="font-semibold">{average.toFixed(1)}</span>
      <span className="text-muted-foreground">
        ({count} review{count === 1 ? "" : "s"})
      </span>
    </span>
  );
}

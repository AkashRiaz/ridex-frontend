import { Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LISTING_STATUS_LABEL } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { TListingStatus } from "@/types";

/*
 * Small building blocks shared by cards, detail page and dashboards.
 */

const statusClassName: Record<TListingStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING: "bg-warning/20 text-foreground",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
  SOLD: "bg-primary/15 text-primary",
  EXPIRED: "bg-muted text-muted-foreground",
};

export function ListingStatusBadge({ status }: { status: TListingStatus }) {
  return (
    <Badge className={cn("border-transparent", statusClassName[status])}>
      {LISTING_STATUS_LABEL[status]}
    </Badge>
  );
}

export function PriceTag({
  price,
  isNegotiable,
  size = "md",
}: {
  price: number;
  isNegotiable?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={cn("font-bold tracking-tight", size === "lg" ? "text-3xl" : "text-lg")}>
        {formatCurrency(price)}
      </span>
      {isNegotiable && (
        <span className="text-xs font-medium text-muted-foreground">Negotiable</span>
      )}
    </div>
  );
}

/*
 * Shown when a listing has no photo (e.g. seeded demo data).
 */
export function ListingImagePlaceholder({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-muted/40 text-muted-foreground",
        className,
      )}
      role="img"
      aria-label={label ? `${label} — no photo yet` : "No photo yet"}
    >
      <Bike className="size-10 opacity-40" aria-hidden="true" />
      <span className="text-xs">No photo yet</span>
    </div>
  );
}

export const formatMileage = (mileage: number) =>
  mileage === 0 ? "0 km" : `${new Intl.NumberFormat("en-BD").format(mileage)} km`;

export const formatRelativeDate = (value: string | null) => {
  if (!value) return "";

  const days = Math.floor((Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000));

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;

  return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });
};

import Image from "next/image";
import Link from "next/link";
import { Calendar, Camera, Gauge, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LISTING_CONDITION_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { IListingCard } from "@/types";
import {
  ListingImagePlaceholder,
  ListingStatusBadge,
  PriceTag,
  formatMileage,
  formatRelativeDate,
} from "./ListingBits";

type ListingCardProps = {
  listing: IListingCard;
  variant?: "grid" | "list";
  // dashboards link to the edit/review page instead of the public page
  href?: string;
  showStatus?: boolean;
  priority?: boolean;
};

/*
 * Card used by search (grid + list), similar listings and the homepage.
 */
export function ListingCard({
  listing,
  variant = "grid",
  href,
  showStatus = false,
  priority = false,
}: ListingCardProps) {
  const isList = variant === "list";
  const location = [listing.area, listing.district].filter(Boolean).join(", ");

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card shadow-card transition",
        "hover:-translate-y-0.5 hover:shadow-elevated motion-reduce:hover:translate-y-0",
        isList && "flex flex-col sm:flex-row",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          isList ? "aspect-[4/3] sm:aspect-auto sm:w-72 sm:shrink-0" : "aspect-[4/3]",
        )}
      >
        {listing.coverImageUrl ? (
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
            priority={priority}
            sizes={isList ? "(min-width: 640px) 288px, 100vw" : "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"}
            className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        ) : (
          <ListingImagePlaceholder label={listing.title} />
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {listing.condition !== "USED" && (
            <span className="rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold backdrop-blur">
              {LISTING_CONDITION_LABEL[listing.condition]}
            </span>
          )}
          {showStatus && <ListingStatusBadge status={listing.status} />}
        </div>

        {listing.imageCount > 1 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            <Camera className="size-3" aria-hidden="true" />
            {listing.imageCount}
          </span>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col gap-3 p-4", isList && "sm:p-5")}>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {listing.brand.name}
            {listing.vehicleModel && ` · ${listing.vehicleModel.name}`}
          </p>
          <h3 className="line-clamp-2 font-semibold leading-snug">
            {/* stretched link: the whole card is clickable, one tab stop */}
            <Link
              href={href ?? `/listings/${listing.slug}`}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
            >
              {listing.title}
            </Link>
          </h3>
        </div>

        <PriceTag price={listing.price} isNegotiable={listing.isNegotiable} />

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <li className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" aria-hidden="true" />
            {listing.year}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Gauge className="size-3.5" aria-hidden="true" />
            {formatMileage(listing.mileage)}
          </li>
          {listing.cardSpecs.slice(0, isList ? 4 : 2).map((spec) => (
            <li key={spec.key} title={spec.label}>
              {spec.value}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{location || "Bangladesh"}</span>
            {listing.distanceKm !== null && (
              <span className="shrink-0 font-medium text-foreground">· {listing.distanceKm} km</span>
            )}
          </span>
          <span className="shrink-0">{formatRelativeDate(listing.approvedAt ?? listing.updatedAt)}</span>
        </div>
      </div>
    </article>
  );
}

export function ListingCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  const isList = variant === "list";

  return (
    <div
      className={cn("overflow-hidden rounded-2xl border bg-card", isList && "flex flex-col sm:flex-row")}
      aria-hidden="true"
    >
      <Skeleton className={cn("rounded-none", isList ? "aspect-[4/3] sm:aspect-auto sm:h-48 sm:w-72" : "aspect-[4/3]")} />
      <div className="flex-1 space-y-3 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

import { ListingCardSkeleton } from "@/components/listing/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";

/*
 * Skeletons for each streamed homepage section (same layout as the real thing).
 */

export function FeaturedListingsLoading() {
  return (
    <div className="-mx-4 flex gap-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          key={index}
          className="w-[78%] shrink-0 sm:w-[45%] lg:w-[calc((100%-3rem)/4)]"
        >
          <ListingCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function ListingGridLoading({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function CategoryGridLoading() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <Skeleton key={index} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}

export function BrandGridLoading() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <Skeleton key={index} className="h-24 rounded-2xl" />
      ))}
    </div>
  );
}

export function StatsLoading() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <Skeleton key={index} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}

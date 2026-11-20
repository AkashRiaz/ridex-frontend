import Link from "next/link";
import { SearchX } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { ListingCard, ListingCardSkeleton } from "@/components/listing/ListingCard";
import { cn } from "@/lib/utils";
import { TSearchParams } from "@/types";
import { searchListingsAction } from "../../_actions/searchActions";

type View = "grid" | "list";

const gridClassName = (view: View) =>
  cn(
    "grid gap-4",
    view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
  );

const SearchResults = async ({ searchParams, view }: { searchParams: TSearchParams; view: View }) => {
  const result = await searchListingsAction({ query: searchParams });

  if (!result.success) {
    return (
      <div role="alert" className="rounded-2xl border border-destructive/20 bg-card p-10 text-center">
        <h2 className="font-semibold text-destructive">Search failed</h2>
        <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
      </div>
    );
  }

  const listings = result.data ?? [];
  const total = result.meta?.total ?? listings.length;

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <SearchX className="size-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">No listings match your search</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Try removing a filter, widening the price range or searching a nearby district.
        </p>
        <Link href="/listings" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
          See all listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {total.toLocaleString()} listing{total === 1 ? "" : "s"} found
      </p>

      <ul className={gridClassName(view)}>
        {listings.map((listing, index) => (
          <li key={listing.id}>
            <ListingCard listing={listing} variant={view} priority={index < 3} />
          </li>
        ))}
      </ul>

      <CustomPagination
        currentPage={Math.max(1, Number(result.meta?.page ?? 1))}
        totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))}
      />
    </div>
  );
};

export function SearchResultsSkeleton({ view }: { view: View }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading listings">
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      <div className={gridClassName(view)}>
        {Array.from({ length: 6 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <ListingCardSkeleton key={index} variant={view} />
        ))}
      </div>
    </div>
  );
}

export default SearchResults;

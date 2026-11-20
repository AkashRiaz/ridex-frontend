import { Suspense } from "react";
import Link from "next/link";
import { Heart, History } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { ListingCard, ListingCardSkeleton } from "@/components/listing/ListingCard";
import { WishlistButton } from "@/components/listing/WishlistButton";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { TSearchParams } from "@/types";
import { getMyRecentlyViewedAction } from "../../_actions/recentlyViewedActions";
import { getMyWishlistAction } from "../../_actions/wishlistActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { ClearRecentlyViewedButton, RemoveRecentlyViewedButton } from "./RecentlyViewedActions";

const CardGridSkeleton = () => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
      <ListingCardSkeleton key={index} />
    ))}
  </div>
);

const EmptyState = ({ icon: Icon, title, text }: { icon: typeof Heart; title: string; text: string }) => (
  <div className="rounded-2xl border border-dashed p-12 text-center">
    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
      <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
    </div>
    <h2 className="mt-4 text-lg font-semibold">{title}</h2>
    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    <Link
      href="/listings"
      className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
    >
      Browse listings
    </Link>
  </div>
);

// ============================================
// Saved (wishlist)
// ============================================

const SavedGrid = async ({ searchParams }: { searchParams?: TSearchParams }) => {
  const result = await getMyWishlistAction({ query: searchParams });

  if (!result.success) {
    return <CatalogError title="Failed to load your saved listings" message={result.message} />;
  }

  const items = result.data ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Nothing saved yet"
        text="Tap the heart on any listing to keep it here and compare later."
      />
    );
  }

  return (
    <div className="space-y-5">
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="space-y-2">
            <div className={item.isAvailable ? undefined : "opacity-60"}>
              <ListingCard listing={item} showStatus={!item.isAvailable} />
            </div>
            <div className="flex items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
              <span>
                {item.isAvailable ? `Saved ${formatRelativeDate(item.savedAt).toLowerCase()}` : "No longer available"}
              </span>
              <WishlistButton listingId={item.id} saved isSignedIn variant="button" className="h-7 px-2.5 text-xs" />
            </div>
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

export const SavedListingsPage = async ({ searchParams }: { searchParams?: Promise<TSearchParams> }) => {
  const params = await searchParams;

  return (
    <div className="space-y-5 p-2 md:p-5">
      <div>
        <h1 className="text-xl font-semibold">Saved listings</h1>
        <p className="text-sm text-muted-foreground">Listings you saved with the heart button</p>
      </div>
      <Suspense key={JSON.stringify(params ?? {})} fallback={<CardGridSkeleton />}>
        <SavedGrid searchParams={params} />
      </Suspense>
    </div>
  );
};

// ============================================
// Recently viewed
// ============================================

const RecentlyViewedGrid = async () => {
  const result = await getMyRecentlyViewedAction();

  if (!result.success) {
    return <CatalogError title="Failed to load your history" message={result.message} />;
  }

  const items = result.data ?? [];

  if (items.length === 0) {
    return (
      <EmptyState icon={History} title="No history yet" text="Listings you open will appear here for quick access." />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ClearRecentlyViewedButton />
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="space-y-2">
            <ListingCard listing={item} showStatus={item.status === "SOLD"} />
            <div className="flex items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
              <span>Viewed {formatRelativeDate(item.viewedAt).toLowerCase()}</span>
              <RemoveRecentlyViewedButton listingId={item.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const RecentlyViewedPage = () => (
  <div className="space-y-5 p-2 md:p-5">
    <div>
      <h1 className="text-xl font-semibold">Recently viewed</h1>
      <p className="text-sm text-muted-foreground">The last 50 listings you opened</p>
    </div>
    <Suspense fallback={<CardGridSkeleton />}>
      <RecentlyViewedGrid />
    </Suspense>
  </div>
);

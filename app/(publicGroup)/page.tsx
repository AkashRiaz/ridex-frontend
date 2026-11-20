import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { ListingCard, ListingCardSkeleton } from "@/components/listing/ListingCard";
import { siteConfig } from "@/lib/siteConfig";
import { getWishlistState } from "@/service/getWishlistState";
import { searchListingsAction } from "./_actions/searchActions";
import { ListingSearchBox } from "./_components/Search/ListingSearchBox";

/*
 * Phase 1 home: search + latest listings. The full premium homepage
 * (parallax hero, scroll animations, featured sections) comes later.
 */

const POPULAR_SEARCHES = [
  { label: "Yamaha R15", href: "/listings?searchTerm=yamaha%20r15" },
  { label: "Scooters", href: "/listings?vehicleType=bike&spec.bikeCategory=scooter" },
  { label: "Under ৳2 lakh", href: "/listings?maxPrice=200000" },
  { label: "Dual-channel ABS", href: "/listings?vehicleType=bike&spec.abs=dual-channel" },
  { label: "Brand new", href: "/listings?condition=NEW" },
];

const LatestListings = async () => {
  const [result, wishlist] = await Promise.all([
    searchListingsAction({ query: { limit: "8", sortBy: "newest" } }),
    getWishlistState(),
  ]);
  const listings = result.data ?? [];

  if (!result.success) {
    return <p className="text-sm text-muted-foreground">Latest listings are unavailable right now.</p>;
  }

  if (listings.length === 0) {
    return <p className="text-sm text-muted-foreground">No listings yet — be the first to sell.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {listings.map((listing, index) => (
        <li key={listing.id}>
          <ListingCard
            listing={listing}
            priority={index < 4}
            wishlist={{ saved: wishlist.savedIds.includes(listing.id), isSignedIn: wishlist.isSignedIn }}
          />
        </li>
      ))}
    </ul>
  );
};

const HomePage = () => {
  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Find your next <span className="text-primary">ride</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{siteConfig.tagline}</p>

          <div className="mt-8 w-full max-w-2xl">
            <Suspense>
              <ListingSearchBox size="lg" />
            </Suspense>
          </div>

          <ul className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Popular searches">
            {POPULAR_SEARCHES.map((search) => (
              <li key={search.label}>
                <Link
                  href={search.href}
                  className="inline-block rounded-full border bg-card px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary"
                >
                  {search.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8" aria-labelledby="latest-heading">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="latest-heading" className="text-2xl font-bold">
              Latest listings
            </h2>
            <p className="text-sm text-muted-foreground">Fresh from owners and dealers</p>
          </div>
          <Link href="/listings" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                <ListingCardSkeleton key={index} />
              ))}
            </div>
          }
        >
          <LatestListings />
        </Suspense>
      </section>
    </div>
  );
};

export default HomePage;

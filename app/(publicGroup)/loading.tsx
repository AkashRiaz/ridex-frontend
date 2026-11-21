import { Skeleton } from "@/components/ui/skeleton";
import { ListingGridLoading } from "./_components/HomePage/HomeLoading";

/*
 * Shown while a public page loads: a heading block and a grid of card skeletons,
 * inside the real navbar/footer (instead of the full-screen spinner).
 */
export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
      <span className="sr-only" role="status">
        Loading…
      </span>
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <ListingGridLoading />
    </div>
  );
}

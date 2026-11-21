import { Skeleton } from "@/components/ui/skeleton";
import { OFFER_COLUMNS } from "./OfferTable";

/*
 * Skeleton copy of OfferTable (reference <Entity>LoadingTable pattern).
 */
const OfferLoadingTable = () => (
  <div className="space-y-3 py-3" aria-busy="true" aria-label="Loading offers">
    <div className="flex justify-between gap-3">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-9 w-72" />
    </div>
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-6 gap-4 bg-muted/50 px-4 py-3">
        {OFFER_COLUMNS.map((column) => (
          <Skeleton key={column} className="h-4 w-16" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-6 items-center gap-4 border-t px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="ml-auto h-7 w-24" />
        </div>
      ))}
    </div>
  </div>
);

export default OfferLoadingTable;

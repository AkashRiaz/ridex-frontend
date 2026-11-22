import { Skeleton } from "@/components/ui/skeleton";
import { SAVED_SEARCH_COLUMNS } from "./SavedSearchTable";

/*
 * Skeleton copy of SavedSearchTable (reference <Entity>LoadingTable pattern).
 */
const SavedSearchLoadingTable = () => (
  <div className="space-y-3 py-3" aria-busy="true" aria-label="Loading saved searches">
    <div className="flex justify-between gap-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-9 w-64" />
    </div>
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 bg-muted/50 px-4 py-3">
        {SAVED_SEARCH_COLUMNS.map((column) => (
          <Skeleton key={column} className="h-4 w-16" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 border-t px-4 py-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-7 w-28" />
        </div>
      ))}
    </div>
  </div>
);

export default SavedSearchLoadingTable;

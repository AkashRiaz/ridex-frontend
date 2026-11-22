import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { TSearchParams } from "@/types";
import { getMySavedSearchesAction } from "../../_actions/savedSearchActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { NewMatchesBadge, SavedSearchChips, SavedSearchFrequencyBadge } from "./SavedSearchBits";
import SavedSearchDelete from "./SavedSearchDelete";
import SavedSearchUpdate from "./SavedSearchUpdate";

export const SAVED_SEARCH_COLUMNS = ["Search", "Alerts", "Matches", "Saved", "Action"];

const SavedSearchTable = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: TSearchParams;
  dashboardPath: string;
}) => {
  const result = await getMySavedSearchesAction({ query: searchParams });

  if (!result.success) {
    return <CatalogError title="Failed to load saved searches" message={result.message} />;
  }

  const savedSearches = result.data ?? [];
  const totalPages = Math.max(1, Number(result.meta?.totalPages ?? 1));
  const hasSearchTerm = Boolean(searchParams?.searchTerm);

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {result.meta?.total ?? savedSearches.length} saved search{(result.meta?.total ?? 0) === 1 ? "" : "es"}
        </p>
        <SearchBar compact />
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {SAVED_SEARCH_COLUMNS.map((column) => (
                <TableHead key={column} className={column === "Action" ? "text-right font-semibold" : "font-semibold"}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {savedSearches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={SAVED_SEARCH_COLUMNS.length} className="h-32 text-center text-muted-foreground">
                  {hasSearchTerm ? (
                    "No saved search matches that name."
                  ) : (
                    <span className="space-y-2">
                      <span className="block">No saved searches yet.</span>
                      <span className="block text-xs">
                        Set your filters on the{" "}
                        <Link href="/listings" className="font-medium text-primary hover:underline">
                          listings page
                        </Link>{" "}
                        and tap “Save search” to get alerts for new matches.
                      </span>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              savedSearches.map((savedSearch) => (
                <TableRow key={savedSearch.id}>
                  <TableCell className="max-w-md whitespace-normal">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`${dashboardPath}/saved-searches/${savedSearch.id}`}
                          className="line-clamp-1 font-medium hover:underline"
                        >
                          {savedSearch.name}
                        </Link>
                        <NewMatchesBadge count={savedSearch.newMatchesCount} />
                      </div>
                      <SavedSearchChips chips={savedSearch.summary} max={5} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <SavedSearchFrequencyBadge frequency={savedSearch.alertFrequency} />
                      {savedSearch.alertFrequency !== "OFF" && (
                        <p className="text-xs text-muted-foreground">
                          {savedSearch.notifyPriceDrops ? "+ price drops" : "New listings only"}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {savedSearch.totalMatchesCount > 0 ? (
                      <span>
                        {savedSearch.totalMatchesCount} live
                        {savedSearch.lastAlertedAt && (
                          <span className="block text-xs text-muted-foreground">
                            Last alert {formatRelativeDate(savedSearch.lastAlertedAt).toLowerCase()}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None yet</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeDate(savedSearch.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={savedSearch.searchUrl}
                        className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/5"
                      >
                        <ExternalLink className="size-3.5" aria-hidden="true" /> Results
                      </Link>
                      <SavedSearchUpdate savedSearch={savedSearch} />
                      <SavedSearchDelete id={savedSearch.id} name={savedSearch.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="pt-4">
          <CustomPagination currentPage={Math.max(1, Number(result.meta?.page ?? 1))} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default SavedSearchTable;

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BellRing, ExternalLink, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TableBackButton from "@/components/ui/TableBackButton";
import { ListingCard, ListingCardSkeleton } from "@/components/listing/ListingCard";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { formatCurrency } from "@/lib/formatCurrency";
import { TSearchParams } from "@/types";
import { getSavedSearchByIdAction } from "../../_actions/savedSearchActions";
import { CatalogError } from "../Catalog/CatalogStates";
import MarkSavedSearchSeen from "./MarkSavedSearchSeen";
import { NewMatchesBadge, SavedSearchChips, SavedSearchFrequencyBadge } from "./SavedSearchBits";
import SavedSearchDelete from "./SavedSearchDelete";
import SavedSearchLoadingTable from "./SavedSearchLoadingTable";
import SavedSearchTable from "./SavedSearchTable";
import SavedSearchUpdate from "./SavedSearchUpdate";

// ============================================
// List
// ============================================

export const SavedSearchesPage = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
}) => {
  const params = await searchParams;

  return (
    <div className="space-y-4 p-2 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Saved searches</h1>
          <p className="text-sm text-muted-foreground">
            We alert you when a new listing matches, or a matching one gets cheaper.
          </p>
        </div>
        <Link
          href="/listings"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <BellRing className="size-4" aria-hidden="true" />
          New search
        </Link>
      </div>

      <Suspense key={JSON.stringify(params ?? {})} fallback={<SavedSearchLoadingTable />}>
        <SavedSearchTable searchParams={params} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

// ============================================
// Detail: settings + latest matches
// ============================================

const SavedSearchDetail = async ({ id, dashboardPath }: { id: string; dashboardPath: string }) => {
  const result = await getSavedSearchByIdAction(id);

  if (!result.success || !result.data) {
    if (result.statusCode === 404) notFound();
    return <CatalogError title="Failed to load this saved search" message={result.message} />;
  }

  const savedSearch = result.data;
  const listPath = `${dashboardPath}/saved-searches`;

  return (
    <div className="space-y-6">
      <MarkSavedSearchSeen id={savedSearch.id} hasNew={savedSearch.newMatchesCount > 0} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
            <TableBackButton />
            {savedSearch.name}
            <NewMatchesBadge count={savedSearch.newMatchesCount} />
          </h1>
          <SavedSearchChips chips={savedSearch.summary} />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <SavedSearchFrequencyBadge frequency={savedSearch.alertFrequency} />
            {savedSearch.alertFrequency !== "OFF" && (
              <span>{savedSearch.notifyPriceDrops ? "New listings and price drops" : "New listings only"}</span>
            )}
            {savedSearch.lastAlertedAt && (
              <span>· Last alert {formatRelativeDate(savedSearch.lastAlertedAt).toLowerCase()}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={savedSearch.searchUrl}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            All results
          </Link>
          <SavedSearchUpdate savedSearch={savedSearch} showLabel />
          <SavedSearchDelete id={savedSearch.id} name={savedSearch.name} showLabel redirectTo={listPath} />
        </div>
      </div>

      <section aria-labelledby="matches-heading" className="space-y-4">
        <h2 id="matches-heading" className="font-semibold">
          Latest matches
        </h2>

        {savedSearch.matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="font-medium">No matches yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {savedSearch.alertFrequency === "OFF"
                ? "Alerts are off for this search. Turn them on to collect new matches here."
                : "New listings that match will show up here, and we'll let you know."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {savedSearch.matches.map((match) => (
              <li key={match.id} className="space-y-2">
                <ListingCard listing={match.listing} showStatus={match.listing.status !== "APPROVED"} />
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
                  {match.kind === "PRICE_DROP" && match.oldPrice !== null && match.newPrice !== null ? (
                    <span className="inline-flex items-center gap-1 font-medium text-success">
                      <TrendingDown className="size-3.5" aria-hidden="true" />
                      Price drop: <s className="font-normal text-muted-foreground">{formatCurrency(match.oldPrice)}</s>{" "}
                      {formatCurrency(match.newPrice)}
                    </span>
                  ) : (
                    <span>New match</span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    {match.isNew && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">New</span>
                    )}
                    {formatRelativeDate(match.matchedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const SavedSearchDetailSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading saved search">
    <div className="space-y-2">
      <Skeleton className="h-6 w-64" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

export const SavedSearchDetailPage = async ({
  params,
  dashboardPath,
}: {
  params: Promise<{ savedSearchId: string }>;
  dashboardPath: string;
}) => {
  const { savedSearchId } = await params;

  return (
    <div className="p-2 md:p-5">
      <Suspense fallback={<SavedSearchDetailSkeleton />}>
        <SavedSearchDetail id={savedSearchId} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

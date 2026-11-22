import type { Metadata } from "next";
import { Suspense } from "react";
import SavedSearchCreate from "@/app/(dashboardGroup)/_components/SavedSearch/SavedSearchCreate";
import { lookupSavedSearchAction } from "@/app/(dashboardGroup)/_actions/savedSearchActions";
import { getDashboardPath } from "@/lib/dashboardPath";
import { isChatRole } from "@/lib/enum";
import { siteConfig } from "@/lib/siteConfig";
import { getMe } from "@/service/getMe";
import { TSearchParams } from "@/types";
import { getSearchFiltersAction } from "../_actions/searchActions";
import { FiltersSidebar } from "../_components/Search/FiltersSidebar";
import { ListingSearchBox } from "../_components/Search/ListingSearchBox";
import SearchResults, { SearchResultsSkeleton } from "../_components/Search/SearchResults";
import {
  ActiveFilters,
  MobileFilters,
  SortSelect,
  ViewToggle,
} from "../_components/Search/SearchToolbar";

type ListingsPageProps = {
  searchParams?: Promise<TSearchParams>;
};

const getValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const generateMetadata = async ({ searchParams }: ListingsPageProps): Promise<Metadata> => {
  const params = (await searchParams) ?? {};
  const searchTerm = getValue(params.searchTerm);
  const district = getValue(params.district);

  const subject = searchTerm ? `“${searchTerm}”` : "Bikes";

  return {
    title: `${subject} for sale${district ? ` in ${district}` : ""}`,
    description: `Browse verified ${searchTerm ?? "bike"} listings on ${siteConfig.name}. Filter by brand, price, engine size, location and more.`,
  };
};

const ListingsPage = async ({ searchParams }: ListingsPageProps) => {
  const params = (await searchParams) ?? {};
  const vehicleType = getValue(params.vehicleType);
  const view = getValue(params.view) === "list" ? "list" : "grid";

  const [filtersResult, me] = await Promise.all([getSearchFiltersAction(vehicleType), getMe()]);

  // saved searches belong to the marketplace roles (the ones with a Saved Searches page)
  const role = me.success ? me.data?.role : undefined;
  const canSaveSearches = isChatRole(role);
  const savedLookup = canSaveSearches ? await lookupSavedSearchAction(params) : null;

  // count active filters for the mobile button (layout params excluded)
  const activeCount = Object.keys(params).filter(
    (key) => !["page", "view", "sortBy", "limit", "searchTerm", "lng", "radius"].includes(key),
  ).length;

  // re-suspend (skeleton) whenever the query changes, except pure layout changes
  const resultsKey = JSON.stringify(
    Object.entries(params).filter(([key]) => key !== "view"),
  );

  const typeName = filtersResult.data?.vehicleType?.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {typeName ? `${typeName}s for sale` : "Vehicles for sale"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified listings from owners and dealers across Bangladesh
          </p>
        </div>
        <div className="max-w-2xl">
          <Suspense>
            <ListingSearchBox keepFilters />
          </Suspense>
        </div>
      </header>

      {!filtersResult.success || !filtersResult.data ? (
        <div role="alert" className="rounded-2xl border border-destructive/20 bg-card p-10 text-center">
          <h2 className="font-semibold text-destructive">Could not load filters</h2>
          <p className="mt-1 text-sm text-muted-foreground">{filtersResult.message}</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-2">
              <Suspense>
                <FiltersSidebar filters={filtersResult.data} />
              </Suspense>
            </div>
          </aside>

          <section aria-label="Results" className="min-w-0 space-y-5">
            <Suspense>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <MobileFilters filters={filtersResult.data} activeCount={activeCount} />
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <SavedSearchCreate
                    isSignedIn={Boolean(role)}
                    dashboardPath={canSaveSearches ? (getDashboardPath(role) ?? null) : null}
                    existing={savedLookup?.data?.savedSearch ?? null}
                  />
                  <SortSelect />
                  <ViewToggle />
                </div>
              </div>
              <ActiveFilters filters={filtersResult.data} />
            </Suspense>

            <Suspense key={resultsKey} fallback={<SearchResultsSkeleton view={view} />}>
              <SearchResults searchParams={params} view={view} />
            </Suspense>
          </section>
        </div>
      )}
    </div>
  );
};

export default ListingsPage;

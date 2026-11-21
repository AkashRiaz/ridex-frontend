import { Suspense } from "react";
import Link from "next/link";
import { CalendarCog } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TSearchParams } from "@/types";
import { getMyAvailabilityAction } from "../../_actions/testRideActions";
import { getMyListingsAction } from "../../_actions/listingActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { AvailabilityEditor } from "./AvailabilityEditor";
import { BlockedDates } from "./BlockedDates";
import TestRideLoadingTable from "./TestRideLoadingTable";
import TestRideTable from "./TestRideTable";

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// ============================================
// My test rides (every chat role)
// ============================================

export const MyTestRidesPage = async ({
  searchParams,
  dashboardPath,
  canSell,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
  // sellers and dealers also receive bookings and set hours
  canSell: boolean;
}) => {
  const params = (await searchParams) ?? {};
  const upcoming = getValue(params.tab) !== "past";
  const basePath = `${dashboardPath}/test-rides`;

  return (
    <div className="space-y-4 p-2 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Test rides</h1>
          <p className="text-sm text-muted-foreground">Bookings you made{canSell && " and bookings on your listings"}.</p>
        </div>
        {canSell && (
          <Link
            href={`${dashboardPath}/test-ride-availability`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
          >
            <CalendarCog className="size-4" aria-hidden="true" /> My test ride hours
          </Link>
        )}
      </div>

      <Tabs>
        <TabsList>
          <TabsTrigger href={basePath} active={upcoming} replace scroll={false}>
            Upcoming
          </TabsTrigger>
          <TabsTrigger href={`${basePath}?tab=past`} active={!upcoming} replace scroll={false}>
            Past
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Suspense key={JSON.stringify(params)} fallback={<TestRideLoadingTable />}>
        <TestRideTable searchParams={params} dashboardPath={dashboardPath} upcoming={upcoming} canSell={canSell} />
      </Suspense>
    </div>
  );
};

// ============================================
// Availability (sellers and dealers)
// ============================================

const AvailabilitySections = async () => {
  const [availability, listings] = await Promise.all([
    getMyAvailabilityAction(),
    getMyListingsAction({ query: { status: "APPROVED", limit: "100" } }),
  ]);

  if (!availability.success || !availability.data) {
    return <CatalogError title="Failed to load your test ride hours" message={availability.message} />;
  }

  const listingOptions = (listings.data ?? []).map((listing) => ({ value: listing.id, label: listing.title }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <AvailabilityEditor availability={availability.data} listingOptions={listingOptions} />
      <BlockedDates blockedDates={availability.data.blockedDates} />
    </div>
  );
};

export const TestRideAvailabilityPage = async ({ dashboardPath }: { dashboardPath: string }) => (
  <div className="space-y-4 p-2 md:p-5">
    <div>
      <Link href={`${dashboardPath}/test-rides`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Test rides
      </Link>
      <h1 className="mt-1 text-xl font-semibold">Test ride hours</h1>
      <p className="text-sm text-muted-foreground">
        Buyers pick a free slot inside these hours. You confirm each request.
      </p>
    </div>

    <Suspense
      fallback={
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <Skeleton className="h-[28rem] rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      }
    >
      <AvailabilitySections />
    </Suspense>
  </div>
);

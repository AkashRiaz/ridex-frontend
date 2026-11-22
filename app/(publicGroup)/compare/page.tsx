import type { Metadata } from "next";
import { Suspense } from "react";
import { parseCompareIds } from "@/lib/compare";
import { siteConfig } from "@/lib/siteConfig";
import { TSearchParams } from "@/types";
import { getCompareListingsAction } from "../_actions/compareActions";
import { CompareLoading } from "../_components/Compare/CompareLoading";
import { CompareEmpty, CompareError, CompareStorageSync } from "../_components/Compare/CompareStates";
import CompareTable from "../_components/Compare/CompareTable";

type ComparePageProps = {
  searchParams?: Promise<TSearchParams>;
};

export const metadata: Metadata = {
  title: "Compare listings",
  description: `Compare up to 4 listings side by side on ${siteConfig.name}: price, price insight, year, mileage and every spec.`,
  // personal lists in the URL: never index them
  robots: { index: false, follow: true },
};

const CompareContent = async ({ ids }: { ids: string[] }) => {
  const result = await getCompareListingsAction(ids);

  if (!result.success || !result.data) {
    return <CompareError message={result.message} />;
  }

  const { listings, missingIds } = result.data;

  return (
    <>
      {/* drops listings that are gone from this browser's compare list */}
      <CompareStorageSync missingIds={missingIds} />
      {listings.length === 0 ? <CompareEmpty hadListings /> : <CompareTable result={result.data} />}
    </>
  );
};

const ComparePage = async ({ searchParams }: ComparePageProps) => {
  const params = (await searchParams) ?? {};
  const ids = parseCompareIds(params.ids);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Compare listings</h1>
        <p className="text-sm text-muted-foreground">
          Up to 4 listings side by side. The best value in each row is highlighted.
        </p>
      </header>

      {ids.length === 0 ? (
        // no ids in the URL: open this browser's saved compare list, if any
        <CompareEmpty fromStorage />
      ) : (
        <Suspense key={ids.join(",")} fallback={<CompareLoading columns={ids.length} />}>
          <CompareContent ids={ids} />
        </Suspense>
      )}
    </div>
  );
};

export default ComparePage;

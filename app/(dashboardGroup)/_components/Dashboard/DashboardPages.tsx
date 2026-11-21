import { ReactNode, Suspense } from "react";
import { TSearchParams } from "@/types";
import AdminDashboardOverview from "./AdminDashboardOverview";
import BuyerDashboardOverview from "./BuyerDashboardOverview";
import ModeratorDashboardOverview from "./ModeratorDashboardOverview";
import SellerDashboardOverview from "./SellerDashboardOverview";
import { DashboardHeader, DashboardOverviewSkeleton, DashboardShell, toDashboardRange } from "./DashboardWidgets";

/*
 * One page component per overview type. Each role's page.tsx picks one.
 * The header (title + range tabs) renders at once; the stats stream in.
 */

type TOverviewPageProps = {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
  title: string;
  description?: string;
  // extra content above the stats, e.g. the buyer's "Start selling" card
  banner?: ReactNode;
};

const getRange = async (searchParams?: Promise<TSearchParams>) => toDashboardRange((await searchParams)?.range);

export const AdminDashboardPage = async ({
  searchParams,
  dashboardPath,
  title,
  description,
  isSuperAdmin = false,
}: TOverviewPageProps & { isSuperAdmin?: boolean }) => {
  const range = await getRange(searchParams);

  return (
    <DashboardShell>
      <DashboardHeader title={title} description={description} range={range} basePath={dashboardPath} />
      <Suspense key={range} fallback={<DashboardOverviewSkeleton charts={6} />}>
        <AdminDashboardOverview range={range} dashboardPath={dashboardPath} isSuperAdmin={isSuperAdmin} />
      </Suspense>
    </DashboardShell>
  );
};

export const ModeratorDashboardPage = async ({ searchParams, dashboardPath, title, description }: TOverviewPageProps) => {
  const range = await getRange(searchParams);

  return (
    <DashboardShell>
      <DashboardHeader title={title} description={description} range={range} basePath={dashboardPath} />
      <Suspense key={range} fallback={<DashboardOverviewSkeleton />}>
        <ModeratorDashboardOverview range={range} dashboardPath={dashboardPath} />
      </Suspense>
    </DashboardShell>
  );
};

export const SellerDashboardPage = async ({
  searchParams,
  dashboardPath,
  title,
  description,
  banner,
  isDealer = false,
}: TOverviewPageProps & { isDealer?: boolean }) => {
  const range = await getRange(searchParams);

  return (
    <DashboardShell>
      {banner}
      <DashboardHeader title={title} description={description} range={range} basePath={dashboardPath} />
      <Suspense key={range} fallback={<DashboardOverviewSkeleton charts={5} />}>
        <SellerDashboardOverview range={range} dashboardPath={dashboardPath} isDealer={isDealer} />
      </Suspense>
    </DashboardShell>
  );
};

export const BuyerDashboardPage = async ({
  searchParams,
  dashboardPath,
  title,
  description,
  banner,
  showTrustLinks = false,
}: TOverviewPageProps & { showTrustLinks?: boolean }) => {
  const range = await getRange(searchParams);

  return (
    <DashboardShell>
      {banner}
      <DashboardHeader title={title} description={description} range={range} basePath={dashboardPath} />
      <Suspense key={range} fallback={<DashboardOverviewSkeleton />}>
        <BuyerDashboardOverview range={range} dashboardPath={dashboardPath} showTrustLinks={showTrustLinks} />
      </Suspense>
    </DashboardShell>
  );
};

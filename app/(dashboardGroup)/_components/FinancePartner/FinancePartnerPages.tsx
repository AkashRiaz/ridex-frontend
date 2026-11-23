import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TSearchParams } from "@/types";
import { getFinancePartnerByIdAction } from "../../_actions/financePartnerActions";
import { CatalogError } from "../Catalog/CatalogStates";
import FinancePartnerCreate from "./FinancePartnerCreate";
import FinancePartnerDelete from "./FinancePartnerDelete";
import FinancePartnerLoadingTable from "./FinancePartnerLoadingTable";
import FinancePartnerTable from "./FinancePartnerTable";
import FinancePartnerUpdate from "./FinancePartnerUpdate";

/*
 * Finance partner pages, mounted in the admin and super admin dashboards
 * (CONVENTIONS Part G: thin page.tsx wrappers pass dashboardPath).
 */

const FormSkeleton = () => (
  <div className="space-y-4" aria-busy="true">
    <Skeleton className="h-24 w-full rounded-xl" />
    <Skeleton className="h-96 w-full rounded-xl" />
  </div>
);

export const FinancePartnersListPage = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
}) => (
  <div className="flex flex-col gap-4 p-2 md:p-5">
    <Suspense fallback={<FinancePartnerLoadingTable />}>
      <FinancePartnerTable searchParams={await searchParams} dashboardPath={dashboardPath} />
    </Suspense>
  </div>
);

export const CreateFinancePartnerPage = ({ dashboardPath }: { dashboardPath: string }) => (
  <div className="mx-auto max-w-3xl p-2 md:p-5">
    <FinancePartnerCreate dashboardPath={dashboardPath} />
  </div>
);

const FinancePartnerEditor = async ({ id, dashboardPath }: { id: string; dashboardPath: string }) => {
  const result = await getFinancePartnerByIdAction(id);

  if (!result.success || !result.data) {
    return <CatalogError title="Failed to load finance partner" message={result.message} />;
  }

  const partner = result.data;

  return (
    <div className="space-y-4">
      <FinancePartnerUpdate partner={partner} dashboardPath={dashboardPath} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 p-4">
        <div className="text-sm">
          <p className="font-medium">Delete partner</p>
          <p className="text-muted-foreground">
            Only possible while no loan lead refers to it. Otherwise, untick “Active” above instead.
          </p>
        </div>
        <FinancePartnerDelete
          id={partner.id}
          name={partner.name}
          showLabel
          redirectTo={`${dashboardPath}/finance-partners`}
        />
      </div>
    </div>
  );
};

export const FinancePartnerDetailPage = async ({
  params,
  dashboardPath,
}: {
  params: Promise<{ financePartnerId: string }>;
  dashboardPath: string;
}) => {
  const { financePartnerId } = await params;

  return (
    <div className="mx-auto max-w-3xl p-2 md:p-5">
      <Suspense fallback={<FormSkeleton />}>
        <FinancePartnerEditor id={financePartnerId} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

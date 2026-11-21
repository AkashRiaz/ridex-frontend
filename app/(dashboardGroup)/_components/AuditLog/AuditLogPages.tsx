import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TSearchParams } from "@/types";
import { getAuditLogByIdAction } from "../../_actions/auditLogActions";
import { CatalogError } from "../Catalog/CatalogStates";
import AuditLogDetails from "./AuditLogDetails";
import AuditLogLoadingTable from "./AuditLogLoadingTable";
import AuditLogTable from "./AuditLogTable";

/*
 * Shared by admin-dashboard and super-admin-dashboard.
 */

export const AuditLogsPage = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
}) => {
  const params = (await searchParams) ?? {};

  return (
    <div className="mx-auto max-w-[1600px] p-2 md:p-5">
      <Suspense key={JSON.stringify(params)} fallback={<AuditLogLoadingTable />}>
        <AuditLogTable searchParams={params} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

const AuditLogDetailContent = async ({ id, dashboardPath }: { id: string; dashboardPath: string }) => {
  const result = await getAuditLogByIdAction(id);

  if (!result.success || !result.data) {
    if (result.statusCode === 404) notFound();

    return (
      <div className="p-2 md:p-5">
        <CatalogError title="Failed to load this audit entry" message={result.message} />
      </div>
    );
  }

  return <AuditLogDetails log={result.data} dashboardPath={dashboardPath} />;
};

export const AuditLogDetailPage = async ({
  params,
  dashboardPath,
}: {
  params: Promise<{ auditLogId: string }>;
  dashboardPath: string;
}) => {
  const { auditLogId } = await params;

  return (
    <Suspense fallback={<AuditLogLoadingTable />}>
      <AuditLogDetailContent id={auditLogId} dashboardPath={dashboardPath} />
    </Suspense>
  );
};

import Link from "next/link";
import { Eye } from "lucide-react";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { SearchBar } from "@/components/ui/SearchBar";
import TableBackButton from "@/components/ui/TableBackButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TSearchParams } from "@/types";
import { getAllAuditLogsAction, getAuditLogEntitiesAction } from "../../_actions/auditLogActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { AuditActionBadge, AuditActor, AuditEntityLink, formatAuditTime } from "./AuditLogBits";
import { AuditLogFilters } from "./AuditLogFilters";

type AuditLogTableProps = {
  searchParams?: TSearchParams;
  // e.g. "/admin-dashboard"
  dashboardPath: string;
};

const AuditLogTable = async ({ searchParams, dashboardPath }: AuditLogTableProps) => {
  const [result, entities] = await Promise.all([
    getAllAuditLogsAction({ query: searchParams }),
    getAuditLogEntitiesAction(),
  ]);

  if (!result.success) {
    return <CatalogError title="Failed to load the audit log" message={result.message} />;
  }

  const logs = result.data ?? [];
  const currentPage = Math.max(1, Number(result.meta?.page ?? 1));
  const limit = Math.max(1, Number(result.meta?.limit ?? 20));
  const totalPages = Math.max(1, Number(result.meta?.totalPages ?? 1));

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="mx-1 flex flex-col gap-3 border-b py-4 sm:mx-2 md:mx-0 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            <TableBackButton />
            Audit log
          </h2>
          <p className="text-sm text-muted-foreground">
            {(result.meta?.total ?? logs.length).toLocaleString()} entries · who did what, and when
          </p>
        </div>
        <SearchBar compact />
      </div>

      <div className="mx-1 py-3 sm:mx-2 md:mx-0">
        <AuditLogFilters entities={entities.success ? (entities.data ?? []) : []} />
      </div>

      <div className="mx-1 overflow-x-auto sm:mx-2 md:mx-0">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-14 font-semibold">#</TableHead>
              <TableHead className="font-semibold">When</TableHead>
              <TableHead className="font-semibold">Who</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
              <TableHead className="font-semibold">Entity</TableHead>
              <TableHead className="font-semibold">IP address</TableHead>
              <TableHead className="text-right font-semibold">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No audit entries match these filters.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatAuditTime(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <AuditActor log={log} />
                  </TableCell>
                  <TableCell>
                    <AuditActionBadge action={log.action} />
                  </TableCell>
                  <TableCell>
                    <AuditEntityLink log={log} dashboardPath={dashboardPath} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ipAddress || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`${dashboardPath}/audit-logs/${log.id}`}
                      className="inline-flex size-7 items-center justify-center rounded-md border transition hover:bg-muted"
                      aria-label="View audit entry"
                      title="View audit entry"
                    >
                      <Eye className="size-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
};

export default AuditLogTable;

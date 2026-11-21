import Link from "next/link";
import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/ui/CustomPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { REPORT_REASON_LABEL, REPORT_TARGET_LABEL } from "@/lib/enum";
import { TSearchParams } from "@/types";
import { getReportsAction } from "../../_actions/reportActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { CatalogThumb } from "../Catalog/CatalogThumb";
import { ReportStatusBadge, targetTitle } from "./ReportBits";

/*
 * Staff report queue (reports grouped per target).
 */

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const ReportTable = async ({ searchParams, dashboardPath }: { searchParams?: TSearchParams; dashboardPath: string }) => {
  const statusParam = getValue(searchParams?.status);
  // "ACTIVE" is the UI name for the backend default (open + in review)
  const query = { ...searchParams };
  if (!statusParam || statusParam === "ACTIVE") delete query.status;
  const result = await getReportsAction(query);

  if (!result.success) {
    return <CatalogError title="Failed to load reports" message={result.message} />;
  }

  const reports = result.data ?? [];
  const currentPage = Math.max(1, Number(result.meta?.page ?? 1));
  const limit = Math.max(1, Number(result.meta?.limit ?? 20));
  const basePath = `${dashboardPath}/reports`;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {["#", "Reported", "Reason", "Reports", "Reporter", "Status", "Sent", "Action"].map((column) => (
                <TableHead key={column} className={column === "Action" ? "text-right font-semibold" : "font-semibold"}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No reports here. 🎉
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report, index) => (
                <TableRow key={report.id}>
                  <TableCell className="text-muted-foreground">{(currentPage - 1) * limit + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {report.listing && (
                        <CatalogThumb name={report.listing.title} imageUrl={report.listing.images[0]?.url ?? null} size={40} />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{REPORT_TARGET_LABEL[report.targetType]}</p>
                        <p className="max-w-xs truncate font-medium">{targetTitle(report)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{REPORT_REASON_LABEL[report.reason]}</TableCell>
                  <TableCell>
                    {(report.openReportsOnTarget ?? 0) > 1 ? (
                      <Badge className="border-transparent bg-destructive/10 text-destructive">
                        <Flag className="size-3" aria-hidden="true" /> {report.openReportsOnTarget} open
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">{report.openReportsOnTarget || "—"}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{report.reporter.name}</TableCell>
                  <TableCell>
                    <ReportStatusBadge status={report.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatRelativeDate(report.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`${basePath}/${report.id}`}
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                    >
                      Open
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <CustomPagination currentPage={currentPage} totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))} />
    </div>
  );
};

export default ReportTable;

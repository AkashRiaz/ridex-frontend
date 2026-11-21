import Link from "next/link";
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
import { getMyReportsAction } from "../../_actions/reportActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { ReportStatusBadge, targetTitle } from "./ReportBits";

/*
 * The signed-in user's own reports.
 */

const MyReportTable = async ({ searchParams }: { searchParams?: TSearchParams }) => {
  const result = await getMyReportsAction(searchParams);

  if (!result.success) {
    return <CatalogError title="Failed to load your reports" message={result.message} />;
  }

  const reports = result.data ?? [];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {["Reported", "Reason", "Status", "Sent"].map((column) => (
                <TableHead key={column} className="font-semibold">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  You have not reported anything.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <p className="text-xs text-muted-foreground">{REPORT_TARGET_LABEL[report.targetType]}</p>
                    {report.listing ? (
                      <Link href={`/listings/${report.listing.slug}`} className="font-medium hover:underline">
                        {report.listing.title}
                      </Link>
                    ) : report.reportedUser ? (
                      <Link href={`/sellers/${report.reportedUser.id}`} className="font-medium hover:underline">
                        {report.reportedUser.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{targetTitle(report)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{REPORT_REASON_LABEL[report.reason]}</TableCell>
                  <TableCell>
                    <ReportStatusBadge status={report.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatRelativeDate(report.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <CustomPagination
        currentPage={Math.max(1, Number(result.meta?.page ?? 1))}
        totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))}
      />
    </div>
  );
};

export default MyReportTable;

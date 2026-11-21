import { Badge } from "@/components/ui/badge";
import { REPORT_STATUS_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { IMyReport, IReport, TReportStatus } from "@/types";

/*
 * Small pieces shared by the report tables and pages.
 */

const statusClassName: Record<TReportStatus, string> = {
  OPEN: "bg-warning/20 text-foreground",
  IN_REVIEW: "bg-primary/10 text-primary",
  RESOLVED: "bg-success/15 text-success",
  DISMISSED: "bg-muted text-muted-foreground",
};

export function ReportStatusBadge({ status }: { status: TReportStatus }) {
  return <Badge className={cn("border-transparent", statusClassName[status])}>{REPORT_STATUS_LABEL[status]}</Badge>;
}

export const targetTitle = (report: IMyReport | IReport) => {
  if (report.listing) return report.listing.title;
  if (report.reportedUser) return report.reportedUser.name;
  if (report.review) return `${report.review.rating}★ review`;
  if (report.message) {
    const text = report.message.type === "IMAGE" ? "Photo" : report.message.body;
    return `Message: "${text.length > 60 ? `${text.slice(0, 59)}…` : text}"`;
  }
  return "Removed content";
};

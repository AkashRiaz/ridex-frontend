import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { Skeleton } from "@/components/ui/skeleton";
import TableBackButton from "@/components/ui/TableBackButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UrlFilterSelect } from "@/components/shared/UrlFilterSelect";
import { RatingStars } from "@/components/shared/SellerBadges";
import { StatusBadge } from "@/components/shared/UserBadges";
import { ListingStatusBadge, formatRelativeDate } from "@/components/listing/ListingBits";
import {
  REPORT_ACTION_LABEL,
  REPORT_REASON_LABEL,
  REPORT_STATUS_LABEL,
  REPORT_TARGET_LABEL,
  ROLE_LABEL,
} from "@/lib/enum";
import { cn } from "@/lib/utils";
import { getMe } from "@/service/getMe";
import { IMyReport, IReport, TListingStatus, TReportStatus, TSearchParams } from "@/types";
import { getMyReportsAction, getReportByIdAction, getReportsAction } from "../../_actions/reportActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { CatalogThumb } from "../Catalog/CatalogThumb";
import ReportResolvePanel from "./ReportResolvePanel";

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const statusClassName: Record<TReportStatus, string> = {
  OPEN: "bg-warning/20 text-foreground",
  IN_REVIEW: "bg-primary/10 text-primary",
  RESOLVED: "bg-success/15 text-success",
  DISMISSED: "bg-muted text-muted-foreground",
};

export function ReportStatusBadge({ status }: { status: TReportStatus }) {
  return <Badge className={cn("border-transparent", statusClassName[status])}>{REPORT_STATUS_LABEL[status]}</Badge>;
}

const targetTitle = (report: IMyReport | IReport) => {
  if (report.listing) return report.listing.title;
  if (report.reportedUser) return report.reportedUser.name;
  if (report.review) return `${report.review.rating}★ review`;
  return "Removed content";
};

// ============================================
// Everyone: my reports
// ============================================

const MyReportsTable = async ({ searchParams }: { searchParams?: TSearchParams }) => {
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

export const MyReportsPage = async ({ searchParams }: { searchParams?: Promise<TSearchParams> }) => {
  const params = await searchParams;

  return (
    <div className="space-y-4 p-2 md:p-5">
      <div>
        <h1 className="text-xl font-semibold">My reports</h1>
        <p className="text-sm text-muted-foreground">
          Listings, users and reviews you reported, and what our team decided
        </p>
      </div>
      <Suspense key={JSON.stringify(params ?? {})} fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <MyReportsTable searchParams={params} />
      </Suspense>
    </div>
  );
};

// ============================================
// Staff: queue
// ============================================

const QUEUE_TABS: { value: string; label: string }[] = [
  { value: "ACTIVE", label: "Open & in review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "ALL", label: "All" },
];

const ReportsTable = async ({ searchParams, dashboardPath }: { searchParams?: TSearchParams; dashboardPath: string }) => {
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

export const ManageReportsPage = async ({
  searchParams,
  dashboardPath,
}: {
  searchParams?: Promise<TSearchParams>;
  dashboardPath: string;
}) => {
  const params = await searchParams;
  const active = getValue(params?.status) ?? "ACTIVE";
  const basePath = `${dashboardPath}/reports`;

  const tabHref = (value: string) => {
    const query = new URLSearchParams();
    if (value !== "ACTIVE") query.set("status", value);
    for (const key of ["targetType", "sortBy"]) {
      const current = getValue(params?.[key]);
      if (current) query.set(key, current);
    }
    const queryString = query.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  return (
    <div className="space-y-4 p-2 md:p-5">
      <div>
        <h1 className="text-xl font-semibold">
          <TableBackButton />
          Reports
        </h1>
        <p className="text-sm text-muted-foreground">Most-reported first. One decision closes every report on the same target.</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs>
          <TabsList className="h-auto flex-wrap">
            {QUEUE_TABS.map((tab) => (
              <TabsTrigger key={tab.value} href={tabHref(tab.value)} active={active === tab.value} replace scroll={false}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap gap-2">
          <UrlFilterSelect
            param="targetType"
            label="Target"
            allLabel="All targets"
            options={(["LISTING", "USER", "REVIEW"] as const).map((value) => ({ value, label: REPORT_TARGET_LABEL[value] }))}
          />
          <UrlFilterSelect
            param="sortBy"
            label="Sort"
            allLabel="Priority"
            options={[{ value: "newest", label: "Newest" }]}
          />
        </div>
      </div>

      <Suspense key={JSON.stringify(params ?? {})} fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <ReportsTable searchParams={params} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

// ============================================
// Staff: detail
// ============================================

const TargetSnapshot = ({ report, dashboardPath }: { report: IReport; dashboardPath: string }) => {
  if (report.listing) {
    const listing = report.listing;

    return (
      <div className="flex flex-wrap items-center gap-4">
        <CatalogThumb name={listing.title} imageUrl={listing.images[0]?.url ?? null} size={72} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold">{listing.title}</p>
          <p className="text-sm text-muted-foreground">
            Seller: {listing.seller.name} · <StatusBadge status={listing.seller.status} />
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {listing.isDeleted ? <Badge variant="outline">Deleted</Badge> : <ListingStatusBadge status={listing.status as TListingStatus} />}
            <Link
              href={`${dashboardPath}/listings/${listing.id}`}
              className="font-medium text-primary hover:underline"
            >
              Moderation view
            </Link>
            <Link
              href={`/listings/${listing.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Public page <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (report.reportedUser) {
    const user = report.reportedUser;

    return (
      <div className="space-y-1">
        <p className="font-semibold">{user.name}</p>
        <p className="text-sm text-muted-foreground">
          {user.email ?? "No email"} · {ROLE_LABEL[user.role]} · joined {formatRelativeDate(user.createdAt).toLowerCase()}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge status={user.status} isDeleted={user.isDeleted} />
          <Link href={`/sellers/${user.id}`} target="_blank" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            Public profile <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  if (report.review) {
    const review = report.review;

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {review.reviewer.name} → {review.seller.name}
          {review.isHidden && " · hidden"}
        </p>
        <RatingStars rating={review.rating} />
        <p className="whitespace-pre-line rounded-lg bg-muted/50 p-3 text-sm">{review.comment || "No comment"}</p>
      </div>
    );
  }

  return <p className="text-sm text-muted-foreground">The reported content no longer exists.</p>;
};

const ReportDetail = async ({ reportId, dashboardPath }: { reportId: string; dashboardPath: string }) => {
  const [result, me] = await Promise.all([getReportByIdAction(reportId), getMe()]);

  if (!result.success || !result.data) {
    if (result.statusCode === 404 || result.statusCode === 400) notFound();
    return <CatalogError title="Failed to load report" message={result.message} />;
  }

  const report = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            <TableBackButton />
            {REPORT_TARGET_LABEL[report.targetType]} report · {REPORT_REASON_LABEL[report.reason]}
          </h1>
          <p className="text-sm text-muted-foreground">
            by {report.reporter.name} · {formatRelativeDate(report.createdAt).toLowerCase()}
          </p>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <section className="space-y-3 rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Reported {REPORT_TARGET_LABEL[report.targetType].toLowerCase()}</h2>
            <TargetSnapshot report={report} dashboardPath={dashboardPath} />
          </section>

          <section className="space-y-2 rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Reporter&apos;s details</h2>
            <p className="whitespace-pre-line text-sm">{report.details || "No details given."}</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold">Other reports on this target ({report.otherReports.length})</h2>
            {report.otherReports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other reports.</p>
            ) : (
              <ul className="divide-y rounded-2xl border bg-card">
                {report.otherReports.map((other) => (
                  <li key={other.id} className="flex flex-wrap items-start justify-between gap-2 p-4 text-sm">
                    <div className="space-y-0.5">
                      <p className="font-medium">
                        {REPORT_REASON_LABEL[other.reason]} · {other.reporter.name}
                      </p>
                      {other.details && <p className="text-muted-foreground">{other.details}</p>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {formatRelativeDate(other.createdAt)}
                      <ReportStatusBadge status={other.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <ReportResolvePanel report={report} actorRole={me.data?.role ?? "MODERATOR"} />
          {report.actionTaken && (
            <p className="text-xs text-muted-foreground">Action taken: {REPORT_ACTION_LABEL[report.actionTaken]}</p>
          )}
        </aside>
      </div>
    </div>
  );
};

export const ReportDetailPage = async ({
  params,
  dashboardPath,
}: {
  params: Promise<{ reportId: string }>;
  dashboardPath: string;
}) => {
  const { reportId } = await params;

  return (
    <div className="mx-auto max-w-6xl p-2 md:p-5">
      <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-2xl" />}>
        <ReportDetail reportId={reportId} dashboardPath={dashboardPath} />
      </Suspense>
    </div>
  );
};

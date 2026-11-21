import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TableBackButton from "@/components/ui/TableBackButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlFilterSelect } from "@/components/shared/UrlFilterSelect";
import { RatingStars } from "@/components/shared/SellerBadges";
import { StatusBadge } from "@/components/shared/UserBadges";
import { ListingStatusBadge, formatRelativeDate } from "@/components/listing/ListingBits";
import {
  REPORT_ACTION_LABEL,
  REPORT_REASON_LABEL,
  REPORT_TARGET_LABEL,
  ROLE_LABEL,
} from "@/lib/enum";
import { cn } from "@/lib/utils";
import { getMe } from "@/service/getMe";
import { IReport, IReportDetail, TListingStatus, TSearchParams } from "@/types";
import { getReportByIdAction } from "../../_actions/reportActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { CatalogThumb } from "../Catalog/CatalogThumb";
import MyReportLoadingTable from "./MyReportLoadingTable";
import MyReportTable from "./MyReportTable";
import { ReportStatusBadge } from "./ReportBits";
import ReportLoadingTable from "./ReportLoadingTable";
import ReportResolvePanel from "./ReportResolvePanel";
import ReportTable from "./ReportTable";

const getValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// ============================================
// Everyone: my reports
// ============================================

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
      <Suspense key={JSON.stringify(params ?? {})} fallback={<MyReportLoadingTable />}>
        <MyReportTable searchParams={params} />
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

      <Suspense key={JSON.stringify(params ?? {})} fallback={<ReportLoadingTable />}>
        <ReportTable searchParams={params} dashboardPath={dashboardPath} />
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

  if (report.message) {
    const sender = report.message.sender;
    const context = (report as IReportDetail).messageContext ?? [];

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Sent by {sender?.name ?? "a deleted user"}
          {sender && (
            <>
              {" "}· {ROLE_LABEL[sender.role]} · <StatusBadge status={sender.status} isDeleted={sender.isDeleted} />
            </>
          )}
        </p>
        <ol className="space-y-2 rounded-lg bg-muted/40 p-3" aria-label="Conversation excerpt">
          {context.map((message) => {
            const isReported = message.id === report.message?.id;

            return (
              <li
                key={message.id}
                className={cn(
                  "rounded-md px-3 py-2 text-sm",
                  isReported ? "border border-destructive/40 bg-destructive/5" : "bg-background",
                )}
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {message.sender?.name ?? "System"} · {formatRelativeDate(message.createdAt).toLowerCase()}
                  {isReported && " · reported"}
                </p>
                {message.type === "IMAGE" && message.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={message.imageUrl} alt="Photo sent in chat" className="mt-1 max-h-40 rounded-md" />
                ) : (
                  <p className="mt-0.5 whitespace-pre-line">{message.body}</p>
                )}
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-muted-foreground">
          Staff can only see the reported message and the few before it.
        </p>
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

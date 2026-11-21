import Link from "next/link";
import { CheckCircle2, ClipboardCheck, Clock, Flag } from "lucide-react";
import { REPORT_REASON_LABEL, REPORT_TARGET_LABEL, VERIFICATION_TYPE_LABEL } from "@/lib/enum";
import { TDashboardRange, TReportReason, TReportTargetType } from "@/types";
import { getModeratorOverviewAction } from "../../_actions/dashboardActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { BarBreakdownChart, DonutChart, TrendChart } from "./DashboardCharts";
import {
  CardLink,
  ChartCard,
  EmptyChart,
  EmptyList,
  ListingThumb,
  MiniStat,
  QueueAlert,
  StatCard,
  StatGrid,
  formatAge,
  formatNumber,
  rangeLabel,
} from "./DashboardWidgets";

const ModeratorDashboardOverview = async ({
  range,
  dashboardPath,
}: {
  range: TDashboardRange;
  dashboardPath: string;
}) => {
  const result = await getModeratorOverviewAction(range);

  if (!result.success || !result.data) {
    return <CatalogError title="Failed to load the dashboard" message={result.message} />;
  }

  const data = result.data;
  const period = rangeLabel(range).toLowerCase();
  const hasDecisions = data.series.some((point) => point.approved + point.rejected + point.reports > 0);

  const reasons = (Object.keys(data.openReportsByReason) as TReportReason[]).map((key) => ({
    key,
    label: REPORT_REASON_LABEL[key],
    count: data.openReportsByReason[key],
  }));
  const targets = (Object.keys(data.openReportsByTarget) as TReportTargetType[])
    .map((key) => ({ label: REPORT_TARGET_LABEL[key], count: data.openReportsByTarget[key] }))
    .filter((item) => item.count > 0);
  const openReports = reasons.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <QueueAlert count={data.queues.listings} label="Review {count} pending listings" href={`${dashboardPath}/listings`} />
        <QueueAlert count={data.queues.reports} label="{count} open reports" href={`${dashboardPath}/reports`} />
      </div>

      <StatGrid>
        <StatCard
          label="Pending listings"
          value={formatNumber(data.queues.listings)}
          icon={ClipboardCheck}
          hint="Waiting for review"
          href={`${dashboardPath}/listings`}
        />
        <StatCard
          label="Open reports"
          value={formatNumber(data.queues.reports)}
          icon={Flag}
          hint="Open or in review"
          href={`${dashboardPath}/reports`}
        />
        <StatCard
          label="My listing decisions"
          value={formatNumber(data.mine.approved + data.mine.rejected)}
          icon={CheckCircle2}
          hint={`${data.mine.approvalRate}% approved · last ${period}`}
        />
        <StatCard
          label="Average approval time"
          value={data.averageReviewHours === null ? "—" : `${data.averageReviewHours}h`}
          icon={Clock}
          hint={`Submit → approve, whole team · last ${period}`}
        />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <ChartCard title="My moderation work" description={`Decisions per day · last ${period}`}>
          {hasDecisions ? (
            <TrendChart
              data={data.series}
              series={[
                { key: "approved", label: "Approved" },
                { key: "rejected", label: "Rejected" },
                { key: "reports", label: "Reports closed" },
              ]}
            />
          ) : (
            <EmptyChart message="You haven't made any decisions in this period." />
          )}
        </ChartCard>

        <ChartCard title="Me, this period" description={`Last ${period}`}>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Approved" value={formatNumber(data.mine.approved)} tone="success" />
            <MiniStat label="Rejected" value={formatNumber(data.mine.rejected)} />
            <MiniStat label="Reports resolved" value={formatNumber(data.mine.reportsResolved)} />
            <MiniStat label="Reports dismissed" value={formatNumber(data.mine.reportsDismissed)} />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Open reports by reason" description="Everything still waiting">
          {openReports > 0 ? <DonutChart data={reasons} centerLabel="open" /> : <EmptyChart message="No open reports. Nice." />}
        </ChartCard>
        <ChartCard title="Open reports by type" description="What people are reporting">
          {targets.length ? <BarBreakdownChart data={targets} label="Reports" /> : <EmptyChart message="No open reports." />}
        </ChartCard>
      </div>

      <div className={data.oldest.verifications ? "grid gap-5 xl:grid-cols-3" : "grid gap-5 lg:grid-cols-2"}>
        <ChartCard
          title="Waiting longest: listings"
          action={<CardLink href={`${dashboardPath}/listings`}>Queue</CardLink>}
        >
          {data.oldest.listings.length ? (
            <ul className="space-y-1">
              {data.oldest.listings.map((listing) => (
                <li key={listing.id}>
                  <ListingThumb
                    title={listing.title}
                    coverImage={listing.coverImage}
                    price={listing.price}
                    href={`${dashboardPath}/listings/${listing.id}`}
                    meta={
                      <>
                        <span>{listing.seller.name}</span>
                        <span>· waiting {formatAge(listing.submittedAt)}</span>
                      </>
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyList message="The listing queue is empty." />
          )}
        </ChartCard>

        <ChartCard
          title="Waiting longest: reports"
          action={<CardLink href={`${dashboardPath}/reports`}>Queue</CardLink>}
        >
          {data.oldest.reports.length ? (
            <ul className="divide-y">
              {data.oldest.reports.map((report) => (
                <li key={report.id}>
                  <Link
                    href={`${dashboardPath}/reports/${report.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition hover:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{REPORT_REASON_LABEL[report.reason]}</p>
                      <p className="text-xs text-muted-foreground">{REPORT_TARGET_LABEL[report.targetType]}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatAge(report.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyList message="No open reports." />
          )}
        </ChartCard>

        {data.oldest.verifications && (
          <ChartCard
            title="Waiting longest: verifications"
            action={<CardLink href={`${dashboardPath}/verifications`}>Queue</CardLink>}
          >
            {data.oldest.verifications.length ? (
              <ul className="divide-y">
                {data.oldest.verifications.map((request) => (
                  <li key={request.id}>
                    <Link
                      href={`${dashboardPath}/verifications/${request.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition hover:bg-muted/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{request.user.name}</p>
                        <p className="text-xs text-muted-foreground">{VERIFICATION_TYPE_LABEL[request.type]}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatAge(request.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyList message="No verifications waiting." />
            )}
          </ChartCard>
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboardOverview;

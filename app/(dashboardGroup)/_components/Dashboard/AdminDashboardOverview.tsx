import Link from "next/link";
import { Bike, Clock, Flag, MessagesSquare, ShieldCheck, Users } from "lucide-react";
import { LISTING_STATUS_LABEL, REPORT_REASON_LABEL, ROLE_LABEL, USER_STATUS_LABEL } from "@/lib/enum";
import { Role, TDashboardRange, TListingStatus, TReportReason, UserStatus } from "@/types";
import { getAdminOverviewAction } from "../../_actions/dashboardActions";
import { AuditActionBadge, AuditActor, describeAuditLog, formatAuditTime } from "../AuditLog/AuditLogBits";
import { CatalogError } from "../Catalog/CatalogStates";
import { BarBreakdownChart, DonutChart, TrendChart } from "./DashboardCharts";
import {
  CardLink,
  ChartCard,
  EmptyChart,
  EmptyList,
  MiniStat,
  QueueAlert,
  StatCard,
  StatGrid,
  formatNumber,
  rangeLabel,
} from "./DashboardWidgets";

const toSlices = <TKey extends string>(counts: Record<TKey, number>, labels: Record<TKey, string>) =>
  (Object.keys(counts) as TKey[]).map((key) => ({ key, label: labels[key], count: counts[key] }));

const AdminDashboardOverview = async ({
  range,
  dashboardPath,
  isSuperAdmin,
}: {
  range: TDashboardRange;
  dashboardPath: string;
  isSuperAdmin: boolean;
}) => {
  const result = await getAdminOverviewAction(range);

  if (!result.success || !result.data) {
    return <CatalogError title="Failed to load the dashboard" message={result.message} />;
  }

  const data = result.data;
  const period = rangeLabel(range).toLowerCase();
  const hasActivity = data.series.some((point) => point.users + point.submitted + point.approved > 0);
  const hasSafety = data.series.some((point) => point.reports + point.conversations > 0);

  const reasons = (Object.keys(data.reports.byReason) as TReportReason[])
    .map((key) => ({ label: REPORT_REASON_LABEL[key], count: data.reports.byReason[key] }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <QueueAlert count={data.queues.listings} label="Review {count} pending listings" href={`${dashboardPath}/listings`} />
        <QueueAlert count={data.queues.reports} label="{count} open reports" href={`${dashboardPath}/reports`} />
        <QueueAlert
          count={data.queues.verifications ?? 0}
          label="{count} verifications waiting"
          href={`${dashboardPath}/verifications`}
        />
      </div>

      <StatGrid>
        <StatCard
          label="Users"
          value={formatNumber(data.users.total)}
          icon={Users}
          change={data.users.change}
          hint={`${formatNumber(data.users.newInRange)} joined in the last ${period}`}
          href={`${dashboardPath}/users`}
        />
        <StatCard
          label="Live listings"
          value={formatNumber(data.listings.live)}
          icon={Bike}
          change={data.listings.change}
          hint={`${formatNumber(data.listings.submittedInRange)} submitted in the last ${period}`}
          href={`${dashboardPath}/listings?status=APPROVED`}
        />
        <StatCard
          label="Open reports"
          value={formatNumber(data.reports.open)}
          icon={Flag}
          change={data.reports.change}
          invertChange
          hint={`${formatNumber(data.reports.inRange)} new in the last ${period}`}
          href={`${dashboardPath}/reports`}
        />
        <StatCard
          label="Conversations"
          value={formatNumber(data.chats.conversations)}
          icon={MessagesSquare}
          change={data.chats.change}
          hint={`${formatNumber(data.chats.messagesInRange)} messages in the last ${period}`}
        />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <ChartCard title="Marketplace activity" description={`New users and listings per day · last ${period}`}>
          {hasActivity ? (
            <TrendChart
              data={data.series}
              series={[
                { key: "users", label: "New users" },
                { key: "submitted", label: "Listings submitted" },
                { key: "approved", label: "Listings approved" },
              ]}
            />
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Listings by status" description="All listings, not deleted">
          {data.listings.total > 0 ? (
            <DonutChart
              data={toSlices<TListingStatus>(data.listings.byStatus, LISTING_STATUS_LABEL)}
              centerLabel="listings"
            />
          ) : (
            <EmptyChart message="No listings yet." />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Top brands" description="Live listings per brand">
          {data.topBrands.length ? <BarBreakdownChart data={data.topBrands} label="Listings" /> : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Listings by division" description="Where live listings are">
          {data.listingsByDivision.length ? (
            <BarBreakdownChart data={data.listingsByDivision} label="Listings" />
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <ChartCard title="Trust and conversations" description={`Reports and new chats per day · last ${period}`}>
          {hasSafety ? (
            <TrendChart
              data={data.series}
              series={[
                { key: "conversations", label: "New chats" },
                { key: "reports", label: "Reports" },
              ]}
            />
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Moderation" description="Right now">
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Pending listings" value={formatNumber(data.queues.listings)} tone={data.queues.listings ? "warning" : undefined} />
            <MiniStat label="Open reports" value={formatNumber(data.queues.reports)} tone={data.queues.reports ? "warning" : undefined} />
            <MiniStat label="ID checks" value={formatNumber(data.verifications.byType.ID)} />
            <MiniStat label="Dealer checks" value={formatNumber(data.verifications.byType.DEALER)} />
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" aria-hidden="true" />
            Average approval time:{" "}
            <span className="font-medium text-foreground">
              {data.listings.averageReviewHours === null ? "—" : `${data.listings.averageReviewHours}h`}
            </span>
          </p>
          {reasons.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Report reasons · last {period}</p>
              <ul className="space-y-1.5 text-sm">
                {reasons.slice(0, 4).map((reason) => (
                  <li key={reason.label} className="flex justify-between gap-3">
                    <span className="truncate">{reason.label}</span>
                    <span className="font-medium tabular-nums">{reason.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.6fr_1.4fr]">
        <ChartCard
          title={isSuperAdmin ? "Accounts by role" : "Accounts by status"}
          description={isSuperAdmin ? `${formatNumber(data.users.staff)} staff accounts` : "All accounts, not deleted"}
        >
          {data.users.total > 0 ? (
            isSuperAdmin ? (
              <DonutChart data={toSlices<Role>(data.users.byRole, ROLE_LABEL)} centerLabel="accounts" />
            ) : (
              <DonutChart data={toSlices<UserStatus>(data.users.byStatus, USER_STATUS_LABEL)} centerLabel="accounts" />
            )
          ) : (
            <EmptyChart message="No accounts yet." />
          )}
        </ChartCard>

        <ChartCard
          title="Recent activity"
          description="Latest staff and account actions"
          action={<CardLink href={`${dashboardPath}/audit-logs`}>Audit log</CardLink>}
        >
          {data.recentActivity.length ? (
            <ul className="divide-y">
              {data.recentActivity.map((log) => (
                <li key={log.id}>
                  <Link
                    href={`${dashboardPath}/audit-logs/${log.id}`}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2 py-2.5 transition hover:bg-muted/60"
                  >
                    <div className="w-44 min-w-0">
                      <AuditActor log={log} compact />
                    </div>
                    <AuditActionBadge action={log.action} />
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{describeAuditLog(log)}</span>
                    <span className="text-xs text-muted-foreground">{formatAuditTime(log.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyList message="Nothing has happened yet." />
          )}
        </ChartCard>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Updated {formatAuditTime(data.generatedAt)} · refreshes every minute
      </p>
    </div>
  );
};

export default AdminDashboardOverview;

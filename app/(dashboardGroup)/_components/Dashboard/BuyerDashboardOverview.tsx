import Link from "next/link";
import { BadgeCheck, Eye, Flag, Heart, MessagesSquare, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VERIFICATION_STATUS_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { TDashboardRange } from "@/types";
import { getBuyerOverviewAction } from "../../_actions/dashboardActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { BarBreakdownChart, TrendChart } from "./DashboardCharts";
import {
  CardLink,
  ChartCard,
  EmptyChart,
  EmptyList,
  ListingThumb,
  StatCard,
  StatGrid,
  formatNumber,
  rangeLabel,
} from "./DashboardWidgets";

function CheckRow({ label, done, note }: { label: string; done: boolean; note?: string }) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium",
          done ? "text-success" : "text-muted-foreground",
        )}
      >
        {done && <BadgeCheck className="size-3.5" aria-hidden="true" />}
        {done ? "Verified" : (note ?? "Not verified")}
      </span>
    </li>
  );
}

const BuyerDashboardOverview = async ({
  range,
  dashboardPath,
  showTrustLinks,
}: {
  range: TDashboardRange;
  dashboardPath: string;
  // buyers have verification and review pages; dealer staff and inspectors don't (yet)
  showTrustLinks: boolean;
}) => {
  const result = await getBuyerOverviewAction(range);

  if (!result.success || !result.data) {
    return <CatalogError title="Failed to load the dashboard" message={result.message} />;
  }

  const data = result.data;
  const period = rangeLabel(range).toLowerCase();
  const hasTrend = data.series.some((point) => point.saves + point.viewed + point.messages > 0);
  const idRequest = data.trust.verifications.ID;

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard
          label="Saved bikes"
          value={formatNumber(data.saved.total)}
          icon={Heart}
          hint={
            data.saved.unavailable
              ? `${formatNumber(data.saved.unavailable)} no longer available`
              : "All still available"
          }
          href={`${dashboardPath}/saved`}
        />
        <StatCard
          label="Recently viewed"
          value={formatNumber(data.recentlyViewed)}
          icon={Eye}
          hint="Listings you opened"
          href={`${dashboardPath}/recently-viewed`}
        />
        <StatCard
          label="Active chats"
          value={formatNumber(data.chats.active)}
          icon={MessagesSquare}
          hint={
            data.chats.unreadMessages
              ? `${formatNumber(data.chats.unreadMessages)} unread messages`
              : "You're all caught up"
          }
          href={`${dashboardPath}/messages`}
        />
        <StatCard
          label="My reports"
          value={formatNumber(data.reports.total)}
          icon={Flag}
          hint={data.reports.open ? `${formatNumber(data.reports.open)} still being reviewed` : "None open"}
          href={`${dashboardPath}/my-reports`}
        />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <ChartCard title="Your activity" description={`Per day · last ${period}`}>
          {hasTrend ? (
            <TrendChart
              data={data.series}
              series={[
                { key: "viewed", label: "Listings viewed" },
                { key: "saves", label: "Saved" },
                { key: "messages", label: "Messages sent" },
              ]}
            />
          ) : (
            <EmptyChart message="Browse and save bikes to see your activity here." />
          )}
        </ChartCard>

        <ChartCard title="Brands you've saved">
          {data.savedByBrand.length ? (
            <BarBreakdownChart data={data.savedByBrand} label="Saved" />
          ) : (
            <EmptyChart message="Nothing saved yet." />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <ChartCard
          title="Recently saved"
          action={<CardLink href={`${dashboardPath}/saved`}>All saved</CardLink>}
        >
          {data.recentSaved.length ? (
            <ul className="grid gap-1 sm:grid-cols-2">
              {data.recentSaved.map((listing) => (
                <li key={listing.id}>
                  <ListingThumb
                    title={listing.title}
                    coverImage={listing.coverImage}
                    price={listing.price}
                    href={listing.isAvailable ? `/listings/${listing.slug}` : `${dashboardPath}/saved`}
                    meta={
                      !listing.isAvailable && (
                        <Badge variant="outline" className="text-[10px]">
                          {listing.status === "SOLD" ? "Sold" : "Unavailable"}
                        </Badge>
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center">
              <EmptyList message="Tap the heart on any listing to keep it here." />
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Search className="size-4" aria-hidden="true" />
                Browse bikes
              </Link>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Your account"
          description="Verified buyers get faster replies"
          action={showTrustLinks ? <CardLink href={`${dashboardPath}/verification`}>Verify</CardLink> : undefined}
        >
          <ul className="space-y-2">
            <CheckRow label="Email" done={data.trust.emailVerified} />
            <CheckRow label="Phone" done={data.trust.phoneVerified} />
            <CheckRow
              label="ID"
              done={data.trust.idVerified}
              note={idRequest && idRequest.status !== "APPROVED" ? VERIFICATION_STATUS_LABEL[idRequest.status] : undefined}
            />
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            {formatNumber(data.reviewsGiven)} reviews written
            {showTrustLinks && (
              <>
                {" · "}
                <Link href={`${dashboardPath}/reviews`} className="text-primary hover:underline">
                  See reviews
                </Link>
              </>
            )}
          </p>
        </ChartCard>
      </div>
    </div>
  );
};

export default BuyerDashboardOverview;

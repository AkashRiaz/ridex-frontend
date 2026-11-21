import Link from "next/link";
import { BadgeCheck, Bike, Eye, Heart, MessagesSquare, Plus, Star } from "lucide-react";
import { ListingStatusBadge } from "@/components/listing/ListingBits";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { LISTING_STATUS_LABEL, VERIFICATION_STATUS_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { ILatestVerification, TDashboardRange, TListingStatus } from "@/types";
import { getSellerOverviewAction } from "../../_actions/dashboardActions";
import { CatalogError } from "../Catalog/CatalogStates";
import { DonutChart, TrendChart } from "./DashboardCharts";
import {
  CardLink,
  ChartCard,
  EmptyChart,
  EmptyList,
  ListingThumb,
  MiniStat,
  StatCard,
  StatGrid,
  formatDate,
  formatNumber,
  rangeLabel,
} from "./DashboardWidgets";

function TrustRow({ label, verified, pending }: { label: string; verified: boolean; pending?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium",
          verified ? "text-success" : pending ? "text-warning" : "text-muted-foreground",
        )}
      >
        {verified && <BadgeCheck className="size-3.5" aria-hidden="true" />}
        {verified ? "Verified" : pending ? "Pending review" : "Not verified"}
      </span>
    </li>
  );
}

const isPending = (verification: ILatestVerification) => verification?.status === "PENDING";

export function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed five stars
          key={index}
          className={cn("size-3.5", index < Math.round(rating) ? "fill-warning text-warning" : "text-muted-foreground/40")}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

const SellerDashboardOverview = async ({
  range,
  dashboardPath,
  isDealer,
}: {
  range: TDashboardRange;
  dashboardPath: string;
  isDealer: boolean;
}) => {
  const result = await getSellerOverviewAction(range);

  if (!result.success || !result.data) {
    return <CatalogError title="Failed to load the dashboard" message={result.message} />;
  }

  const data = result.data;
  const period = rangeLabel(range).toLowerCase();
  const hasTrend = data.series.some((point) => point.chats + point.saves + point.sold > 0);

  if (data.listings.total === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-card">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bike className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">List your first bike</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Your views, saves and chats will show up here once your listing is live.
        </p>
        <Link
          href={`${dashboardPath}/create-listing`}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create a listing
        </Link>
      </div>
    );
  }

  const statusSlices = (Object.keys(data.listings.byStatus) as TListingStatus[]).map((key) => ({
    key,
    label: LISTING_STATUS_LABEL[key],
    count: data.listings.byStatus[key],
  }));

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard
          label="Live listings"
          value={formatNumber(data.listings.live)}
          icon={Bike}
          hint={`${formatNumber(data.listings.total)} in total · ${formatNumber(data.listings.soldInRange)} sold in the last ${period}`}
          href={`${dashboardPath}/my-listings`}
        />
        <StatCard
          label="Total views"
          value={formatNumber(data.engagement.views)}
          icon={Eye}
          hint="Across all your listings"
        />
        <StatCard
          label="Saves"
          value={formatNumber(data.engagement.saves)}
          icon={Heart}
          change={data.engagement.savesChange}
          hint={`${formatNumber(data.engagement.savesInRange)} in the last ${period}`}
        />
        <StatCard
          label="Chats"
          value={formatNumber(data.engagement.chats)}
          icon={MessagesSquare}
          change={data.engagement.chatsChange}
          hint={
            data.engagement.unreadMessages
              ? `${formatNumber(data.engagement.unreadMessages)} unread messages`
              : `${formatNumber(data.engagement.chatsInRange)} new in the last ${period}`
          }
          href={`${dashboardPath}/messages?side=selling`}
        />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <ChartCard title="Buyer interest" description={`Chats, saves and sales per day · last ${period}`}>
          {hasTrend ? (
            <TrendChart
              data={data.series}
              series={[
                { key: "chats", label: "New chats" },
                { key: "saves", label: "Saves" },
                { key: "sold", label: "Sold" },
              ]}
            />
          ) : (
            <EmptyChart message="No chats or saves in this period yet." />
          )}
        </ChartCard>
        <ChartCard title="My listings" description="By status">
          <DonutChart data={statusSlices} centerLabel="listings" />
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <ChartCard
          title="Top listings"
          description="Most viewed"
          action={<CardLink href={`${dashboardPath}/my-listings`}>All listings</CardLink>}
        >
          {data.topListings.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 font-medium">Listing</th>
                    <th className="py-2 text-right font-medium">Views</th>
                    <th className="py-2 text-right font-medium">Saves</th>
                    <th className="py-2 text-right font-medium">Chats</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topListings.map((listing) => (
                    <tr key={listing.id} className="border-b last:border-0">
                      <td className="max-w-0 py-1">
                        <ListingThumb
                          title={listing.title}
                          coverImage={listing.coverImage}
                          price={listing.price}
                          href={`/listings/${listing.slug}`}
                          meta={<ListingStatusBadge status={listing.status} />}
                        />
                      </td>
                      <td className="py-1 text-right tabular-nums">{formatNumber(listing.viewsCount)}</td>
                      <td className="py-1 text-right tabular-nums">{formatNumber(listing.saves)}</td>
                      <td className="py-1 text-right tabular-nums">{formatNumber(listing.chats)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyList message="Your live listings will be ranked here." />
          )}
        </ChartCard>

        <ChartCard title="Chat to sale" description="Listings that got a chat and then sold">
          <p className="text-4xl font-bold tabular-nums">{data.conversion.rate}%</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat label="Listings with chats" value={formatNumber(data.conversion.listingsWithChats)} />
            <MiniStat label="Of those, sold" value={formatNumber(data.conversion.soldWithChats)} tone="success" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Mark listings as sold so this stays accurate.</p>
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard
          title="Trust"
          action={
            <CardLink href={`${dashboardPath}/verification`}>{isDealer ? "Verify business" : "Verify ID"}</CardLink>
          }
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl font-bold tabular-nums">
              {data.trust.ratingCount ? data.trust.ratingAverage.toFixed(1) : "—"}
            </span>
            <div>
              <RatingStars rating={data.trust.ratingAverage} />
              <p className="text-xs text-muted-foreground">{formatNumber(data.trust.ratingCount)} reviews</p>
            </div>
          </div>
          <ul className="space-y-2">
            <TrustRow label="Phone" verified={data.trust.phoneVerified} />
            <TrustRow label="Email" verified={data.trust.emailVerified} />
            <TrustRow label="ID" verified={data.trust.idVerified} pending={isPending(data.trust.verifications.ID)} />
            {isDealer && (
              <TrustRow
                label="Dealer business"
                verified={data.trust.dealerVerified}
                pending={isPending(data.trust.verifications.DEALER)}
              />
            )}
          </ul>
          {data.trust.verifications.ID?.status === "REJECTED" && !data.trust.idVerified && (
            <p className="mt-3 text-xs text-destructive">
              ID {VERIFICATION_STATUS_LABEL.REJECTED.toLowerCase()}: {data.trust.verifications.ID.rejectionReason}
            </p>
          )}
        </ChartCard>

        <ChartCard
          title="Expiring this week"
          description="Renew them to stay in search"
          action={<CardLink href={`${dashboardPath}/my-listings?status=APPROVED`}>Manage</CardLink>}
        >
          {data.expiringSoon.length ? (
            <ul className="space-y-1">
              {data.expiringSoon.map((listing) => (
                <li key={listing.id}>
                  <ListingThumb
                    title={listing.title}
                    coverImage={listing.coverImage}
                    price={listing.price}
                    href={`${dashboardPath}/my-listings?status=APPROVED`}
                    meta={<span>· expires {formatDate(listing.expiresAt)}</span>}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyList message="Nothing expires in the next 7 days." />
          )}
        </ChartCard>

        <ChartCard
          title="Latest reviews"
          action={<CardLink href={`${dashboardPath}/reviews`}>All reviews</CardLink>}
        >
          {data.recentReviews.length ? (
            <ul className="space-y-4">
              {data.recentReviews.map((review) => (
                <li key={review.id} className="flex gap-3">
                  <UserAvatar name={review.reviewer.name} imageUrl={review.reviewer.imageUrl} size={32} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{review.reviewer.name}</span>
                      <RatingStars rating={review.rating} />
                    </div>
                    {review.comment && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{review.comment}</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {review.listing.title} · {formatDate(review.createdAt)}
                      {!review.sellerReply && " · not replied"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyList message="No reviews yet." />
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default SellerDashboardOverview;

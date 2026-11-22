"use client";

import { Fragment, type ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Plus, Star, X } from "lucide-react";
import { ListingImagePlaceholder, ListingStatusBadge, formatMileage } from "@/components/listing/ListingBits";
import { PriceInsightBadge } from "@/components/listing/PriceInsight";
import { TopSellerBadge } from "@/components/shared/SellerBadges";
import { useCompare } from "@/hooks/useCompare";
import { LISTING_CONDITION_LABEL } from "@/lib/enum";
import { MAX_COMPARE_LISTINGS, compareHref } from "@/lib/compare";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { ICompareListing, ICompareResult } from "@/types";

type TRow = {
  key: string;
  label: string;
  // ids of the best listings in this row
  best?: string[];
  isDifferent: boolean;
  render: (listing: ICompareListing, index: number) => ReactNode;
};

const valueKey = (values: unknown[]) => new Set(values.map((value) => JSON.stringify(value))).size > 1;

/*
 * Side-by-side table: sticky label column, one column per listing,
 * the best value in each row highlighted, "differences only" toggle.
 */
export default function CompareTable({ result }: { result: ICompareResult }) {
  const router = useRouter();
  const { remove } = useCompare();
  const [differencesOnly, setDifferencesOnly] = useState(false);

  const { listings, specRows, highlights, vehicleType } = result;
  const canAddMore = listings.length < MAX_COMPARE_LISTINGS;

  const removeColumn = (id: string) => {
    remove(id);
    router.replace(compareHref(listings.filter((listing) => listing.id !== id).map((listing) => listing.id)), {
      scroll: false,
    });
  };

  const fixedRows: TRow[] = [
    {
      key: "price",
      label: "Price",
      best: highlights.lowestPrice,
      isDifferent: valueKey(listings.map((listing) => listing.price)),
      render: (listing) => (
        <span className="font-semibold">
          {formatCurrency(listing.price)}
          {listing.isNegotiable && <span className="block text-xs font-normal text-muted-foreground">Negotiable</span>}
        </span>
      ),
    },
    {
      key: "priceInsight",
      label: "Price insight",
      best: highlights.bestDeal,
      isDifferent: valueKey(listings.map((listing) => listing.priceInsight.rating)),
      render: (listing) => (
        <span className="flex flex-col items-start gap-1">
          <PriceInsightBadge rating={listing.priceInsight.rating} />
          {listing.priceInsight.diffPercent !== null && (
            <span className="text-xs text-muted-foreground">
              {listing.priceInsight.diffPercent > 0 ? "+" : ""}
              {Math.round(listing.priceInsight.diffPercent)}% vs. typical
            </span>
          )}
        </span>
      ),
    },
    {
      key: "year",
      label: "Model year",
      best: highlights.newestYear,
      isDifferent: valueKey(listings.map((listing) => listing.year)),
      render: (listing) => listing.year,
    },
    {
      key: "mileage",
      label: "Mileage",
      best: highlights.lowestMileage,
      isDifferent: valueKey(listings.map((listing) => listing.mileage)),
      render: (listing) => formatMileage(listing.mileage),
    },
    {
      key: "condition",
      label: "Condition",
      isDifferent: valueKey(listings.map((listing) => listing.condition)),
      render: (listing) => LISTING_CONDITION_LABEL[listing.condition],
    },
    {
      key: "color",
      label: "Color",
      isDifferent: valueKey(listings.map((listing) => listing.color)),
      render: (listing) => listing.color ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "location",
      label: "Location",
      isDifferent: valueKey(listings.map((listing) => listing.district)),
      render: (listing) => [listing.area, listing.district].filter(Boolean).join(", ") || "—",
    },
    {
      key: "seller",
      label: "Seller",
      isDifferent: true,
      render: (listing) => (
        <span className="flex flex-col items-start gap-1">
          <span className="flex items-center gap-1.5">
            {listing.seller.name}
            <TopSellerBadge badges={listing.seller.badges} />
          </span>
          {listing.seller.ratingCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="size-3 fill-warning text-warning" aria-hidden="true" />
              {listing.seller.ratingAverage.toFixed(1)} ({listing.seller.ratingCount})
            </span>
          )}
        </span>
      ),
    },
  ];

  // spec rows grouped under their schema group
  const groups = specRows.reduce<{ group: string; rows: TRow[] }[]>((acc, row) => {
    const entry: TRow = {
      key: `spec-${row.key}`,
      label: row.label,
      isDifferent: row.isDifferent,
      render: (_listing, index) => row.values[index] ?? <span className="text-muted-foreground">—</span>,
    };
    const last = acc[acc.length - 1];

    if (last && last.group === row.group) {
      last.rows.push(entry);
    } else {
      acc.push({ group: row.group || "Specifications", rows: [entry] });
    }

    return acc;
  }, []);

  const visible = (rows: TRow[]) => (differencesOnly && listings.length > 1 ? rows.filter((row) => row.isDifferent) : rows);

  const columnClass = "min-w-44 px-4 py-3 align-top sm:min-w-52";
  const labelClass =
    "sticky left-0 z-10 w-28 min-w-28 bg-card px-4 py-3 text-left align-top text-xs font-medium text-muted-foreground sm:w-40 sm:min-w-40";

  const renderRow = (row: TRow) => (
    <tr key={row.key} className="border-t">
      <th scope="row" className={labelClass}>
        {row.label}
      </th>
      {listings.map((listing, index) => {
        const isBest = row.best?.includes(listing.id);

        return (
          <td key={listing.id} className={cn(columnClass, "text-sm", isBest && "bg-success/10")}>
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0">{row.render(listing, index)}</span>
              {isBest && (
                <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-success">
                  <Award className="size-3.5" aria-hidden="true" />
                  Best
                </span>
              )}
            </span>
          </td>
        );
      })}
      {canAddMore && <td aria-hidden="true" className={cn(columnClass, "hidden lg:table-cell")} />}
    </tr>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {listings.length} of {MAX_COMPARE_LISTINGS} {vehicleType ? `${vehicleType.name.toLowerCase()} ` : ""}listings
        </p>
        {listings.length > 1 && (
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={differencesOnly}
              onChange={(event) => setDifferencesOnly(event.target.checked)}
              className="size-4 accent-primary"
            />
            Show differences only
          </label>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Comparison of {listings.length} listings. The best value in a row is marked “Best”.
          </caption>
          <thead>
            <tr>
              <td className={cn(labelClass, "align-bottom")}>
                <span className="sr-only">Listing</span>
              </td>
              {listings.map((listing) => (
                <th key={listing.id} scope="col" className={cn(columnClass, "text-left font-normal")}>
                  <div className="relative space-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                      {listing.coverImageUrl ? (
                        <Image
                          src={listing.coverImageUrl}
                          alt={listing.title}
                          fill
                          sizes="(min-width: 1024px) 240px, 200px"
                          className="object-cover"
                        />
                      ) : (
                        <ListingImagePlaceholder label={listing.title} />
                      )}
                      {listing.status !== "APPROVED" && (
                        <span className="absolute left-2 top-2">
                          <ListingStatusBadge status={listing.status} />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeColumn(listing.id)}
                        aria-label={`Remove ${listing.title} from compare`}
                        className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:bg-background"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <Link
                      href={`/listings/${listing.slug}`}
                      className="line-clamp-2 text-sm font-semibold leading-snug hover:underline"
                    >
                      {listing.title}
                    </Link>
                  </div>
                </th>
              ))}
              {canAddMore && (
                <th scope="col" className={cn(columnClass, "hidden text-left font-normal lg:table-cell")}>
                  <Link
                    href={vehicleType ? `/listings?vehicleType=${vehicleType.slug}` : "/listings"}
                    className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    <Plus className="size-5" aria-hidden="true" />
                    Add a listing
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visible(fixedRows).map(renderRow)}
            {groups.map(({ group, rows }) => {
              const shown = visible(rows);

              if (shown.length === 0) return null;

              return (
                <Fragment key={group}>
                  <tr className="border-t bg-muted/40">
                    <th
                      scope="colgroup"
                      colSpan={listings.length + 1 + (canAddMore ? 1 : 0)}
                      className="sticky left-0 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                    >
                      {group}
                    </th>
                  </tr>
                  {shown.map(renderRow)}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {listings.length === 1 && (
        <p className="text-sm text-muted-foreground">
          Add at least one more listing to see the best values highlighted.{" "}
          <Link
            href={vehicleType ? `/listings?vehicleType=${vehicleType.slug}` : "/listings"}
            className="font-medium text-primary hover:underline"
          >
            Browse listings
          </Link>
        </p>
      )}
    </div>
  );
}

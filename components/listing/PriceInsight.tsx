import { CircleHelp, TrendingDown, TrendingUp, Scale } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { IPriceInsight, TPriceRating } from "@/types";

const RATING_META: Record<
  TPriceRating,
  { label: string; icon: typeof Scale; className: string; markerClassName: string }
> = {
  GOOD_DEAL: {
    label: "Good deal",
    icon: TrendingDown,
    className: "border-success/40 bg-success/10 text-success",
    markerClassName: "bg-success",
  },
  FAIR: {
    label: "Fair price",
    icon: Scale,
    className: "border-primary/30 bg-primary/10 text-primary",
    markerClassName: "bg-primary",
  },
  HIGH: {
    label: "Priced high",
    icon: TrendingUp,
    className: "border-warning/50 bg-warning/15 text-foreground",
    markerClassName: "bg-warning",
  },
  INSUFFICIENT_DATA: {
    label: "Not rated",
    icon: CircleHelp,
    className: "border-border bg-muted text-muted-foreground",
    markerClassName: "bg-muted-foreground",
  },
};

export function PriceInsightBadge({ rating, className }: { rating: TPriceRating; className?: string }) {
  const meta = RATING_META[rating];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        meta.className,
        className,
      )}
    >
      <meta.icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/*
 * "14% below the typical price" — the sentence screen readers get instead of the bar.
 */
export const describePriceInsight = (insight: IPriceInsight) => {
  if (insight.rating === "INSUFFICIENT_DATA" || insight.diffPercent === null || insight.median === null) {
    return insight.reason === "NO_MODEL"
      ? "Price insight needs a specific model to compare against."
      : "There aren't enough similar listings yet to rate this price.";
  }

  const percent = Math.abs(Math.round(insight.diffPercent));

  if (percent === 0) return `Right at the typical price of ${formatCurrency(insight.median)}.`;

  return `${percent}% ${insight.diffPercent < 0 ? "below" : "above"} the typical price of ${formatCurrency(insight.median)}.`;
};

/*
 * The p25–p75 band of similar listings, the median tick and this listing's price.
 */
function PriceRangeBar({ insight }: { insight: IPriceInsight }) {
  if (insight.p25 === null || insight.p75 === null || insight.median === null) return null;

  const values = [insight.p25, insight.p75, insight.median, insight.price];
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;
  const position = (value: number) => `${((value - min) / (max - min)) * 100}%`;

  return (
    <div aria-hidden="true" className="space-y-1.5 pt-1">
      <div className="relative h-2 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 rounded-full bg-primary/25"
          style={{ left: position(insight.p25), right: `calc(100% - ${position(insight.p75)})` }}
        />
        <div className="absolute -inset-y-1 w-px bg-foreground/40" style={{ left: position(insight.median) }} />
        <div
          className={cn(
            "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow",
            RATING_META[insight.rating].markerClassName,
          )}
          style={{ left: position(insight.price) }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{formatCurrency(insight.p25)}</span>
        <span>Typical range</span>
        <span>{formatCurrency(insight.p75)}</span>
      </div>
    </div>
  );
}

export function PriceInsightCard({ insight, className }: { insight: IPriceInsight; className?: string }) {
  const isRated = insight.rating !== "INSUFFICIENT_DATA";

  return (
    <section
      aria-labelledby={`price-insight-${insight.listingId}`}
      className={cn("space-y-3 rounded-2xl border bg-card p-5 shadow-card", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`price-insight-${insight.listingId}`} className="text-sm font-semibold">
          Price insight
        </h2>
        <PriceInsightBadge rating={insight.rating} />
      </div>

      <p className={cn("text-sm", !isRated && "text-muted-foreground")}>{describePriceInsight(insight)}</p>

      {isRated && <PriceRangeBar insight={insight} />}

      {isRated && insight.basis && (
        <p className="text-xs text-muted-foreground">
          Based on {insight.sampleSize} similar listings ({insight.basis}), including recent sales.
        </p>
      )}
    </section>
  );
}

export function PriceInsightSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("space-y-3 rounded-2xl border bg-card p-5", className)}>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

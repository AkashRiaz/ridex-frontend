import { RatingStars } from "@/components/shared/SellerBadges";
import { IRatingSummary } from "@/types";

/*
 * Average + 1–5 distribution bars (plain CSS, no chart library).
 */
export function RatingSummary({ summary }: { summary: IRatingSummary }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center">
      <div className="shrink-0 text-center sm:w-36">
        <p className="text-4xl font-bold">{summary.count ? summary.average.toFixed(1) : "—"}</p>
        <RatingStars rating={summary.average} size={18} className="mt-1" />
        <p className="mt-1 text-xs text-muted-foreground">
          {summary.count} review{summary.count === 1 ? "" : "s"}
        </p>
      </div>

      <dl className="flex-1 space-y-1.5">
        {(["5", "4", "3", "2", "1"] as const).map((star) => {
          const count = summary.distribution[star] ?? 0;
          const percent = summary.count ? Math.round((count / summary.count) * 100) : 0;

          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <dt className="w-12 shrink-0 text-muted-foreground">{star} star</dt>
              <dd className="flex flex-1 items-center gap-3">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <span className="block h-full rounded-full bg-warning" style={{ width: `${percent}%` }} />
                </span>
                <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

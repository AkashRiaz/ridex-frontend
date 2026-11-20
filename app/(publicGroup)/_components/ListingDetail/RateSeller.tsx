import Link from "next/link";
import { Star } from "lucide-react";
import { ReviewCard } from "@/components/review/ReviewCard";
import { ReviewForm } from "@/components/review/ReviewForm";
import { getDashboardPath } from "@/lib/dashboardPath";
import { Role } from "@/types";
import { getReviewEligibilityAction } from "@/app/(dashboardGroup)/_actions/reviewActions";

/*
 * "Rate this seller" on the listing page — only for signed-in, eligible visitors.
 */
export const RateSeller = async ({
  listingId,
  sellerName,
  viewerRole,
}: {
  listingId: string;
  sellerName: string;
  viewerRole: Role;
}) => {
  const result = await getReviewEligibilityAction(listingId);

  if (!result.success || !result.data) return null;

  const eligibility = result.data;
  const dashboardPath = getDashboardPath(viewerRole);

  if (eligibility.existingReview) {
    return (
      <section aria-labelledby="your-review-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="your-review-heading" className="text-xl font-bold">
            Your review
          </h2>
          {dashboardPath && (
            <Link href={`${dashboardPath}/reviews?tab=given`} className="text-sm font-medium text-primary hover:underline">
              Edit in your dashboard
            </Link>
          )}
        </div>
        <ReviewCard review={eligibility.existingReview} showListing={false} />
      </section>
    );
  }

  if (!eligibility.allowed) {
    if (eligibility.code !== "UNVERIFIED") return null;

    return (
      <p className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        <Star className="size-4 shrink-0" aria-hidden="true" />
        {eligibility.reason}
        {dashboardPath && (
          <Link href={`${dashboardPath}/profile`} className="ml-auto shrink-0 font-medium text-primary hover:underline">
            Verify now
          </Link>
        )}
      </p>
    );
  }

  return (
    <section aria-labelledby="rate-heading" className="space-y-4 rounded-2xl border bg-card p-5">
      <div>
        <h2 id="rate-heading" className="text-xl font-bold">
          Rate {sellerName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Dealt with this seller? Your review helps other buyers. You can edit it for 30 days.
        </p>
      </div>
      <ReviewForm listingId={listingId} />
    </section>
  );
};

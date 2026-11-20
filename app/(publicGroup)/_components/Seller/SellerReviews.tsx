import { CustomPagination } from "@/components/ui/CustomPagination";
import { RatingSummary } from "@/components/review/RatingSummary";
import { ReviewCard } from "@/components/review/ReviewCard";
import { ReportDialog } from "@/components/shared/ReportDialog";
import { TSearchParams } from "@/types";
import { getSellerReviewsAction } from "@/app/(dashboardGroup)/_actions/reviewActions";

export const SellerReviews = async ({
  sellerId,
  searchParams,
  viewerId,
}: {
  sellerId: string;
  searchParams?: TSearchParams;
  viewerId: string | null;
}) => {
  const result = await getSellerReviewsAction(sellerId, searchParams);

  if (!result.success) {
    return <p className="text-sm text-muted-foreground">Reviews are unavailable right now.</p>;
  }

  const reviews = result.data ?? [];
  const summary = result.meta?.summary;

  return (
    <div className="space-y-4">
      {summary && <RatingSummary summary={summary} />}

      {reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No reviews yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard
                review={review}
                actions={
                  viewerId !== review.reviewerId && viewerId !== review.sellerId ? (
                    <ReportDialog
                      targetType="REVIEW"
                      targetId={review.id}
                      isSignedIn={Boolean(viewerId)}
                      label="Report review"
                    />
                  ) : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      <CustomPagination
        currentPage={Math.max(1, Number(result.meta?.page ?? 1))}
        totalPages={Math.max(1, Number(result.meta?.totalPages ?? 1))}
      />
    </div>
  );
};

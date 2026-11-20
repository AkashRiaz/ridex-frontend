import Link from "next/link";
import { EyeOff, MessageSquareReply } from "lucide-react";
import { RatingStars } from "@/components/shared/SellerBadges";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatRelativeDate } from "@/components/listing/ListingBits";
import { IReview } from "@/types";

type ReviewCardProps = {
  review: IReview;
  // whose name leads the card: the reviewer (public, received) or the seller (given)
  perspective?: "reviewer" | "seller";
  showListing?: boolean;
  // action slot (reply / edit / report buttons)
  actions?: React.ReactNode;
};

export function ReviewCard({ review, perspective = "reviewer", showListing = true, actions }: ReviewCardProps) {
  const person = perspective === "reviewer" ? review.reviewer : review.seller;

  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar name={person.name} imageUrl={person.imageUrl} size={36} />
          <div>
            <p className="text-sm font-semibold">
              {perspective === "seller" && <span className="font-normal text-muted-foreground">Seller: </span>}
              {person.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RatingStars rating={review.rating} size={14} />
              <time dateTime={review.createdAt}>{formatRelativeDate(review.createdAt)}</time>
            </div>
          </div>
        </div>
        {review.isHidden && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <EyeOff className="size-3" aria-hidden="true" /> Hidden by moderators
          </span>
        )}
      </header>

      {showListing && (
        <p className="text-xs text-muted-foreground">
          For{" "}
          <Link href={`/listings/${review.listing.slug}`} className="font-medium text-foreground hover:underline">
            {review.listing.title}
          </Link>
        </p>
      )}

      {review.comment ? (
        // plain text only
        <p className="whitespace-pre-line text-sm leading-6">{review.comment}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground">No comment</p>
      )}

      {review.isHidden && review.hiddenReason && (
        <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">Reason: {review.hiddenReason}</p>
      )}

      {review.sellerReply && (
        <div className="rounded-xl border-l-2 border-primary bg-muted/40 px-4 py-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold">
            <MessageSquareReply className="size-3.5" aria-hidden="true" /> Reply from {review.seller.name}
          </p>
          <p className="whitespace-pre-line text-sm">{review.sellerReply}</p>
        </div>
      )}

      {actions && <div className="flex flex-wrap items-center gap-2 border-t pt-3">{actions}</div>}
    </article>
  );
}

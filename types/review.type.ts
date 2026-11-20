type TUserRef = { id: string; name: string; imageUrl: string | null };

export type IReview = {
  id: string;
  reviewerId: string;
  sellerId: string;
  listingId: string;
  rating: number;
  comment: string;
  sellerReply: string | null;
  sellerRepliedAt: string | null;
  isHidden: boolean;
  hiddenReason: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer: TUserRef;
  seller: TUserRef;
  listing: { id: string; title: string; slug: string };
  // "given" list only
  canEdit?: boolean;
};

export type IRatingSummary = {
  average: number;
  count: number;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
};

export type TReviewIneligibleCode =
  | "OWN_LISTING"
  | "LISTING_UNAVAILABLE"
  | "UNVERIFIED"
  | "ALREADY_REVIEWED"
  | "NO_INTERACTION";

export type IReviewEligibility =
  | { allowed: true; existingReview: IReview | null }
  | { allowed: false; code: TReviewIneligibleCode; reason: string; existingReview: IReview | null };

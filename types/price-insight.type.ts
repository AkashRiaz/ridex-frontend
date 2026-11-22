// Keep in sync with ridex-backend/src/app/module/priceInsight/priceInsight.interface.ts
export type TPriceRating = "GOOD_DEAL" | "FAIR" | "HIGH" | "INSUFFICIENT_DATA";

export type TPriceInsightReason = "NO_MODEL" | "TOO_FEW_COMPARABLES";

export type IPriceInsight = {
  listingId: string;
  rating: TPriceRating;
  reason: TPriceInsightReason | null;
  price: number;
  median: number | null;
  p25: number | null;
  p75: number | null;
  // (price − median) / median × 100
  diffPercent: number | null;
  sampleSize: number;
  // e.g. "Yamaha R15 V4 · 2022–2023 · used"
  basis: string | null;
  generatedAt: string;
};

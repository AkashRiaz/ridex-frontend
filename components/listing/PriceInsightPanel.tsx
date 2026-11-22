import { getListingPriceInsightAction } from "@/app/(publicGroup)/_actions/priceInsightActions";
import { PriceInsightCard } from "./PriceInsight";

type PriceInsightPanelProps = {
  listingId: string;
  className?: string;
  // owners and staff see "not enough data" too; buyers only see a rating
  showUnrated?: boolean;
};

/*
 * Server component: wrap in <Suspense fallback={<PriceInsightSkeleton />}>.
 * A failed request renders nothing — the price insight is a hint, never a blocker.
 */
export async function PriceInsightPanel({ listingId, className, showUnrated = false }: PriceInsightPanelProps) {
  const result = await getListingPriceInsightAction(listingId);

  if (!result.success || !result.data) return null;

  if (result.data.rating === "INSUFFICIENT_DATA" && !showUnrated) return null;

  return <PriceInsightCard insight={result.data} className={className} />;
}

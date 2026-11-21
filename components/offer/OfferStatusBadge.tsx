import { OFFER_STATUS_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { TOfferStatus } from "@/types";

const TONE: Record<TOfferStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  COUNTERED: "bg-muted text-muted-foreground",
  ACCEPTED: "bg-success/15 text-success",
  DECLINED: "bg-destructive/10 text-destructive",
  WITHDRAWN: "bg-muted text-muted-foreground",
  EXPIRED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
};

export function OfferStatusBadge({ status, className }: { status: TOfferStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold",
        TONE[status],
        className,
      )}
    >
      {OFFER_STATUS_LABEL[status]}
    </span>
  );
}

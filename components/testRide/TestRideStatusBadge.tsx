import { TEST_RIDE_STATUS_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { TTestRideStatus } from "@/types";

const TONE: Record<TTestRideStatus, string> = {
  REQUESTED: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  CONFIRMED: "bg-success/15 text-success",
  DECLINED: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-primary/10 text-primary",
  NO_SHOW: "bg-destructive/10 text-destructive",
  EXPIRED: "bg-muted text-muted-foreground",
};

export function TestRideStatusBadge({ status, className }: { status: TTestRideStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold",
        TONE[status],
        className,
      )}
    >
      {TEST_RIDE_STATUS_LABEL[status]}
    </span>
  );
}

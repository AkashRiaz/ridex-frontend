import { Badge } from "@/components/ui/badge";
import { VERIFICATION_STATUS_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { TVerificationStatus } from "@/types";

/*
 * Status badge shared by the verification table and pages.
 */

const statusClassName: Record<TVerificationStatus, string> = {
  PENDING: "bg-warning/20 text-foreground",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
};

export function VerificationStatusBadge({ status }: { status: TVerificationStatus }) {
  return (
    <Badge className={cn("border-transparent", statusClassName[status])}>{VERIFICATION_STATUS_LABEL[status]}</Badge>
  );
}

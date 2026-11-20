import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL, USER_STATUS_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { Role, UserStatus } from "@/types";

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant="secondary">{ROLE_LABEL[role]}</Badge>;
}

const statusClassName: Record<UserStatus, string> = {
  ACTIVE: "bg-success/15 text-success",
  PENDING: "bg-warning/20 text-foreground",
  BLOCKED: "bg-destructive/10 text-destructive",
  INACTIVE: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  isDeleted = false,
}: {
  status: UserStatus;
  isDeleted?: boolean;
}) {
  if (isDeleted) {
    return <Badge variant="outline">Deleted</Badge>;
  }

  return (
    <Badge className={cn("border-transparent", statusClassName[status])}>
      {USER_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={cn(
        "border-transparent",
        isActive ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

export function VerifiedBadge({
  verified,
  label,
}: {
  verified: boolean;
  label: string;
}) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      {label} verified
    </span>
  ) : (
    <span className="text-xs text-muted-foreground">{label} not verified</span>
  );
}

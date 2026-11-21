import Link from "next/link";
import { Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AUDIT_ACTION_LABEL, ROLE_LABEL, auditEntityLabel } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { IAuditLog, TAuditAction } from "@/types";

const actionClassName: Record<TAuditAction, string> = {
  CREATE: "bg-success/15 text-success",
  UPDATE: "bg-primary/10 text-primary",
  DELETE: "bg-destructive/10 text-destructive",
  LOGIN: "bg-muted text-muted-foreground",
  LOGOUT: "bg-muted text-muted-foreground",
  APPROVE: "bg-success/15 text-success",
  REJECT: "bg-destructive/10 text-destructive",
  PUBLISH: "bg-primary/10 text-primary",
  CANCEL: "bg-warning/20 text-foreground",
  PAYMENT: "bg-primary/10 text-primary",
};

export function AuditActionBadge({ action }: { action: TAuditAction }) {
  return (
    <Badge className={cn("border-transparent", actionClassName[action])}>{AUDIT_ACTION_LABEL[action]}</Badge>
  );
}

/*
 * Where an entry's entity can be opened in this dashboard (null when there is no page).
 */
const ENTITY_PATHS: Record<string, string> = {
  User: "users",
  Listing: "listings",
  Report: "reports",
  VerificationRequest: "verifications",
  Brand: "brands",
  VehicleType: "vehicle-types",
  VehicleModel: "vehicle-models",
};

export const auditEntityHref = (dashboardPath: string, entity: string, entityId: string | null) =>
  entityId && ENTITY_PATHS[entity] ? `${dashboardPath}/${ENTITY_PATHS[entity]}/${entityId}` : null;

export function AuditEntityLink({ log, dashboardPath }: { log: IAuditLog; dashboardPath: string }) {
  const href = auditEntityHref(dashboardPath, log.entity, log.entityId);
  const label = auditEntityLabel(log.entity);

  return (
    <div className="min-w-0">
      <p className="font-medium">{label}</p>
      {log.entityId &&
        (href ? (
          <Link href={href} className="block truncate font-mono text-xs text-primary hover:underline">
            {log.entityId.slice(0, 8)}…
          </Link>
        ) : (
          <p className="truncate font-mono text-xs text-muted-foreground">{log.entityId.slice(0, 8)}…</p>
        ))}
    </div>
  );
}

export function AuditActor({ log, compact = false }: { log: IAuditLog; compact?: boolean }) {
  if (!log.user) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex size-8 items-center justify-center rounded-full bg-muted">
          <Cpu className="size-4" aria-hidden="true" />
        </span>
        System
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <UserAvatar name={log.user.name} imageUrl={log.user.imageUrl} size={compact ? 28 : 32} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{log.user.name}</p>
        {!compact && (
          <p className="truncate text-xs text-muted-foreground">
            {ROLE_LABEL[log.user.role]} · {log.user.email || log.user.phone || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

export const formatAuditTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// one-line summary, e.g. "Approved Listing"
export const describeAuditLog = (log: IAuditLog) => `${AUDIT_ACTION_LABEL[log.action]} ${auditEntityLabel(log.entity).toLowerCase()}`;

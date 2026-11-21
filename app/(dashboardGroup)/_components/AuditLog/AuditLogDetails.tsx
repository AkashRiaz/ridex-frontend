import Link from "next/link";
import { ExternalLink } from "lucide-react";
import TableBackButton from "@/components/ui/TableBackButton";
import { auditEntityLabel } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { IAuditLog, TAuditData } from "@/types";
import { AuditActionBadge, AuditActor, auditEntityHref, describeAuditLog, formatAuditTime } from "./AuditLogBits";

const isRecord = (value: TAuditData): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const formatValue = (value: unknown) => {
  if (value === undefined) return "—";
  if (value === null) return "null";
  if (typeof value === "string") return value || '""';
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  return JSON.stringify(value, null, 2);
};

/*
 * Before vs after, one row per key. Keys present on only one side show "—" on the other.
 */
function DataDiff({ oldData, newData }: { oldData: TAuditData; newData: TAuditData }) {
  if (!isRecord(oldData) && !isRecord(newData)) {
    if (oldData === null && newData === null) {
      return <p className="text-sm text-muted-foreground">This entry has no extra data.</p>;
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["Before", oldData],
          ["After", newData],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <p className="mb-1 text-xs font-medium text-muted-foreground">{String(label)}</p>
            <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs">{formatValue(value)}</pre>
          </div>
        ))}
      </div>
    );
  }

  const before = isRecord(oldData) ? oldData : {};
  const after = isRecord(newData) ? newData : {};
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="w-1/5 py-2 pr-3 font-medium">Field</th>
            <th className="w-2/5 py-2 pr-3 font-medium">Before</th>
            <th className="w-2/5 py-2 font-medium">After</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const changed = JSON.stringify(before[key]) !== JSON.stringify(after[key]);

            return (
              <tr key={key} className="border-b align-top last:border-0">
                <td className="py-2 pr-3 font-mono text-xs">{key}</td>
                <td className="py-2 pr-3">
                  <pre
                    className={cn(
                      "max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md px-2 py-1 text-xs",
                      changed && key in before && "bg-destructive/10",
                    )}
                  >
                    {formatValue(before[key])}
                  </pre>
                </td>
                <td className="py-2">
                  <pre
                    className={cn(
                      "max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md px-2 py-1 text-xs",
                      changed && key in after && "bg-success/10",
                    )}
                  >
                    {formatValue(after[key])}
                  </pre>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const AuditLogDetails = ({ log, dashboardPath }: { log: IAuditLog; dashboardPath: string }) => {
  const entityHref = auditEntityHref(dashboardPath, log.entity, log.entityId);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-2 md:p-5">
      <div>
        <h1 className="text-lg font-semibold">
          <TableBackButton />
          {describeAuditLog(log)}
        </h1>
        <p className="text-sm text-muted-foreground">{formatAuditTime(log.createdAt)}</p>
      </div>

      <section className="grid gap-4 rounded-2xl border bg-card p-5 shadow-card sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Who</p>
          <AuditActor log={log} />
          {log.user && (
            <Link
              href={`${dashboardPath}/audit-logs?userId=${log.user.id}`}
              className="text-xs text-primary hover:underline"
            >
              More by this user
            </Link>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Action</p>
          <AuditActionBadge action={log.action} />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Entity</p>
          <p className="text-sm font-medium">{auditEntityLabel(log.entity)}</p>
          {log.entityId && <p className="break-all font-mono text-xs text-muted-foreground">{log.entityId}</p>}
          <div className="flex flex-wrap gap-3">
            {entityHref && (
              <Link href={entityHref} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Open <ExternalLink className="size-3" aria-hidden="true" />
              </Link>
            )}
            {log.entityId && (
              <Link
                href={`${dashboardPath}/audit-logs?entityId=${log.entityId}`}
                className="text-xs text-primary hover:underline"
              >
                Full history
              </Link>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Request</p>
          <p className="font-mono text-xs">{log.ipAddress || "—"}</p>
          <p className="line-clamp-3 text-xs text-muted-foreground" title={log.userAgent ?? undefined}>
            {log.userAgent || "—"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <h2 className="mb-3 font-semibold">Changes</h2>
        <DataDiff oldData={log.oldData} newData={log.newData} />
        <p className="mt-3 text-xs text-muted-foreground">Passwords, tokens and codes are never shown.</p>
      </section>
    </div>
  );
};

export default AuditLogDetails;

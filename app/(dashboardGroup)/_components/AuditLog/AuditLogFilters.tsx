"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AUDIT_ACTION_LABEL, auditEntityLabel } from "@/lib/enum";
import { IAuditLogEntity, TAuditAction } from "@/types";

const ALL = "ALL";

const FILTER_KEYS = ["action", "entity", "from", "to", "entityId", "userId"];

/*
 * Action / entity / date filters, stored in the URL like UserFilters.
 */
export function AuditLogFilters({ entities }: { entities: IAuditLogEntity[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const action = searchParams.get("action") ?? ALL;
  const entity = searchParams.get("entity") ?? ALL;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const entityId = searchParams.get("entityId");
  const userId = searchParams.get("userId");

  const hasFilters = FILTER_KEYS.some((key) => searchParams.get(key));

  const update = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === ALL) params.delete(key);
      else params.set(key, value);
    }

    params.delete("page");

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={action} onValueChange={(value) => update({ action: value })}>
        <SelectTrigger className="w-40" aria-label="Filter by action">
          <SelectValue>{action === ALL ? "All actions" : AUDIT_ACTION_LABEL[action as TAuditAction]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All actions</SelectItem>
          {(Object.keys(AUDIT_ACTION_LABEL) as TAuditAction[]).map((item) => (
            <SelectItem key={item} value={item}>
              {AUDIT_ACTION_LABEL[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={entity} onValueChange={(value) => update({ entity: value })}>
        <SelectTrigger className="w-44" aria-label="Filter by entity">
          <SelectValue>{entity === ALL ? "All entities" : auditEntityLabel(entity)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All entities</SelectItem>
          {entities.map((item) => (
            <SelectItem key={item.entity} value={item.entity}>
              {auditEntityLabel(item.entity)} ({item.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        From
        <Input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => update({ from: event.target.value })}
          className="h-9 w-36"
          aria-label="From date"
        />
      </label>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        To
        <Input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => update({ to: event.target.value })}
          className="h-9 w-36"
          aria-label="To date"
        />
      </label>

      {(entityId || userId) && (
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {entityId ? `Entity ${entityId.slice(0, 8)}…` : `User ${userId?.slice(0, 8)}…`}
        </span>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={() => update(Object.fromEntries(FILTER_KEYS.map((key) => [key, null])))}
          className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" aria-hidden="true" />
          Clear filters
        </button>
      )}
    </div>
  );
}

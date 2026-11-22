import { BellOff, BellRing, CalendarClock } from "lucide-react";
import { SAVED_SEARCH_FREQUENCY_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { ISavedSearchChip, TSavedSearchAlertFrequency } from "@/types";

const FREQUENCY_ICON: Record<TSavedSearchAlertFrequency, typeof BellRing> = {
  INSTANT: BellRing,
  DAILY: CalendarClock,
  OFF: BellOff,
};

export function SavedSearchFrequencyBadge({ frequency }: { frequency: TSavedSearchAlertFrequency }) {
  const Icon = FREQUENCY_ICON[frequency];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        frequency === "OFF" ? "text-muted-foreground" : "border-primary/30 bg-primary/5 text-primary",
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {SAVED_SEARCH_FREQUENCY_LABEL[frequency]}
    </span>
  );
}

export function SavedSearchChips({ chips, max }: { chips: ISavedSearchChip[]; max?: number }) {
  const shown = max ? chips.slice(0, max) : chips;
  const hidden = chips.length - shown.length;

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Filters">
      {shown.map((chip) => (
        <li key={chip.key} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {chip.label}
        </li>
      ))}
      {hidden > 0 && <li className="px-1 py-0.5 text-xs text-muted-foreground">+{hidden} more</li>}
    </ul>
  );
}

export function NewMatchesBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
      {count} new
    </span>
  );
}

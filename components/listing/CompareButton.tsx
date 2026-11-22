"use client";

import { Check, GitCompareArrows } from "lucide-react";
import { toast } from "sonner";
import { useCompare } from "@/hooks/useCompare";
import { TCompareItem } from "@/lib/compare";
import { cn } from "@/lib/utils";

type CompareButtonProps = {
  item: TCompareItem;
  // "icon": round button over a card photo · "button": labelled button on the detail page
  variant?: "icon" | "button";
  className?: string;
};

/*
 * Adds / removes a listing from the compare list (no sign-in needed).
 */
export function CompareButton({ item, variant = "icon", className }: CompareButtonProps) {
  const { has, add, remove } = useCompare();
  const isAdded = has(item.id);

  const toggle = () => {
    if (isAdded) {
      remove(item.id);
      return;
    }

    const result = add(item);

    if (!result.ok) toast.error(result.message);
  };

  const label = isAdded ? "Remove from compare" : "Add to compare";
  const Icon = isAdded ? Check : GitCompareArrows;

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isAdded}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted",
          isAdded && "border-primary/40 text-primary",
          className,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
        {isAdded ? "Comparing" : "Compare"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isAdded}
      aria-label={label}
      title={label}
      className={cn(
        // above the card's stretched link
        "relative z-10 inline-flex size-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition hover:scale-105 motion-reduce:hover:scale-100",
        isAdded ? "bg-primary text-primary-foreground" : "bg-background/90 text-foreground",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

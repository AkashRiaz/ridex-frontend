"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/*
 * Small controls used inside the filters sidebar.
 */

export function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="border-b py-4 last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center justify-between text-left text-sm font-semibold outline-none focus-visible:underline"
          aria-expanded={isOpen}
        >
          {title}
          <ChevronDown
            className={cn("size-4 transition-transform", !isOpen && "-rotate-90")}
            aria-hidden="true"
          />
        </button>
      </h3>
      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </section>
  );
}

export function CheckboxOption({
  label,
  count,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-1 text-sm transition hover:bg-muted",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        {label}
      </span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </label>
  );
}

/*
 * Min / max inputs that apply on submit (Enter or the Apply button), not on every keystroke.
 */
export function RangeInputs({
  id,
  minValue,
  maxValue,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  unit,
  onApply,
}: {
  id: string;
  minValue: string;
  maxValue: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  unit?: string;
  onApply: (min: string, max: string) => void;
}) {
  const [min, setMin] = useState(minValue);
  const [max, setMax] = useState(maxValue);

  const isDirty = min !== minValue || max !== maxValue;

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(min.trim(), max.trim());
      }}
    >
      <div className="flex items-center gap-2">
        <Input
          id={`${id}-min`}
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={minPlaceholder}
          value={min}
          onChange={(event) => setMin(event.target.value)}
          aria-label={`Minimum${unit ? ` (${unit})` : ""}`}
        />
        <span className="text-muted-foreground" aria-hidden="true">
          –
        </span>
        <Input
          id={`${id}-max`}
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={maxPlaceholder}
          value={max}
          onChange={(event) => setMax(event.target.value)}
          aria-label={`Maximum${unit ? ` (${unit})` : ""}`}
        />
      </div>
      {isDirty && (
        <Button type="submit" size="sm" variant="outline" className="w-full">
          Apply
        </Button>
      )}
    </form>
  );
}

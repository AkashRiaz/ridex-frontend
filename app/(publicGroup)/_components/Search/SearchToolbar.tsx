"use client";

import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUrlParams } from "@/hooks/useUrlParams";
import { LISTING_CONDITION_LABEL, SEARCH_SORT_LABEL } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { ISearchFilters, TListingCondition, TSearchSort } from "@/types";
import { FiltersSidebar } from "./FiltersSidebar";

export function SortSelect() {
  const { get, update } = useUrlParams();

  const hasSearch = Boolean(get("searchTerm"));
  const hasLocation = Boolean(get("lat") && get("lng"));
  const current = (get("sortBy") || (hasSearch ? "relevance" : "newest")) as TSearchSort;

  const options = (Object.keys(SEARCH_SORT_LABEL) as TSearchSort[]).filter(
    (option) =>
      (option !== "relevance" || hasSearch) && (option !== "nearest" || hasLocation),
  );

  return (
    <Select value={current} onValueChange={(value) => value && update({ sortBy: value })}>
      <SelectTrigger className="w-48" aria-label="Sort listings">
        <SelectValue>{SEARCH_SORT_LABEL[current]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {SEARCH_SORT_LABEL[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ViewToggle() {
  const { get, update } = useUrlParams();
  const view = get("view") === "list" ? "list" : "grid";

  return (
    <div className="inline-flex rounded-lg border p-0.5" role="group" aria-label="Result layout">
      {(
        [
          ["grid", LayoutGrid, "Grid view"],
          ["list", List, "List view"],
        ] as const
      ).map(([value, Icon, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => update({ view: value === "grid" ? null : value }, { keepPage: true })}
          aria-pressed={view === value}
          aria-label={label}
          title={label}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md transition outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
            view === value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

/*
 * Removable chips for every active filter.
 */
export function ActiveFilters({ filters }: { filters: ISearchFilters }) {
  const { searchParams, update } = useUrlParams();

  const chips: { key: string; label: string; remove: () => void }[] = [];
  const attributes = filters.vehicleType?.filterableAttributes ?? [];

  const listChip = (param: string, label: (value: string) => string) => {
    const values = (searchParams.get(param) ?? "").split(",").filter(Boolean);

    for (const value of values) {
      chips.push({
        key: `${param}:${value}`,
        label: label(value),
        remove: () => update({ [param]: values.filter((item) => item !== value) }),
      });
    }
  };

  const single = (param: string, label: (value: string) => string, extra: Record<string, null> = {}) => {
    const value = searchParams.get(param);
    if (value) chips.push({ key: param, label: label(value), remove: () => update({ [param]: null, ...extra }) });
  };

  single("searchTerm", (value) => `“${value}”`);
  single("vehicleType", (value) => filters.vehicleTypes.find((type) => type.slug === value)?.name ?? value);
  listChip("brand", (value) => filters.brands.find((brand) => brand.slug === value)?.name ?? value);
  single("minPrice", (value) => `From ${formatCurrency(Number(value))}`);
  single("maxPrice", (value) => `Up to ${formatCurrency(Number(value))}`);
  single("minYear", (value) => `From ${value}`);
  single("maxYear", (value) => `Until ${value}`);
  single("maxMileage", (value) => `≤ ${Number(value).toLocaleString()} km`);
  listChip("condition", (value) => LISTING_CONDITION_LABEL[value as TListingCondition] ?? value);
  single("negotiable", () => "Negotiable");
  single("division", (value) => value, { district: null });
  single("district", (value) => value);
  single("lat", () => `Within ${searchParams.get("radius") ?? 25} km of you`, { lng: null, radius: null });

  for (const attribute of attributes) {
    const param = `spec.${attribute.key}`;
    const optionLabel = (value: string) =>
      attribute.options?.find((option) => option.value === value)?.label ?? value;

    if (attribute.type === "NUMBER") {
      const unit = attribute.unit ? ` ${attribute.unit}` : "";
      single(`${param}.min`, (value) => `${attribute.label} ≥ ${value}${unit}`);
      single(`${param}.max`, (value) => `${attribute.label} ≤ ${value}${unit}`);
    } else if (attribute.type === "BOOLEAN") {
      single(param, (value) => `${attribute.label}: ${value === "true" ? "Yes" : "No"}`);
    } else {
      listChip(param, (value) => optionLabel(value));
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm transition hover:bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={() => update({ view: searchParams.get("view") }, { removePrefix: "" })}
          className="text-sm font-medium text-primary hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

/*
 * Filters in a bottom sheet on small screens.
 */
export function MobileFilters({ filters, activeCount }: { filters: ISearchFilters; activeCount: number }) {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button type="button" variant="outline">
              <SlidersHorizontal /> Filters{activeCount > 0 && ` (${activeCount})`}
            </Button>
          }
        />
        <SheetContent side="left" className="w-[320px] overflow-y-auto p-0 sm:w-[360px]">
          <SheetHeader className="border-b px-5 py-4 text-left">
            <SheetTitle>Filter listings</SheetTitle>
          </SheetHeader>
          <div className="px-5 pb-8">
            <FiltersSidebar filters={filters} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ALL = "__all__";

type UrlFilterSelectProps = {
  // query param name, e.g. "vehicleType"
  param: string;
  label: string;
  allLabel: string;
  options: { value: string; label: string }[];
  className?: string;
};

/*
 * A filter stored in the URL (works with SearchBar + CustomPagination).
 * Changing it resets ?page.
 */
export function UrlFilterSelect({
  param,
  label,
  allLabel,
  options,
  className,
}: UrlFilterSelectProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const current = searchParams.get(param) ?? ALL;
  const currentLabel =
    current === ALL ? allLabel : (options.find((option) => option.value === current)?.label ?? current);

  const handleChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === ALL) params.delete(param);
    else params.set(param, value);

    params.delete("page");

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className={cn("w-44", className)} aria-label={label}>
        <SelectValue>{currentLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const ACTIVE_FILTER_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

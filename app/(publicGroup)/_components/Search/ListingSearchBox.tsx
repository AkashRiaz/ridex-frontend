"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/*
 * Free-text search. On /listings it keeps the other filters; elsewhere it starts a new search.
 */
export function ListingSearchBox({
  size = "md",
  keepFilters = false,
  placeholder = "Search by brand, model, area…",
}: {
  size?: "md" | "lg";
  keepFilters?: boolean;
  placeholder?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("searchTerm") ?? "");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const params = new URLSearchParams(keepFilters ? searchParams.toString() : "");
    const term = value.trim();

    if (term) params.set("searchTerm", term);
    else params.delete("searchTerm");

    params.delete("page");
    if (!term && params.get("sortBy") === "relevance") params.delete("sortBy");

    const queryString = params.toString();
    router.push(queryString ? `/listings?${queryString}` : "/listings");
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full gap-2">
      <div className="relative flex-1">
        <Search
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
            size === "lg" ? "size-5" : "size-4",
          )}
          aria-hidden="true"
        />
        <Input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label="Search listings"
          maxLength={100}
          className={cn("pl-10", size === "lg" && "h-12 text-base")}
        />
      </div>
      <Button type="submit" className={cn(size === "lg" && "h-12 px-6 text-base")}>
        Search
      </Button>
    </form>
  );
}

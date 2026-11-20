"use client";

import { useState } from "react";
import { Loader2, LocateFixed, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUrlParams } from "@/hooks/useUrlParams";
import { LISTING_CONDITION_LABEL } from "@/lib/enum";
import { cn } from "@/lib/utils";
import { ISearchFilters, IVehicleAttribute, TListingCondition } from "@/types";
import { CheckboxOption, FilterSection, RangeInputs } from "./FilterControls";

const ANY = "__any__";
const MILEAGE_OPTIONS = [5000, 10000, 20000, 30000, 50000];
const RADIUS_OPTIONS = [5, 10, 25, 50, 100];
const VISIBLE_BRANDS = 8;

/*
 * URL-driven filters. Changing a filter replaces the URL; the server page re-renders.
 */
export function FiltersSidebar({ filters }: { filters: ISearchFilters }) {
  const { get, getList, update, toggleInList, isPending } = useUrlParams();
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const selectedType = get("vehicleType");
  const selectedBrands = getList("brand");
  const selectedConditions = getList("condition");
  const division = get("division");
  const district = get("district");
  const isNear = Boolean(get("lat") && get("lng"));

  const brands = filters.brands.filter((brand) => brand.count > 0 || selectedBrands.includes(brand.slug));
  const visibleBrands = showAllBrands ? brands : brands.slice(0, VISIBLE_BRANDS);
  const districts = filters.locations.find((item) => item.division === division)?.districts ?? [];

  const years = (() => {
    const min = filters.yearRange.min ?? new Date().getFullYear() - 15;
    const max = filters.yearRange.max ?? new Date().getFullYear();
    return Array.from({ length: max - min + 1 }, (_, index) => String(max - index));
  })();

  const locateMe = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Your browser cannot share its location");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        update({
          lat: position.coords.latitude.toFixed(4),
          lng: position.coords.longitude.toFixed(4),
          radius: get("radius") || "25",
          sortBy: "nearest",
          division: null,
          district: null,
        });
      },
      () => {
        setIsLocating(false);
        toast.error("Location permission was denied");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  };

  return (
    <div className={cn("transition-opacity", isPending && "opacity-60")} aria-busy={isPending}>
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-base font-semibold">Filters</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => update({ searchTerm: get("searchTerm") || null, sortBy: null, view: get("view") || null }, { removePrefix: "" })}
        >
          <RotateCcw /> Reset
        </Button>
      </div>

      {/* Vehicle type */}
      {filters.vehicleTypes.length > 1 && (
        <FilterSection title="Vehicle type">
          <div className="flex flex-wrap gap-2">
            {filters.vehicleTypes.map((vehicleType) => {
              const isSelected = selectedType === vehicleType.slug;

              return (
                <button
                  key={vehicleType.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    update(
                      { vehicleType: isSelected ? null : vehicleType.slug, brand: null, model: null },
                      { removePrefix: "spec." },
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                    isSelected ? "border-primary bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  {vehicleType.name} <span className="text-muted-foreground">({vehicleType.count})</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Brand */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
          {visibleBrands.map((brand) => (
            <CheckboxOption
              key={brand.id}
              label={brand.name}
              count={brand.count}
              checked={selectedBrands.includes(brand.slug)}
              onChange={() => toggleInList("brand", brand.slug)}
            />
          ))}
          {brands.length > VISIBLE_BRANDS && (
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => setShowAllBrands((value) => !value)}
            >
              {showAllBrands ? "Show fewer" : `Show all ${brands.length} brands`}
            </button>
          )}
        </FilterSection>
      )}

      {/* Price */}
      <FilterSection title="Price (৳)">
        <RangeInputs
          key={`price-${get("minPrice")}-${get("maxPrice")}`}
          id="price"
          minValue={get("minPrice")}
          maxValue={get("maxPrice")}
          minPlaceholder={filters.priceRange.min ? String(filters.priceRange.min) : "Min"}
          maxPlaceholder={filters.priceRange.max ? String(filters.priceRange.max) : "Max"}
          unit="taka"
          onApply={(min, max) => update({ minPrice: min || null, maxPrice: max || null })}
        />
      </FilterSection>

      {/* Year */}
      <FilterSection title="Model year">
        <div className="grid grid-cols-2 gap-2">
          {(["minYear", "maxYear"] as const).map((key) => (
            <Select
              key={key}
              value={get(key) || ANY}
              onValueChange={(value) => update({ [key]: !value || value === ANY ? null : value })}
            >
              <SelectTrigger className="w-full" aria-label={key === "minYear" ? "From year" : "To year"}>
                <SelectValue>{get(key) || (key === "minYear" ? "From" : "To")}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </FilterSection>

      {/* Mileage */}
      <FilterSection title="Mileage">
        <Select
          value={get("maxMileage") || ANY}
          onValueChange={(value) => update({ maxMileage: !value || value === ANY ? null : value })}
        >
          <SelectTrigger className="w-full" aria-label="Maximum mileage">
            <SelectValue>
              {get("maxMileage")
                ? `Up to ${Number(get("maxMileage")).toLocaleString()} km`
                : "Any mileage"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any mileage</SelectItem>
            {MILEAGE_OPTIONS.map((mileage) => (
              <SelectItem key={mileage} value={String(mileage)}>
                Up to {mileage.toLocaleString()} km
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition">
        {(Object.keys(LISTING_CONDITION_LABEL) as TListingCondition[]).map((condition) => (
          <CheckboxOption
            key={condition}
            label={LISTING_CONDITION_LABEL[condition]}
            count={filters.conditions.find((item) => item.value === condition)?.count ?? 0}
            checked={selectedConditions.includes(condition)}
            onChange={() => toggleInList("condition", condition)}
          />
        ))}
        <CheckboxOption
          label="Price negotiable only"
          checked={get("negotiable") === "true"}
          onChange={() => update({ negotiable: get("negotiable") === "true" ? null : "true" })}
        />
      </FilterSection>

      {/* Location */}
      <FilterSection title="Location">
        {isNear ? (
          <div className="space-y-2">
            <p className="text-sm">Near your location</p>
            <Select
              value={get("radius") || "25"}
              onValueChange={(value) => update({ radius: value })}
            >
              <SelectTrigger className="w-full" aria-label="Search radius">
                <SelectValue>Within {get("radius") || "25"} km</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map((radius) => (
                  <SelectItem key={radius} value={String(radius)}>
                    Within {radius} km
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                update({
                  lat: null,
                  lng: null,
                  radius: null,
                  sortBy: get("sortBy") === "nearest" ? null : get("sortBy") || null,
                })
              }
            >
              Clear location
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Select
              value={division || ANY}
              onValueChange={(value) =>
                update({ division: !value || value === ANY ? null : value, district: null })
              }
            >
              <SelectTrigger className="w-full" aria-label="Division">
                <SelectValue>{division || "All divisions"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All divisions</SelectItem>
                {filters.locations.map((item) => (
                  <SelectItem key={item.division} value={item.division}>
                    {item.division} ({item.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {division && (
              <Select
                value={district || ANY}
                onValueChange={(value) => update({ district: !value || value === ANY ? null : value })}
              >
                <SelectTrigger className="w-full" aria-label="District">
                  <SelectValue>{district || "All districts"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>All districts</SelectItem>
                  {districts.map((item) => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name} ({item.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={locateMe}
              disabled={isLocating}
            >
              {isLocating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
              Near me
            </Button>
          </div>
        )}
      </FilterSection>

      {/* Dynamic spec filters */}
      {filters.vehicleType?.filterableAttributes.map((attribute) => (
        <SpecFilter key={attribute.key} attribute={attribute} />
      ))}

      {!filters.vehicleType && filters.vehicleTypes.length > 0 && (
        <p className="pt-4 text-xs text-muted-foreground">
          Choose a vehicle type to filter by specs like engine size and ABS.
        </p>
      )}
    </div>
  );
}

/*
 * One filter rendered from the vehicle type's attribute schema.
 */
function SpecFilter({ attribute }: { attribute: IVehicleAttribute }) {
  const { get, getList, update, toggleInList } = useUrlParams();
  const param = `spec.${attribute.key}`;

  if (attribute.type === "NUMBER") {
    return (
      <FilterSection title={attribute.unit ? `${attribute.label} (${attribute.unit})` : attribute.label}>
        <RangeInputs
          key={`${param}-${get(`${param}.min`)}-${get(`${param}.max`)}`}
          id={param}
          minValue={get(`${param}.min`)}
          maxValue={get(`${param}.max`)}
          minPlaceholder={attribute.min !== undefined ? String(attribute.min) : "Min"}
          maxPlaceholder={attribute.max !== undefined ? String(attribute.max) : "Max"}
          unit={attribute.unit}
          onApply={(min, max) => update({ [`${param}.min`]: min || null, [`${param}.max`]: max || null })}
        />
      </FilterSection>
    );
  }

  if (attribute.type === "BOOLEAN") {
    return (
      <FilterSection title={attribute.label} defaultOpen={false}>
        <div className="space-y-2">
          <Label className="sr-only">{attribute.label}</Label>
          <Select
            value={get(param) || ANY}
            onValueChange={(value) => update({ [param]: !value || value === ANY ? null : value })}
          >
            <SelectTrigger className="w-full" aria-label={attribute.label}>
              <SelectValue>{get(param) === "true" ? "Yes" : get(param) === "false" ? "No" : "Any"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterSection>
    );
  }

  const selected = getList(param);

  return (
    <FilterSection title={attribute.label} defaultOpen={selected.length > 0 || attribute.type === "SELECT"}>
      {attribute.options?.map((option) => (
        <CheckboxOption
          key={option.value}
          label={option.label}
          checked={selected.includes(option.value)}
          onChange={() => toggleInList(param, option.value)}
        />
      ))}
      {attribute.type === "MULTI_SELECT" && (
        <p className="text-xs text-muted-foreground">Listings must have every selected feature.</p>
      )}
    </FilterSection>
  );
}

"use client";

import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { IVehicleAttribute } from "@/types";

export type TSpecFormValues = Record<string, string | string[]>;

type DynamicSpecFieldsProps = {
  attributes: IVehicleAttribute[];
  values: TSpecFormValues;
  onChange: (key: string, value: string | string[]) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  // model default specs: nothing is required
  partial?: boolean;
  idPrefix?: string;
};

const NOT_SET = "__not_set__";

/*
 * Renders form inputs from a vehicle type's attribute schema, grouped by `group`.
 * Values are strings (numbers/booleans) or string[] (multi-select);
 * validate them with validateSpecValues() before submitting.
 */
export function DynamicSpecFields({
  attributes,
  values,
  onChange,
  errors = {},
  disabled = false,
  partial = false,
  idPrefix = "spec",
}: DynamicSpecFieldsProps) {
  if (attributes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        This vehicle type has no spec attributes yet.
      </p>
    );
  }

  const groups = attributes
    .slice()
    .sort((first, second) => first.sortOrder - second.sortOrder)
    .reduce<Record<string, IVehicleAttribute[]>>((acc, attribute) => {
      const group = attribute.group || "General";
      acc[group] = [...(acc[group] ?? []), attribute];
      return acc;
    }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([group, groupAttributes]) => (
        <fieldset key={group} className="space-y-4">
          <legend className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {group}
          </legend>

          <div className="grid gap-4 md:grid-cols-2">
            {groupAttributes.map((attribute) => {
              const id = `${idPrefix}-${attribute.key}`;
              const error = errors[attribute.key];
              const value = values[attribute.key];
              const isRequired = attribute.required && !partial;

              return (
                <div
                  key={attribute.key}
                  className={cn(
                    "space-y-2",
                    attribute.type === "MULTI_SELECT" && "md:col-span-2",
                  )}
                >
                  <Label htmlFor={attribute.type === "MULTI_SELECT" ? undefined : id}>
                    {attribute.label}
                    {attribute.unit && (
                      <span className="text-muted-foreground"> ({attribute.unit})</span>
                    )}
                    {isRequired && <span className="text-destructive"> *</span>}
                  </Label>

                  {attribute.type === "NUMBER" && (
                    <Input
                      id={id}
                      type="number"
                      inputMode="decimal"
                      min={attribute.min}
                      max={attribute.max}
                      step={attribute.step ?? "any"}
                      placeholder={attribute.placeholder}
                      value={typeof value === "string" ? value : ""}
                      onChange={(event) => onChange(attribute.key, event.target.value)}
                      disabled={disabled}
                      aria-invalid={Boolean(error)}
                    />
                  )}

                  {attribute.type === "TEXT" && (
                    <Input
                      id={id}
                      placeholder={attribute.placeholder}
                      value={typeof value === "string" ? value : ""}
                      onChange={(event) => onChange(attribute.key, event.target.value)}
                      maxLength={200}
                      disabled={disabled}
                      aria-invalid={Boolean(error)}
                    />
                  )}

                  {(attribute.type === "SELECT" || attribute.type === "BOOLEAN") && (
                    <Select
                      value={typeof value === "string" && value !== "" ? value : NOT_SET}
                      onValueChange={(selected) =>
                        onChange(attribute.key, !selected || selected === NOT_SET ? "" : selected)
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger
                        id={id}
                        className="w-full"
                        aria-invalid={Boolean(error)}
                      >
                        <SelectValue>
                          {(() => {
                            if (typeof value !== "string" || value === "") return "Not set";
                            if (attribute.type === "BOOLEAN") return value === "true" ? "Yes" : "No";
                            return (
                              attribute.options?.find((option) => option.value === value)?.label ??
                              value
                            );
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NOT_SET}>Not set</SelectItem>
                        {attribute.type === "BOOLEAN" ? (
                          <>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </>
                        ) : (
                          attribute.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}

                  {attribute.type === "MULTI_SELECT" && (
                    <div className="flex flex-wrap gap-2" role="group" aria-label={attribute.label}>
                      {attribute.options?.map((option) => {
                        const selectedValues = Array.isArray(value) ? value : [];
                        const isSelected = selectedValues.includes(option.value);

                        return (
                          <button
                            key={option.value}
                            type="button"
                            disabled={disabled}
                            aria-pressed={isSelected}
                            onClick={() =>
                              onChange(
                                attribute.key,
                                isSelected
                                  ? selectedValues.filter((item) => item !== option.value)
                                  : [...selectedValues, option.value],
                              )
                            }
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                              "focus-visible:ring-3 focus-visible:ring-ring/40 outline-none disabled:opacity-50",
                              isSelected
                                ? "border-primary bg-primary/10 text-foreground"
                                : "text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {isSelected && <Check className="size-3.5" aria-hidden="true" />}
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {attribute.helpText && !error && (
                    <p className="text-xs text-muted-foreground">{attribute.helpText}</p>
                  )}
                  {error && (
                    <p role="alert" className="text-xs text-destructive">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Copy, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvailabilityInput, AvailabilityZodSchema } from "@/components/validations/test-ride.validation";
import { DAY_NAMES, TEST_RIDE_LIMITS } from "@/lib/enum";
import { IMyAvailability } from "@/types";
import { saveAvailabilityAction } from "../../_actions/testRideActions";

// the marketplace week starts on Saturday (Bangladesh: Friday is the weekend)
const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];

const DEFAULT_SCOPE = "__default__";

type TRule = AvailabilityInput["rules"][number];

const newRule = (listingId: string | null, dayOfWeek: number): TRule => ({
  listingId,
  dayOfWeek,
  startTime: "10:00",
  endTime: "18:00",
  slotMinutes: 30,
  capacity: 1,
});

/*
 * Weekly hours. "All my listings" is the default; picking a listing edits
 * hours that replace the default for that listing only. Saves the whole week.
 */
export function AvailabilityEditor({
  availability,
  listingOptions,
}: {
  availability: IMyAvailability;
  listingOptions: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [scope, setScope] = useState<string>(DEFAULT_SCOPE);
  const scopeListingId = scope === DEFAULT_SCOPE ? null : scope;

  const form = useForm({
    defaultValues: {
      rules: availability.rules.map((rule) => ({
        listingId: rule.listingId,
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        slotMinutes: rule.slotMinutes,
        capacity: rule.capacity,
      })),
    } as AvailabilityInput,
    validators: { onSubmit: AvailabilityZodSchema },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const result = await saveAvailabilityAction(value.rules);

        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      });
    },
    onSubmitInvalid: () => toast.error("Please fix the highlighted time ranges"),
  });

  const listingsWithOwnHours = new Set(
    form.state.values.rules.map((rule) => rule.listingId).filter((id): id is string => Boolean(id)),
  );

  const scopeLabel =
    scope === DEFAULT_SCOPE
      ? "All my listings (default)"
      : (listingOptions.find((option) => option.value === scope)?.label ?? "Listing");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5"
      noValidate
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Hours for</p>
          <Select value={scope} onValueChange={(value) => setScope(value ?? DEFAULT_SCOPE)}>
            <SelectTrigger className="w-full sm:w-80" aria-label="Which listings these hours apply to">
              <SelectValue>{scopeLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_SCOPE}>All my listings (default)</SelectItem>
              {listingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                  {listingsWithOwnHours.has(option.value) ? " · own hours" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground sm:max-w-xs sm:text-right">
          Times are in {availability.timezone.replace("_", " ")}. Buyers can book up to {availability.bookingDays} days
          ahead, at least {availability.minLeadHours}h in advance.
        </p>
      </div>

      <form.Field name="rules" mode="array">
        {(rulesField) => {
          const rules = rulesField.state.value;
          const inScope = rules
            .map((rule, index) => ({ rule, index }))
            .filter(({ rule }) => (rule.listingId ?? null) === scopeListingId);

          const copyToAllDays = (dayOfWeek: number) => {
            const source = inScope.filter(({ rule }) => rule.dayOfWeek === dayOfWeek).map(({ rule }) => rule);
            const kept = rules.filter((rule) => (rule.listingId ?? null) !== scopeListingId || rule.dayOfWeek === dayOfWeek);
            const copies = WEEK_ORDER.filter((day) => day !== dayOfWeek).flatMap((day) =>
              source.map((rule) => ({ ...rule, dayOfWeek: day })),
            );

            if (kept.length + copies.length > TEST_RIDE_LIMITS.maxRules) {
              toast.error(`You can set at most ${TEST_RIDE_LIMITS.maxRules} time ranges`);
              return;
            }

            rulesField.handleChange([...kept, ...copies]);
          };

          return (
            <div className="space-y-2">
              {scopeListingId && inScope.length === 0 && (
                <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                  This listing uses your default hours. Add a range to give it its own hours.
                </p>
              )}

              <ul className="divide-y rounded-xl border">
                {WEEK_ORDER.map((dayOfWeek) => {
                  const dayRules = inScope.filter(({ rule }) => rule.dayOfWeek === dayOfWeek);

                  return (
                    <li key={dayOfWeek} className="grid gap-3 p-3 sm:grid-cols-[7rem_1fr] sm:items-start">
                      <div className="flex items-center justify-between gap-2 sm:block">
                        <p className="text-sm font-semibold">{DAY_NAMES[dayOfWeek]}</p>
                        <p className="text-xs text-muted-foreground">{dayRules.length ? "" : "Closed"}</p>
                      </div>

                      <div className="space-y-2">
                        {dayRules.map(({ index }) => (
                          <div key={index} className="flex flex-wrap items-start gap-2">
                            <form.Field name={`rules[${index}].startTime`}>
                              {(field) => (
                                <div className="space-y-1">
                                  <Input
                                    type="time"
                                    step={900}
                                    value={field.state.value}
                                    onChange={(event) => field.handleChange(event.target.value)}
                                    onBlur={field.handleBlur}
                                    aria-label={`${DAY_NAMES[dayOfWeek]} start time`}
                                    aria-invalid={!field.state.meta.isValid}
                                    className="w-28"
                                  />
                                  <FieldErrorText errors={field.state.meta.errors} />
                                </div>
                              )}
                            </form.Field>
                            <span className="pt-2 text-sm text-muted-foreground" aria-hidden="true">
                              to
                            </span>
                            <form.Field name={`rules[${index}].endTime`}>
                              {(field) => (
                                <div className="space-y-1">
                                  <Input
                                    type="time"
                                    step={900}
                                    value={field.state.value}
                                    onChange={(event) => field.handleChange(event.target.value)}
                                    onBlur={field.handleBlur}
                                    aria-label={`${DAY_NAMES[dayOfWeek]} end time`}
                                    aria-invalid={!field.state.meta.isValid}
                                    className="w-28"
                                  />
                                  <FieldErrorText errors={field.state.meta.errors} />
                                </div>
                              )}
                            </form.Field>
                            <form.Field name={`rules[${index}].slotMinutes`}>
                              {(field) => (
                                <Select
                                  value={String(field.state.value)}
                                  onValueChange={(value) => field.handleChange(Number(value))}
                                >
                                  <SelectTrigger className="w-32" aria-label={`${DAY_NAMES[dayOfWeek]} slot length`}>
                                    <SelectValue>{field.state.value} min slots</SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availability.slotMinuteOptions.map((minutes) => (
                                      <SelectItem key={minutes} value={String(minutes)}>
                                        {minutes} min slots
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </form.Field>
                            <form.Field name={`rules[${index}].capacity`}>
                              {(field) => (
                                <div className="space-y-1">
                                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Input
                                      type="number"
                                      min={1}
                                      max={TEST_RIDE_LIMITS.maxCapacity}
                                      value={Number.isFinite(field.state.value) ? field.state.value : ""}
                                      onChange={(event) => field.handleChange(event.target.valueAsNumber)}
                                      onBlur={field.handleBlur}
                                      aria-invalid={!field.state.meta.isValid}
                                      className="w-16"
                                    />
                                    at once
                                  </label>
                                  <FieldErrorText errors={field.state.meta.errors} />
                                </div>
                              )}
                            </form.Field>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => rulesField.removeValue(index)}
                              aria-label={`Remove this ${DAY_NAMES[dayOfWeek]} range`}
                              title="Remove"
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </div>
                        ))}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (rules.length >= TEST_RIDE_LIMITS.maxRules) {
                                toast.error(`You can set at most ${TEST_RIDE_LIMITS.maxRules} time ranges`);
                                return;
                              }
                              rulesField.pushValue(newRule(scopeListingId, dayOfWeek));
                            }}
                          >
                            <Plus aria-hidden="true" /> Add hours
                          </Button>
                          {dayRules.length > 0 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => copyToAllDays(dayOfWeek)}>
                              <Copy aria-hidden="true" /> Copy to all days
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <FieldErrorText errors={rulesField.state.meta.errors} />
            </div>
          );
        }}
      </form.Field>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Existing bookings are kept when you change your hours.
        </p>
        <form.Subscribe selector={(state) => [state.isSubmitting]}>
          {([isSubmitting]) => (
            <Button type="submit" disabled={isSubmitting || isPending}>
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
              Save hours
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

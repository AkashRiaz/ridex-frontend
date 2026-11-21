"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { CalendarClock, CalendarX2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { BookTestRideInput, BookTestRideZodSchema } from "@/components/validations/test-ride.validation";
import { bookTestRideAction, getTestRideSlotsAction } from "@/app/(dashboardGroup)/_actions/testRideActions";
import { TEST_RIDE_LIMITS } from "@/lib/enum";
import { formatRideDateTime, formatRideDay, formatRideTime } from "@/lib/formatRideTime";
import { cn } from "@/lib/utils";
import { ITestRide, ITestRideSlots } from "@/types";

type BookTestRideDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  onDone?: (testRide: ITestRide) => void;
};

/*
 * Day chips + time grid from GET /test-rides/slots, then a note.
 * Slots are fetched every time the dialog opens (they change as people book).
 */
export function BookTestRideDialog({ open, onOpenChange, listingId, listingTitle, onDone }: BookTestRideDialogProps) {
  const [slots, setSlots] = useState<ITestRideSlots | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // state is only set when the request finishes (never synchronously in the effect)
  const fetchSlots = useCallback(
    () =>
      getTestRideSlotsAction(listingId).then((result) => {
        if (result.success && result.data) {
          const fresh = result.data;
          setLoadError(null);
          setSlots(fresh);
          setDay((current) =>
            current && fresh.days.some((item) => item.date === current) ? current : (fresh.days[0]?.date ?? null),
          );
        } else {
          setLoadError(result.message);
        }
      }),
    [listingId],
  );

  useEffect(() => {
    if (open) fetchSlots();
  }, [open, fetchSlots]);

  // retry / slot taken: show the skeleton while fresh times load
  const load = () => {
    setSlots(null);
    setLoadError(null);
    fetchSlots();
  };

  // closing forgets the slots, so the next open never shows stale times
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSlots(null);
      setLoadError(null);
    }
    onOpenChange(next);
  };

  const form = useForm({
    defaultValues: { startsAt: "", note: "" } as BookTestRideInput,
    validators: { onSubmit: BookTestRideZodSchema },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const result = await bookTestRideAction({
          listingId,
          startsAt: value.startsAt,
          ...(value.note.trim() && { note: value.note.trim() }),
        });

        if (result.success && result.data) {
          toast.success(`${result.message} for ${formatRideDateTime(result.data.startsAt)}`);
          handleOpenChange(false);
          form.reset();
          onDone?.(result.data);
        } else {
          toast.error(result.message);
          // the slot may have just been taken: show fresh times
          if (result.statusCode === 409) {
            form.setFieldValue("startsAt", "");
            load();
          }
        }
      });
    },
  });

  const selectedDay = slots?.days.find((item) => item.date === day) ?? null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-5 text-primary" aria-hidden="true" /> Book a test ride
          </DialogTitle>
          <DialogDescription className="line-clamp-2">{listingTitle}</DialogDescription>
        </DialogHeader>

        {loadError ? (
          <div className="rounded-xl border border-destructive/20 p-6 text-center text-sm">
            <p className="text-destructive">{loadError}</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={load}>
              Try again
            </Button>
          </div>
        ) : !slots ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading times">
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-16 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-9 rounded-lg" />
              ))}
            </div>
          </div>
        ) : slots.days.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <CalendarX2 className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium">
              {slots.hasAvailability ? "No free times in the next two weeks" : "The seller has not set test ride hours yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Ask the seller in chat for a time that works.</p>
          </div>
        ) : (
          <form
            id="test-ride-form"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
            noValidate
          >
            <form.Field name="startsAt">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-medium">Pick a day and time</legend>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin" role="radiogroup" aria-label="Day">
                      {slots.days.map((item) => {
                        const label = formatRideDay(item.date);
                        const active = item.date === day;

                        return (
                          <button
                            key={item.date}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => {
                              setDay(item.date);
                              field.handleChange("");
                            }}
                            className={cn(
                              "flex w-16 shrink-0 flex-col items-center rounded-xl border px-2 py-2 text-xs transition hover:border-primary",
                              active && "border-primary bg-primary text-primary-foreground hover:border-primary",
                            )}
                          >
                            <span className="font-semibold">{label.weekday}</span>
                            <span className={cn("mt-0.5", !active && "text-muted-foreground")}>{label.day}</span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedDay && (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Time">
                        {selectedDay.slots.map((slot) => {
                          const active = field.state.value === slot.startsAt;

                          return (
                            <button
                              key={slot.startsAt}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => {
                                field.handleChange(slot.startsAt);
                                field.handleBlur();
                              }}
                              className={cn(
                                "rounded-lg border px-2 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/5",
                                active && "border-primary bg-primary/10 text-primary",
                              )}
                            >
                              {formatRideTime(slot.startsAt)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Times are in {slots.timezone.replace("_", " ")} time.</p>
                    <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  </fieldset>
                );
              }}
            </form.Field>

            <form.Field name="note">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2">
                    <Label htmlFor="test-ride-note">Note for the seller (optional)</Label>
                    <Textarea
                      id="test-ride-note"
                      rows={2}
                      maxLength={TEST_RIDE_LIMITS.noteMax}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="e.g. I'd like to check the brakes and the gearbox"
                      aria-invalid={isInvalid}
                    />
                    <p className="text-xs text-muted-foreground">
                      The seller confirms the request. Bring your driving licence and meet in a safe public place.
                    </p>
                    <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                  </div>
                );
              }}
            </form.Field>
          </form>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          {slots && slots.days.length > 0 && (
            <form.Subscribe selector={(state) => [state.values.startsAt, state.isSubmitting] as const}>
              {([startsAt, isSubmitting]) => (
                <Button type="submit" form="test-ride-form" disabled={!startsAt || isSubmitting || isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  Request test ride
                </Button>
              )}
            </form.Subscribe>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

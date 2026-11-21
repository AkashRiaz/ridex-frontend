"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { CalendarOff, Loader2, Plus, X } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldErrorText } from "@/components/ui/FieldErrorText";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlockedDateInput, BlockedDateZodSchema } from "@/components/validations/test-ride.validation";
import { TEST_RIDE_LIMITS } from "@/lib/enum";
import { formatRideDay } from "@/lib/formatRideTime";
import { siteConfig } from "@/lib/siteConfig";
import { IBlockedDate } from "@/types";
import { addBlockedDateAction, removeBlockedDateAction } from "../../_actions/testRideActions";

// today in the marketplace zone, "YYYY-MM-DD"
const todayKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: siteConfig.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/*
 * Days off (holidays, workshop days). Bookings already on a blocked day stay
 * active; the toast says how many so the seller can handle them.
 */
export function BlockedDates({ blockedDates }: { blockedDates: IBlockedDate[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: { date: "", reason: "" } as BlockedDateInput,
    validators: { onSubmit: BlockedDateZodSchema },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const result = await addBlockedDateAction({
          date: value.date,
          ...(value.reason.trim() && { reason: value.reason.trim() }),
        });

        if (result.success) {
          toast.success(result.message);
          form.reset();
          router.refresh();
        } else {
          toast.error(result.message);
        }
      });
    },
  });

  const remove = async (blocked: IBlockedDate) => {
    const { weekday, day } = formatRideDay(blocked.date);
    const confirmation = await Swal.fire({
      title: "Open this day again?",
      text: `${weekday}, ${day} becomes bookable inside your usual hours.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Unblock",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      const result = await removeBlockedDateAction(blocked.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5" aria-labelledby="blocked-dates-heading">
      <div>
        <h2 id="blocked-dates-heading" className="font-semibold">
          Days off
        </h2>
        <p className="text-sm text-muted-foreground">No test rides on these days.</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-3"
        noValidate
      >
        <form.Field name="date">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <div className="space-y-1.5">
                <Label htmlFor="blocked-date">Date</Label>
                <Input
                  id="blocked-date"
                  type="date"
                  min={todayKey()}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                />
                <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
              </div>
            );
          }}
        </form.Field>
        <form.Field name="reason">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="blocked-reason">Reason (only you see it)</Label>
              <Input
                id="blocked-reason"
                maxLength={TEST_RIDE_LIMITS.noteMax}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                placeholder="e.g. Victory Day"
              />
            </div>
          )}
        </form.Field>
        <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
          Block date
        </Button>
      </form>

      {blockedDates.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <CalendarOff className="size-4" aria-hidden="true" /> No days off planned.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {blockedDates.map((blocked) => {
            const { weekday, day } = formatRideDay(blocked.date);

            return (
              <li key={blocked.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {weekday}, {day}
                  </p>
                  {blocked.reason && <p className="truncate text-xs text-muted-foreground">{blocked.reason}</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(blocked)}
                  disabled={isPending}
                  aria-label={`Unblock ${weekday}, ${day}`}
                  title="Unblock"
                >
                  <X aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

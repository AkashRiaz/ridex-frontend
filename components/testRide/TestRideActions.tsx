"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, CheckCircle2, Loader2, UserX, X } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { TestRideNoteZodSchema, TestRideReasonZodSchema } from "@/components/validations/test-ride.validation";
import {
  cancelTestRideAction,
  completeTestRideAction,
  confirmTestRideAction,
  declineTestRideAction,
  markTestRideNoShowAction,
} from "@/app/(dashboardGroup)/_actions/testRideActions";
import { TEST_RIDE_LIMITS } from "@/lib/enum";
import { formatRideDateTime } from "@/lib/formatRideTime";
import { ITestRideCard, TTestRideAction } from "@/types";

/*
 * Mirrors backend evaluateTestRideAction:
 *   seller → confirm / decline a request before it starts,
 *            complete / no-show a confirmed ride once it started
 *   either → cancel a requested or confirmed ride before it starts
 */
export const getTestRideActions = (
  ride: Pick<ITestRideCard, "status" | "startsAt">,
  side: "buyer" | "seller",
  now = Date.now(),
): TTestRideAction[] => {
  const started = new Date(ride.startsAt).getTime() <= now;
  const actions: TTestRideAction[] = [];

  if (side === "seller" && ride.status === "REQUESTED" && !started) actions.push("confirm");
  if (side === "seller" && ride.status === "REQUESTED") actions.push("decline");
  if ((ride.status === "REQUESTED" || ride.status === "CONFIRMED") && !started) actions.push("cancel");
  if (side === "seller" && ride.status === "CONFIRMED" && started) actions.push("complete", "noShow");

  return actions;
};

type TDialog = "confirm" | "decline" | "cancel" | null;

// ReasonDialog validates a single { text } field
const noteTextSchema = z.object({ text: TestRideNoteZodSchema.shape.note });
const reasonTextSchema = z.object({ text: TestRideReasonZodSchema.shape.reason });

export function TestRideActions({
  ride,
  actions,
  size = "sm",
  refreshOnChange = false,
}: {
  ride: Pick<ITestRideCard, "id" | "startsAt">;
  actions: TTestRideAction[];
  size?: "sm" | "default";
  // chat cards update live from the socket; tables refresh the page
  refreshOnChange?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<TDialog>(null);

  if (actions.length === 0) return null;

  const when = formatRideDateTime(ride.startsAt);

  const done = (result: { success: boolean; message: string }) => {
    if (result.success) {
      toast.success(result.message);
      if (refreshOnChange) router.refresh();
    } else {
      toast.error(result.message);
    }
    return result.success;
  };

  const markOutcome = async (outcome: "complete" | "noShow") => {
    const confirmation = await Swal.fire({
      title: outcome === "complete" ? "Mark as completed?" : "Mark as a no-show?",
      text: `Test ride on ${when}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: outcome === "complete" ? "Completed" : "No-show",
      cancelButtonText: "Back",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      done(outcome === "complete" ? await completeTestRideAction(ride.id) : await markTestRideNoShowAction(ride.id));
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.includes("confirm") && (
        <Button type="button" size={size} onClick={() => setDialog("confirm")} disabled={isPending}>
          <Check aria-hidden="true" /> Confirm
        </Button>
      )}
      {actions.includes("decline") && (
        <Button type="button" size={size} variant="ghost" onClick={() => setDialog("decline")} disabled={isPending}>
          <X aria-hidden="true" /> Decline
        </Button>
      )}
      {actions.includes("complete") && (
        <Button type="button" size={size} onClick={() => markOutcome("complete")} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
          Completed
        </Button>
      )}
      {actions.includes("noShow") && (
        <Button type="button" size={size} variant="outline" onClick={() => markOutcome("noShow")} disabled={isPending}>
          <UserX aria-hidden="true" /> No-show
        </Button>
      )}
      {actions.includes("cancel") && (
        <Button type="button" size={size} variant="ghost" onClick={() => setDialog("cancel")} disabled={isPending}>
          <Ban aria-hidden="true" /> Cancel
        </Button>
      )}

      <ReasonDialog
        open={dialog === "confirm"}
        onOpenChange={(open) => setDialog(open ? "confirm" : null)}
        title="Confirm the test ride"
        description={when}
        label="Where to meet (optional)"
        placeholder="e.g. Meet at the Mirpur 10 petrol pump. Bring your licence."
        confirmLabel="Confirm"
        maxLength={TEST_RIDE_LIMITS.noteMax}
        schema={noteTextSchema}
        onConfirm={async (text) => done(await confirmTestRideAction(ride.id, text || undefined))}
      />
      <ReasonDialog
        open={dialog === "decline"}
        onOpenChange={(open) => setDialog(open ? "decline" : null)}
        title="Decline the request?"
        description={when}
        label="Reason"
        placeholder="e.g. The bike is at the workshop that day"
        confirmLabel="Decline"
        destructive
        maxLength={TEST_RIDE_LIMITS.noteMax}
        schema={reasonTextSchema}
        onConfirm={async (text) => done(await declineTestRideAction(ride.id, text))}
      />
      <ReasonDialog
        open={dialog === "cancel"}
        onOpenChange={(open) => setDialog(open ? "cancel" : null)}
        title="Cancel the test ride?"
        description={`${when}. The time becomes free for other buyers.`}
        label="Reason"
        placeholder="e.g. Something came up"
        confirmLabel="Cancel test ride"
        destructive
        maxLength={TEST_RIDE_LIMITS.noteMax}
        schema={reasonTextSchema}
        onConfirm={async (text) => done(await cancelTestRideAction(ride.id, text))}
      />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Repeat, Undo2, X } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { acceptOfferAction, declineOfferAction, withdrawOfferAction } from "@/app/(dashboardGroup)/_actions/offerActions";
import { OFFER_LIMITS } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { IOfferCard, TOfferAction } from "@/types";
import { OfferDialog } from "./OfferDialog";

/*
 * Who may do what with an offer (mirrors backend evaluateOfferAction):
 * the recipient accepts, declines or counters a PENDING offer before it
 * expires; the proposer can withdraw it.
 */
export const getOfferActions = (offer: IOfferCard, meId: string, now = Date.now()): TOfferAction[] => {
  if (offer.status !== "PENDING") return [];
  if (offer.proposedById === meId) return ["withdraw"];
  if (new Date(offer.expiresAt).getTime() <= now) return [];
  return ["accept", "counter", "decline"];
};

type OfferActionsProps = {
  offer: IOfferCard;
  actions: TOfferAction[];
  side: "buyer" | "seller";
  listingTitle: string;
  listingPrice: number;
  size?: "sm" | "default";
  // chat cards update live from the socket; tables refresh the page
  refreshOnChange?: boolean;
};

export function OfferActions({
  offer,
  actions,
  side,
  listingTitle,
  listingPrice,
  size = "sm",
  refreshOnChange = false,
}: OfferActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [counterOpen, setCounterOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);

  if (actions.length === 0) return null;

  const done = (result: { success: boolean; message: string }) => {
    if (result.success) {
      toast.success(result.message);
      if (refreshOnChange) router.refresh();
    } else {
      toast.error(result.message);
    }
    return result.success;
  };

  const accept = async () => {
    const confirmation = await Swal.fire({
      title: `Accept ${formatCurrency(offer.amount)}?`,
      text: "The other side is told right away. Arrange payment and handover in the chat.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, accept",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      done(await acceptOfferAction(offer.id));
    });
  };

  const withdraw = async () => {
    const confirmation = await Swal.fire({
      title: "Withdraw your offer?",
      text: `Your offer of ${formatCurrency(offer.amount)} will be closed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Withdraw",
      cancelButtonText: "Keep it",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    startTransition(async () => {
      done(await withdrawOfferAction(offer.id));
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.includes("accept") && (
        <Button type="button" size={size} onClick={accept} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
          Accept
        </Button>
      )}
      {actions.includes("counter") && (
        <Button type="button" size={size} variant="outline" onClick={() => setCounterOpen(true)} disabled={isPending}>
          <Repeat aria-hidden="true" /> Counter
        </Button>
      )}
      {actions.includes("decline") && (
        <Button type="button" size={size} variant="ghost" onClick={() => setDeclineOpen(true)} disabled={isPending}>
          <X aria-hidden="true" /> Decline
        </Button>
      )}
      {actions.includes("withdraw") && (
        <Button type="button" size={size} variant="ghost" onClick={withdraw} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Undo2 aria-hidden="true" />}
          Withdraw
        </Button>
      )}

      {actions.includes("counter") && (
        <OfferDialog
          open={counterOpen}
          onOpenChange={setCounterOpen}
          mode={{ kind: "counter", offerId: offer.id, counteredAmount: offer.amount, side }}
          listingTitle={listingTitle}
          listingPrice={listingPrice}
          onDone={() => refreshOnChange && router.refresh()}
        />
      )}

      {actions.includes("decline") && (
        <ReasonDialog
          open={declineOpen}
          onOpenChange={setDeclineOpen}
          title={`Decline ${formatCurrency(offer.amount)}?`}
          description="A short reason helps the other side make a better offer."
          label="Reason (optional)"
          placeholder="e.g. Too low for a 2023 model"
          confirmLabel="Decline offer"
          destructive
          maxLength={OFFER_LIMITS.reasonMax}
          schema={z.object({ text: z.string().trim().max(OFFER_LIMITS.reasonMax, "The reason is too long") })}
          onConfirm={async (text) => done(await declineOfferAction(offer.id, text || undefined))}
        />
      )}
    </div>
  );
}

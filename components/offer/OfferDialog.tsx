"use client";

import { useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { HandCoins, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OfferInput, buildOfferZodSchema } from "@/components/validations/offer.validation";
import { counterOfferAction, makeOfferAction } from "@/app/(dashboardGroup)/_actions/offerActions";
import { OFFER_LIMITS } from "@/lib/enum";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { IOffer } from "@/types";

export type TOfferDialogMode =
  | { kind: "make"; listingId: string }
  | {
      kind: "counter";
      offerId: string;
      counteredAmount: number;
      // who is countering: the seller goes up from the buyer's offer, the buyer comes down from the seller's
      side: "buyer" | "seller";
    };

type OfferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TOfferDialogMode;
  listingTitle: string;
  listingPrice: number;
  onDone?: (offer: IOffer) => void;
};

// round to the nearest 500 so suggestions look like real prices
const roundPrice = (value: number) => Math.max(500, Math.round(value / 500) * 500);

/*
 * Make an offer (from the listing page or the chat) or counter one (from a card).
 * The server checks the exact window; the form shows what it already knows.
 */
export function OfferDialog({ open, onOpenChange, mode, listingTitle, listingPrice, onDone }: OfferDialogProps) {
  const [isPending, startTransition] = useTransition();

  const bounds =
    mode.kind === "make"
      ? { max: listingPrice }
      : mode.side === "seller"
        ? { min: mode.counteredAmount + 1, max: listingPrice }
        : { max: mode.counteredAmount - 1 };

  const suggestions =
    mode.kind === "make"
      ? [0.95, 0.9, 0.85].map((share) => ({ label: `${Math.round((1 - share) * 100)}% off`, value: roundPrice(listingPrice * share) }))
      : [
          {
            label: "Meet halfway",
            value: roundPrice(
              (mode.counteredAmount + (mode.side === "seller" ? listingPrice : mode.counteredAmount * 0.9)) / 2,
            ),
          },
        ];

  const form = useForm({
    defaultValues: {
      amount: mode.kind === "make" ? roundPrice(listingPrice * 0.95) : (suggestions[0]?.value ?? 0),
      message: "",
    } as OfferInput,
    validators: { onSubmit: buildOfferZodSchema(bounds) },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const payload = { amount: value.amount, ...(value.message.trim() && { message: value.message.trim() }) };
        const result =
          mode.kind === "make"
            ? await makeOfferAction({ listingId: mode.listingId, ...payload })
            : await counterOfferAction(mode.offerId, payload);

        if (result.success && result.data) {
          toast.success(result.message);
          onOpenChange(false);
          form.reset();
          onDone?.(result.data);
        } else {
          toast.error(result.message);
        }
      });
    },
  });

  const title = mode.kind === "make" ? "Make an offer" : "Send a counter offer";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="size-5 text-primary" aria-hidden="true" /> {title}
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            {listingTitle} · asking {formatCurrency(listingPrice)}
            {mode.kind === "counter" && <> · their offer {formatCurrency(mode.counteredAmount)}</>}
          </DialogDescription>
        </DialogHeader>

        <form
          id="offer-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
          noValidate
        >
          <form.Field name="amount">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label htmlFor="offer-amount">Your price</Label>
                  <Input
                    id="offer-amount"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={500}
                    value={Number.isFinite(field.state.value) && field.state.value > 0 ? field.state.value : ""}
                    onChange={(event) => field.handleChange(event.target.valueAsNumber)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    aria-describedby="offer-amount-hint"
                    className="h-11 text-lg font-semibold"
                  />
                  <div className="flex flex-wrap gap-2" aria-label="Suggested amounts">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.label}
                        type="button"
                        onClick={() => {
                          field.handleChange(suggestion.value);
                          field.handleBlur();
                        }}
                        aria-pressed={field.state.value === suggestion.value}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition hover:border-primary hover:bg-primary/5",
                          field.state.value === suggestion.value && "border-primary bg-primary/10 text-primary",
                        )}
                      >
                        {suggestion.label} · {formatCurrency(suggestion.value)}
                      </button>
                    ))}
                  </div>
                  <p id="offer-amount-hint" className="text-xs text-muted-foreground">
                    {mode.kind === "make"
                      ? "The seller can accept, decline or counter. Offers expire after 48 hours."
                      : mode.side === "seller"
                        ? `Above ${formatCurrency(mode.counteredAmount)} and at most ${formatCurrency(listingPrice)}.`
                        : `Below ${formatCurrency(mode.counteredAmount)} and above your last offer.`}
                  </p>
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.Field>

          <form.Field name="message">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-2">
                  <Label htmlFor="offer-message">Note (optional)</Label>
                  <Textarea
                    id="offer-message"
                    rows={2}
                    maxLength={OFFER_LIMITS.messageMax}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={mode.kind === "make" ? "e.g. I can pay cash this weekend" : "e.g. Includes a free first service"}
                    aria-invalid={isInvalid}
                  />
                  <FieldErrorText show={isInvalid} errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" form="offer-form" disabled={!canSubmit || isSubmitting || isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {mode.kind === "make" ? "Send offer" : "Send counter"}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

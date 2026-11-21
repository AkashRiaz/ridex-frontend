import z from "zod";
import { formatCurrency } from "@/lib/formatCurrency";
import { OFFER_LIMITS } from "@/lib/enum";

/*
 * Mirrors ridex-backend/src/app/module/offer/offer.validation.ts.
 * The exact price window (floor, counter range) is checked by the server;
 * the form adds the bounds it knows (min / max) so most mistakes show inline.
 */
export const buildOfferZodSchema = (bounds: { min?: number; max?: number } = {}) =>
  z.object({
    amount: z
      .number({ message: "Enter an amount" })
      .int("Use a whole amount")
      .positive("Enter an amount")
      .refine((value) => bounds.min === undefined || value >= bounds.min, {
        message: `The lowest offer is ${formatCurrency(bounds.min ?? 0)}`,
      })
      .refine((value) => bounds.max === undefined || value <= bounds.max, {
        message: `The highest offer is ${formatCurrency(bounds.max ?? 0)}`,
      }),
    message: z
      .string()
      .trim()
      .max(OFFER_LIMITS.messageMax, `A note can be at most ${OFFER_LIMITS.messageMax} characters`),
  });

export type OfferInput = z.infer<ReturnType<typeof buildOfferZodSchema>>;

export const DeclineOfferZodSchema = z.object({
  reason: z.string().trim().max(OFFER_LIMITS.reasonMax, `A reason can be at most ${OFFER_LIMITS.reasonMax} characters`),
});

export type DeclineOfferInput = z.infer<typeof DeclineOfferZodSchema>;

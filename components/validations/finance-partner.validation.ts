import z from "zod";
import { LOAN_RATE_MAX_PERCENT, LOAN_TENURE_MAX_MONTHS, LOAN_TENURE_MIN_MONTHS } from "@/lib/emi";
import { SlugZodSchema } from "./vehicle-type.validation";

/*
 * Mirrors ridex-backend/src/app/module/financePartner/financePartner.validation.ts.
 * Number fields are kept as text in the form and converted in the action.
 */
const numberText = (label: string, min: number, max: number, { integer = false } = {}) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((value) => {
      const number = Number(value);
      return Number.isFinite(number) && (!integer || Number.isInteger(number));
    }, `${label} must be ${integer ? "a whole number" : "a number"}`)
    .refine((value) => Number(value) >= min && Number(value) <= max, `${label} must be between ${min} and ${max}`);

export const FinancePartnerZodSchema = z
  .object({
    name: z.string().trim().min(2, "Partner name is required").max(80, "Partner name must be at most 80 characters"),
    slug: SlugZodSchema,
    description: z.string().trim().max(500, "Description must be at most 500 characters"),
    contactEmail: z.email("Enter a valid contact email").trim(),
    contactPhone: z.string().trim().max(30, "Phone must be at most 30 characters"),
    website: z
      .string()
      .trim()
      .refine((value) => value === "" || z.url().safeParse(value).success, "Enter a valid website URL (https://…)"),
    interestRateMin: numberText("Lowest rate", 0, LOAN_RATE_MAX_PERCENT),
    interestRateMax: numberText("Highest rate", 0, LOAN_RATE_MAX_PERCENT),
    minDownPaymentPercent: numberText("Minimum down payment", 0, 90, { integer: true }),
    maxTenureMonths: numberText("Maximum tenure", LOAN_TENURE_MIN_MONTHS, LOAN_TENURE_MAX_MONTHS, { integer: true }),
    isActive: z.boolean(),
  })
  .refine((data) => Number(data.interestRateMin) <= Number(data.interestRateMax), {
    message: "The lowest rate cannot be higher than the highest rate",
    path: ["interestRateMax"],
  });

export type FinancePartnerInput = z.input<typeof FinancePartnerZodSchema>;

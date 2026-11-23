import z from "zod";
import { LOAN_NOTE_MAX } from "@/lib/emi";
import { PhoneZodSchema } from "./auth.validation";

/*
 * Mirrors ridex-backend/src/app/module/loanLead/loanLead.validation.ts.
 * The loan terms (down payment, tenure, rate) come from the EMI calculator;
 * the server re-checks them against the platform and partner limits.
 */
export const LoanLeadApplicantZodSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80, "Full name must be at most 80 characters"),
  phone: PhoneZodSchema,
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address"),
  district: z.string().trim().max(60, "District must be at most 60 characters"),
  monthlyIncome: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{1,9}$/.test(value), "Enter your monthly income in whole numbers"),
  employmentType: z.enum(["SALARIED", "SELF_EMPLOYED", "BUSINESS", "STUDENT", "OTHER"], {
    message: "Choose your employment type",
  }),
  note: z.string().trim().max(LOAN_NOTE_MAX, `Note must be at most ${LOAN_NOTE_MAX} characters`),
  consent: z.boolean().refine((value) => value, "Agree to share your details with a finance partner"),
});

export type LoanLeadApplicantInput = z.input<typeof LoanLeadApplicantZodSchema>;

export const LoanLeadAssignZodSchema = z.object({
  partnerId: z.string().min(1, "Choose a finance partner"),
  note: z.string().trim().max(LOAN_NOTE_MAX, `Note must be at most ${LOAN_NOTE_MAX} characters`),
});

export type LoanLeadAssignInput = z.input<typeof LoanLeadAssignZodSchema>;

export const LoanLeadStatusZodSchema = z
  .object({
    status: z.enum(["CONTACTED", "APPROVED", "REJECTED", "DISBURSED", "CLOSED"], { message: "Choose a status" }),
    note: z.string().trim().max(LOAN_NOTE_MAX, `Note must be at most ${LOAN_NOTE_MAX} characters`),
    partnerReference: z.string().trim().max(60, "Partner reference must be at most 60 characters"),
  })
  .refine((data) => !["REJECTED", "CLOSED"].includes(data.status) || data.note.length > 0, {
    message: "Add a reason the buyer will see",
    path: ["note"],
  });

export type LoanLeadStatusInput = z.input<typeof LoanLeadStatusZodSchema>;

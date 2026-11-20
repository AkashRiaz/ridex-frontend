import z from "zod";

/*
 * Mirrors ridex-backend/src/app/module/verification/verification.validation.ts
 * (documents are checked separately against VERIFICATION_DOCUMENTS).
 */
export const IdVerificationZodSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your name as written on the NID")
    .max(80, "Name must be at most 80 characters"),
  nidNumber: z
    .string()
    .trim()
    .regex(/^(\d{10}|\d{13}|\d{17})$/, "NID number must be 10, 13 or 17 digits"),
});

export type IdVerificationInput = z.infer<typeof IdVerificationZodSchema>;

export const DealerVerificationZodSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name is required")
    .max(100, "Business name must be at most 100 characters"),
  tradeLicenseNumber: z
    .string()
    .trim()
    .min(3, "Trade license number is required")
    .max(50, "Trade license number must be at most 50 characters"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  area: z.string().trim().max(100, "Area must be at most 100 characters"),
});

export type DealerVerificationInput = z.infer<typeof DealerVerificationZodSchema>;

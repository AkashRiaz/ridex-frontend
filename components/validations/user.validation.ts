import z from "zod";
import { BD_PHONE_REGEX } from "./auth.validation";

/*
 * Mirrors ridex-backend/src/app/module/user/user.validation.ts
 */

export const UpdateProfileZodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(80, "Name must be at most 80 characters long"),
  bio: z.string().trim().max(500, "Bio must be at most 500 characters long"),
  gender: z.string(),
  dateOfBirth: z
    .string()
    .refine(
      (value) => value === "" || new Date(value) <= new Date(),
      "Date of birth cannot be in the future",
    ),
  division: z.string().trim().max(60),
  district: z.string().trim().max(60, "District must be at most 60 characters"),
  area: z.string().trim().max(100, "Area must be at most 100 characters"),
});

export const CreateUserZodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(80, "Name must be at most 80 characters long"),
  email: z.email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => value === "" || BD_PHONE_REGEX.test(value), {
      message: "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
    }),
  role: z.enum(["ADMIN", "MODERATOR", "INSPECTOR", "DEALER", "SELLER", "BUYER"], {
    message: "Select a role",
  }),
});

export type UpdateProfileInput = z.input<typeof UpdateProfileZodSchema>;
export type CreateUserInput = z.input<typeof CreateUserZodSchema>;

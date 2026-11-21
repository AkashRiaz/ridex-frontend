import z from "zod";

/*
 * Mirrors ridex-backend/src/app/module/auth/auth.validation.ts
 */

export const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

export const PasswordZodSchema = z
  .string({ message: "Password is required" })
  .min(8, "Password Must Minimum 8 Characters Long.")
  .max(64, "Password must be at most 64 characters long")
  .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
  .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
  .regex(/[0-9]/, "Password must contain atleast 1 Number")
  .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character");

export const PhoneZodSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .refine((value) => BD_PHONE_REGEX.test(value), {
    message: "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
  });

const OptionalPhoneZodSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .refine((value) => value === "" || BD_PHONE_REGEX.test(value), {
    message: "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
  });

const OtpZodSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

const IdentifierZodSchema = z
  .string()
  .trim()
  .min(1, "Email or phone number is required");

export const LoginZodSchema = z.object({
  identifier: IdentifierZodSchema,
  password: z.string().min(1, "Password is required"),
});

export const RegisterZodSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(80, "Name must be at most 80 characters long"),
    email: z
      .string()
      .trim()
      .refine((value) => value === "" || z.email().safeParse(value).success, {
        message: "Invalid email address",
      }),
    phone: OptionalPhoneZodSchema,
    password: PasswordZodSchema,
    confirmPassword: z.string(),
    role: z.enum(["BUYER", "SELLER", "DEALER"], {
      message: "Choose how you will use the platform",
    }),
  })
  .refine((data) => data.email || data.phone, {
    message: "Enter an email or a phone number",
    path: ["email"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const VerifyEmailZodSchema = z.object({
  email: z.email("Invalid email address"),
  otp: OtpZodSchema,
});

export const PhoneOtpRequestZodSchema = z.object({
  phone: PhoneZodSchema,
});

export const VerifyPhoneOtpZodSchema = z.object({
  phone: PhoneZodSchema,
  otp: OtpZodSchema,
  purpose: z.enum(["VERIFY", "LOGIN"]),
});

// form-side schemas: `purpose` is added by the action, not typed by the user
export const PhoneOtpCodeZodSchema = z.object({
  otp: OtpZodSchema,
});

export const VerifyPhoneFormZodSchema = z.object({
  phone: PhoneZodSchema,
  otp: OtpZodSchema,
});

export const ForgotPasswordZodSchema = z.object({
  identifier: IdentifierZodSchema,
});

export const ResetPasswordZodSchema = z
  .object({
    identifier: IdentifierZodSchema,
    otp: OtpZodSchema,
    newPassword: PasswordZodSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ChangePasswordZodSchema = z
  .object({
    oldPassword: z.string(),
    newPassword: PasswordZodSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export type LoginInput = z.input<typeof LoginZodSchema>;
export type RegisterInput = z.input<typeof RegisterZodSchema>;
export type VerifyEmailInput = z.input<typeof VerifyEmailZodSchema>;
export type ForgotPasswordInput = z.input<typeof ForgotPasswordZodSchema>;
export type ResetPasswordInput = z.input<typeof ResetPasswordZodSchema>;
export type ChangePasswordInput = z.input<typeof ChangePasswordZodSchema>;

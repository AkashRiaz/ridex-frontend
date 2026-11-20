"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ForgotPasswordZodSchema,
  LoginZodSchema,
  PhoneOtpRequestZodSchema,
  RegisterZodSchema,
  ResetPasswordZodSchema,
  VerifyEmailZodSchema,
  VerifyPhoneOtpZodSchema,
} from "@/components/validations/auth.validation";
import { resolvePostLoginPath } from "@/lib/dashboardPath";
import { setAuthCookies } from "@/service/authCookies";
import { baseApi } from "@/service/baseApi";
import {
  TActionState,
  TAuthResponseData,
  TPhoneOtpPurpose,
  TRegisterResponseData,
} from "@/types";

export type AuthActionState = TActionState;

const getText = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

const validationError = (message?: string): AuthActionState => ({
  success: false,
  message: message || "Please check the form and try again",
  statusCode: 400,
});

/*
 * Stores tokens and redirects to the right dashboard.
 * redirect() must stay outside try/catch (it throws NEXT_REDIRECT).
 */
const completeSignIn = async (
  data: TAuthResponseData,
  redirectTo?: string,
): Promise<never> => {
  await setAuthCookies({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  redirect(
    resolvePostLoginPath({
      role: data.user.role,
      redirectTo,
      needPasswordChange: data.user.needPasswordChange,
    }),
  );
};

// ============================================
// Login
// ============================================

export const loginAction = async (
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> => {
  const validation = LoginZodSchema.safeParse({
    identifier: getText(formData, "identifier"),
    password: String(formData.get("password") ?? ""),
  });

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message);
  }

  const result = await baseApi<TAuthResponseData>("/auth/login", {
    method: "POST",
    body: validation.data,
    auth: false,
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message,
      statusCode: result.statusCode,
    };
  }

  return completeSignIn(result.data, getText(formData, "redirectTo"));
};

// ============================================
// Register
// ============================================

export const registerAction = async (
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> => {
  const validation = RegisterZodSchema.safeParse({
    name: getText(formData, "name"),
    email: getText(formData, "email"),
    phone: getText(formData, "phone"),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    role: getText(formData, "role"),
  });

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message);
  }

  const { email, phone, name, password, role } = validation.data;

  const result = await baseApi<TRegisterResponseData>("/auth/register", {
    method: "POST",
    body: {
      name,
      password,
      role,
      ...(email && { email }),
      ...(phone && { phone }),
    },
    auth: false,
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message,
      statusCode: result.statusCode,
    };
  }

  const { user } = result.data;

  // email first; phone can also be verified later from the profile
  if (user.email) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email)}`);
  }

  redirect(`/verify-phone?phone=${encodeURIComponent(user.phone ?? "")}`);
};

// ============================================
// Email verification
// ============================================

export const verifyEmailAction = async (
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> => {
  const validation = VerifyEmailZodSchema.safeParse({
    email: getText(formData, "email"),
    otp: getText(formData, "otp"),
  });

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message);
  }

  const result = await baseApi<TAuthResponseData>("/auth/verify-email", {
    method: "POST",
    body: validation.data,
    auth: false,
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message,
      statusCode: result.statusCode,
    };
  }

  return completeSignIn(result.data);
};

export const resendEmailOtpAction = async (
  email: string,
): Promise<AuthActionState> => {
  if (!email) return { success: false, message: "Email is required" };

  const result = await baseApi("/auth/resend-email-otp", {
    method: "POST",
    body: { email },
    auth: false,
  });

  return {
    success: result.success,
    message: result.success ? "A new code has been sent" : result.message,
    statusCode: result.statusCode,
  };
};

// ============================================
// Phone OTP (verify + passwordless login)
// ============================================

export const sendPhoneOtpAction = async (
  phone: string,
  purpose: TPhoneOtpPurpose,
): Promise<AuthActionState> => {
  const validation = PhoneOtpRequestZodSchema.safeParse({ phone });

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message);
  }

  const result = await baseApi("/auth/phone-otp/send", {
    method: "POST",
    body: { phone: validation.data.phone, purpose },
    auth: false,
  });

  return {
    success: result.success,
    message: result.success ? "Code sent to your phone" : result.message,
    statusCode: result.statusCode,
  };
};

export const verifyPhoneOtpAction = async (
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> => {
  const validation = VerifyPhoneOtpZodSchema.safeParse({
    phone: getText(formData, "phone"),
    otp: getText(formData, "otp"),
    purpose: getText(formData, "purpose"),
  });

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message);
  }

  const result = await baseApi<TAuthResponseData>("/auth/phone-otp/verify", {
    method: "POST",
    body: validation.data,
    auth: false,
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message,
      statusCode: result.statusCode,
    };
  }

  return completeSignIn(result.data, getText(formData, "redirectTo"));
};

// ============================================
// Forgot / reset password
// ============================================

export const forgotPasswordAction = async (
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> => {
  const validation = ForgotPasswordZodSchema.safeParse({
    identifier: getText(formData, "identifier"),
  });

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message);
  }

  const result = await baseApi<{ channel: "EMAIL" | "PHONE" }>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: validation.data,
      auth: false,
    },
  );

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      statusCode: result.statusCode,
    };
  }

  redirect(
    `/reset-password?identifier=${encodeURIComponent(validation.data.identifier)}&channel=${result.data?.channel ?? "EMAIL"}`,
  );
};

export const resendForgotPasswordOtpAction = async (
  identifier: string,
): Promise<AuthActionState> => {
  const result = await baseApi("/auth/forgot-password", {
    method: "POST",
    body: { identifier },
    auth: false,
  });

  return {
    success: result.success,
    message: result.success ? "A new code has been sent" : result.message,
    statusCode: result.statusCode,
  };
};

export const resetPasswordAction = async (
  _prevState: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> => {
  const validation = ResetPasswordZodSchema.safeParse({
    identifier: getText(formData, "identifier"),
    otp: getText(formData, "otp"),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message);
  }

  const { identifier, otp, newPassword } = validation.data;

  const result = await baseApi("/auth/reset-password", {
    method: "POST",
    body: { identifier, otp, newPassword },
    auth: false,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      statusCode: result.statusCode,
    };
  }

  redirect("/login?reset=success");
};

// ============================================
// Logout
// ============================================

export const logout = async (): Promise<void> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    await fetch(`${process.env.BACKEND_API_URL}/auth/logout`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    }).catch(() => null);
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
};

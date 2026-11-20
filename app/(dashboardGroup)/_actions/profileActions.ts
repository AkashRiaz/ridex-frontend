"use server";

import { redirect } from "next/navigation";
import {
  ChangePasswordZodSchema,
  VerifyPhoneOtpZodSchema,
} from "@/components/validations/auth.validation";
import { UpdateProfileZodSchema } from "@/components/validations/user.validation";
import { clearAuthCookies, setAuthCookies } from "@/service/authCookies";
import { baseApi } from "@/service/baseApi";
import { IUser, TActionState, TAuthResponseData } from "@/types";

export type ProfileActionState = TActionState<IUser>;

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const emptyToNull = (value: string) => (value === "" ? null : value);

export const getMyProfileAction = async () => baseApi<IUser>("/users/me");

export const updateMyProfileAction = async (
  _prevState: ProfileActionState | null,
  formData: FormData,
): Promise<ProfileActionState> => {
  const validation = UpdateProfileZodSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    division: String(formData.get("division") ?? ""),
    district: String(formData.get("district") ?? ""),
    area: String(formData.get("area") ?? ""),
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid profile information",
      statusCode: 400,
    };
  }

  const avatar = formData.get("avatar");
  const hasAvatar = avatar instanceof File && avatar.size > 0;

  if (hasAvatar) {
    if (!avatar.type.startsWith("image/")) {
      return { success: false, message: "Avatar must be an image", statusCode: 400 };
    }

    if (avatar.size > MAX_AVATAR_SIZE) {
      return { success: false, message: "Avatar must be 5MB or smaller", statusCode: 400 };
    }
  }

  const { name, bio, gender, dateOfBirth, division, district, area } = validation.data;

  const payload = {
    name,
    bio: emptyToNull(bio),
    gender: emptyToNull(gender),
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
    division: emptyToNull(division),
    district: emptyToNull(district),
    area: emptyToNull(area),
  };

  // multipart: avatar file + JSON "data" field (backend validateRequest pattern)
  const backendFormData = new FormData();
  backendFormData.append("data", JSON.stringify(payload));

  if (hasAvatar) {
    backendFormData.append("avatar", avatar);
  }

  const result = await baseApi<IUser>("/users/me", {
    method: "PATCH",
    formData: backendFormData,
  });

  return {
    success: result.success,
    message: result.success ? "Profile updated successfully" : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

export const changePasswordAction = async (
  _prevState: TActionState | null,
  formData: FormData,
): Promise<TActionState> => {
  const validation = ChangePasswordZodSchema.safeParse({
    oldPassword: String(formData.get("oldPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid password",
      statusCode: 400,
    };
  }

  const { oldPassword, newPassword } = validation.data;

  const result = await baseApi<TAuthResponseData>("/auth/change-password", {
    method: "POST",
    body: {
      newPassword,
      ...(oldPassword && { oldPassword }),
    },
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message,
      statusCode: result.statusCode,
    };
  }

  // every other session was revoked; keep this device signed in
  await setAuthCookies({
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
  });

  return {
    success: true,
    message: "Password changed successfully",
    statusCode: result.statusCode,
  };
};

export const sendMyPhoneOtpAction = async (phone: string): Promise<TActionState> => {
  const result = await baseApi("/auth/phone-otp/send", {
    method: "POST",
    body: { phone, purpose: "VERIFY" },
    auth: false,
  });

  return {
    success: result.success,
    message: result.success ? "Code sent to your phone" : result.message,
    statusCode: result.statusCode,
  };
};

export const verifyMyPhoneAction = async (
  phone: string,
  otp: string,
): Promise<TActionState> => {
  const validation = VerifyPhoneOtpZodSchema.safeParse({
    phone,
    otp,
    purpose: "VERIFY",
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid code",
      statusCode: 400,
    };
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

  await setAuthCookies({
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
  });

  return {
    success: true,
    message: "Phone verified successfully",
    statusCode: result.statusCode,
  };
};

export const deleteMyAccountAction = async (
  password: string,
): Promise<TActionState> => {
  const result = await baseApi("/users/me", {
    method: "DELETE",
    body: password ? { password } : {},
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      statusCode: result.statusCode,
    };
  }

  await clearAuthCookies();

  redirect("/?account=deleted");
};

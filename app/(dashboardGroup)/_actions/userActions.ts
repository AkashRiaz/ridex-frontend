"use server";

import { CreateUserZodSchema } from "@/components/validations/user.validation";
import { baseApi } from "@/service/baseApi";
import { IUser, Role, TActionState, TApiResponse, TSearchParams } from "@/types";

export type UserResponse = TApiResponse<IUser[]>;

export type UserActionState = TActionState<IUser>;

const LIST_QUERY_KEYS = [
  "searchTerm",
  "page",
  "limit",
  "sortBy",
  "sortOrder",
  "role",
  "status",
  "isDeleted",
];

export const getAllUsersAction = async ({
  query,
}: { query?: TSearchParams } = {}): Promise<UserResponse> => {
  const filteredQuery = Object.fromEntries(
    Object.entries(query ?? {}).filter(([key]) => LIST_QUERY_KEYS.includes(key)),
  );

  return baseApi<IUser[]>("/users", {
    query: { limit: "10", ...filteredQuery },
  });
};

export const getUserByIdAction = async (userId: string) => {
  if (!userId) {
    return {
      success: false,
      message: "User ID is required",
      statusCode: 400,
      data: null,
    } satisfies TApiResponse<IUser>;
  }

  return baseApi<IUser>(`/users/${userId}`);
};

export const createUserAction = async (
  _previousState: UserActionState | null,
  formData: FormData,
): Promise<UserActionState> => {
  const validation = CreateUserZodSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    role: String(formData.get("role") ?? ""),
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid user information",
      statusCode: 400,
      data: null,
    };
  }

  const { phone, ...rest } = validation.data;

  const result = await baseApi<IUser>("/users", {
    method: "POST",
    body: { ...rest, ...(phone && { phone }) },
  });

  return {
    success: result.success,
    message: result.success
      ? "User created and login details emailed"
      : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

export const updateUserStatusAction = async (
  userId: string,
  status: "ACTIVE" | "BLOCKED",
  reason?: string,
): Promise<UserActionState> => {
  const result = await baseApi<IUser>(`/users/${userId}/status`, {
    method: "PATCH",
    body: { status, ...(reason && { reason }) },
  });

  return {
    success: result.success,
    message: result.success
      ? status === "BLOCKED"
        ? "User blocked successfully"
        : "User activated successfully"
      : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

export const updateUserRoleAction = async (
  userId: string,
  role: Role,
): Promise<UserActionState> => {
  const result = await baseApi<IUser>(`/users/${userId}/role`, {
    method: "PATCH",
    body: { role },
  });

  return {
    success: result.success,
    message: result.success ? "Role updated successfully" : result.message,
    statusCode: result.statusCode,
    data: result.data,
  };
};

export const deleteUserAction = async (userId: string): Promise<UserActionState> => {
  const result = await baseApi<IUser>(`/users/${userId}`, { method: "DELETE" });

  return {
    success: result.success,
    message: result.success ? "User deleted successfully" : result.message,
    statusCode: result.statusCode,
  };
};

export const restoreUserAction = async (userId: string): Promise<UserActionState> => {
  const result = await baseApi<IUser>(`/users/${userId}/restore`, {
    method: "PATCH",
  });

  return {
    success: result.success,
    message: result.success ? "User restored successfully" : result.message,
    statusCode: result.statusCode,
  };
};

// Keep in sync with ridex-backend/prisma/schema/enums.prisma
export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MODERATOR"
  | "DEALER"
  | "DEALER_STAFF"
  | "SELLER"
  | "INSPECTOR"
  | "BUYER";

export type AuthProvider = "CREDENTIALS" | "GOOGLE" | "PHONE";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  meta?: TMeta | null;
};

/*
 * Shape every server action returns to a form (useActionState).
 */
export type TActionState<T = null> = {
  success: boolean;
  message: string;
  statusCode?: number;
  data?: T | null;
};

export type TSearchParams = {
  [key: string]: string | string[] | undefined;
};

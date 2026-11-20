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

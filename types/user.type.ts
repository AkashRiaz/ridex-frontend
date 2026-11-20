import { AuthProvider, Gender, Role, UserStatus } from "./common.type";

export interface IUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  authProvider: AuthProvider;
  emailVerified: boolean;
  phoneVerified: boolean;
  role: Role;
  status: UserStatus;
  needPasswordChange: boolean;
  passwordChangedAt: string | null;
  imageUrl: string | null;
  bio: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  division: string | null;
  district: string | null;
  area: string | null;
  blockedReason: string | null;
  blockedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUserResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  data?: IUser | null;
}

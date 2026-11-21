import { Role } from "./common.type";

// Keep in sync with ridex-backend prisma/schema/enums.prisma (AuditAction)
export type TAuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "APPROVE"
  | "REJECT"
  | "PUBLISH"
  | "CANCEL"
  | "PAYMENT";

export type TAuditData = Record<string, unknown> | unknown[] | string | number | boolean | null;

export type IAuditLog = {
  id: string;
  userId: string | null;
  action: TAuditAction;
  entity: string;
  entityId: string | null;
  // sensitive keys arrive as "[redacted]"
  oldData: TAuditData;
  newData: TAuditData;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: Role;
    imageUrl: string | null;
  } | null;
};

export type IAuditLogEntity = {
  entity: string;
  count: number;
};

import { ISidebarGroup } from "@/lib/type";
import { Role } from "@/types";
import { adminRoutes } from "./admin.routes";
import { buyerRoutes } from "./buyer.routes";
import { dealerRoutes } from "./dealer.routes";
import { dealerStaffRoutes } from "./dealerStaff.routes";
import { inspectorRoutes } from "./inspector.routes";
import { moderatorRoutes } from "./moderator.routes";
import { sellerRoutes } from "./seller.routes";
import { superAdminRoutes } from "./superAdmin.routes";

export * from "./superAdmin.routes";
export * from "./admin.routes";
export * from "./moderator.routes";
export * from "./dealer.routes";
export * from "./dealerStaff.routes";
export * from "./seller.routes";
export * from "./inspector.routes";
export * from "./buyer.routes";

export const roleRoutes: Record<Role, ISidebarGroup[]> = {
  SUPER_ADMIN: superAdminRoutes,
  ADMIN: adminRoutes,
  MODERATOR: moderatorRoutes,
  DEALER: dealerRoutes,
  DEALER_STAFF: dealerStaffRoutes,
  SELLER: sellerRoutes,
  INSPECTOR: inspectorRoutes,
  BUYER: buyerRoutes,
};

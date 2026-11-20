import { ISidebarGroup } from "@/lib/type";
import { LayoutDashboard } from "lucide-react";

const prefix = "/super-admin-dashboard";

export const superAdminRoutes: ISidebarGroup[] = [
  {
    title: "Super Admin",
    items: [
      {
        label: "Overview",
        href: `${prefix}`,
        icon: LayoutDashboard,
      },
    ],
  },
];

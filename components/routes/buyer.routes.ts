import { ISidebarGroup } from "@/lib/type";
import { LayoutDashboard } from "lucide-react";

const prefix = "/buyer-dashboard";

export const buyerRoutes: ISidebarGroup[] = [
  {
    title: "Buyer",
    items: [
      {
        label: "Overview",
        href: `${prefix}`,
        icon: LayoutDashboard,
      },
    ],
  },
];

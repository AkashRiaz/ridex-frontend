import { ISidebarGroup } from "@/lib/type";
import { LayoutDashboard } from "lucide-react";

const prefix = "/dealer-dashboard";

export const dealerRoutes: ISidebarGroup[] = [
  {
    title: "Dealer",
    items: [
      {
        label: "Overview",
        href: `${prefix}`,
        icon: LayoutDashboard,
      },
    ],
  },
];

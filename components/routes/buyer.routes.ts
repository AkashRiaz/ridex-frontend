import { ISidebarGroup } from "@/lib/type";
import { LayoutDashboard, UserRound } from "lucide-react";

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
  {
    title: "Account",
    items: [
      {
        label: "My Profile",
        href: `${prefix}/profile`,
        icon: UserRound,
      },
    ],
  },
];

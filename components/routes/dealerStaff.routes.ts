import { ISidebarGroup } from "@/lib/type";
import { LayoutDashboard, UserRound } from "lucide-react";

const prefix = "/dealer-staff-dashboard";

export const dealerStaffRoutes: ISidebarGroup[] = [
  {
    title: "Dealer Staff",
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

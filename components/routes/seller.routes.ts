import { ISidebarGroup } from "@/lib/type";
import { LayoutDashboard, UserRound } from "lucide-react";

const prefix = "/seller-dashboard";

export const sellerRoutes: ISidebarGroup[] = [
  {
    title: "Seller",
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
